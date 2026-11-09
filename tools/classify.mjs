// classify.cjs — 清洗 + 去重 + 排除 + 自动分类 → src/data/bookmarks.json
// 用法: node tools/classify.cjs
import fs from 'fs';
import path from 'path';
import { EXCLUDE_DOMAINS, EXCLUDE_URL_PARTS, urlHasSexKeyword, EXCLUDE_FOLDERS, EXCLUDE_TITLE, DESC, RULES, KEYWORD_RULES, isLocalHost } from './rules.mjs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'raw-bookmarks.json'), 'utf8'));

// ── URL 规范化 ──
function normalizeUrl(u) {
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return null;
    // 内嵌账号密码的 URL 一律拒绝（公开仓库泄密风险）
    if (url.username || url.password) return null;
    url.hash = '';
    const drop = [...url.searchParams.keys()].filter(k => /^(utm_|ref|source|fbclid|gclid|spm|from|vd_source)/i.test(k));
    drop.forEach(k => url.searchParams.delete(k));
    let s = url.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch (e) { return null; }
}

function hostname(u) {
  try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; }
}

// 与 normalizeUrl 同口径, 供死链排除先行比对（normalizeUrl 会拒绝 userinfo 等, 这里只做规范化）
function normalizeUrlRaw(u) {
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return null;
    url.hash = '';
    const drop = [...url.searchParams.keys()].filter(k => /^(utm_|ref|source|fbclid|gclid|spm|from|vd_source)/i.test(k));
    drop.forEach(k => url.searchParams.delete(k));
    let s = url.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch (e) { return null; }
}

// query 参数含敏感凭证 → 拒绝发布（公开仓库泄密风险）
const SENSITIVE_PARAM = /^(token|access_token|key|apikey|api_key|secret|password|passwd|pwd|auth|authorization|session|sid|sig|signature|invite_code|invitecode)$/i;
function hasSensitiveParam(u) {
  try {
    const url = new URL(u);
    for (const k of url.searchParams.keys()) if (SENSITIVE_PARAM.test(k)) return true;
    return false;
  } catch (e) { return true; }
}

// ── 1. 排除 ──
const excluded = [];
// 链接审计死链（tools/linkcheck.mjs 产物；用户拍板：死链直接剔除）
let deadSet = new Set();
const reportPath = path.join(__dirname, 'link-report.json');
if (fs.existsSync(reportPath)) {
  try {
    const rep = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    deadSet = new Set((rep.dead || []).map(d => d.url));
    console.log('link-report 载入: ' + deadSet.size + ' 条死链参与剔除');
  } catch (e) { console.log('link-report 解析失败, 跳过死链剔除'); }
}
function isExcluded(b) {
  const h = hostname(b.url);
  const fu = b.folders.join('/');
  if (isLocalHost(h)) return 'local';
  if (hasSensitiveParam(b.url)) return 'sensitive-param';
  if (deadSet.size) {
    const nu = normalizeUrlRaw(b.url);
    if (nu && deadSet.has(nu)) return 'dead-link';
  }
  for (const d of EXCLUDE_DOMAINS) if (h === d || h.endsWith('.' + d)) return 'domain:' + d;
  const lu = b.url.toLowerCase();
  for (const p of EXCLUDE_URL_PARTS) if (lu.includes(p)) return 'url:' + p;
  if (urlHasSexKeyword(b.url)) return 'url:sex(standalone)';
  for (const f of EXCLUDE_FOLDERS) if (fu.includes(f)) return 'folder:' + f;
  if (EXCLUDE_TITLE.test(b.title)) return 'title-match';
  return null;
}

// ── 2. 标题清洗 ──
// 无信息量的页面标题(未加载完/登录页/后台面板) → 回退用域名展示
const JUNK_TITLE = /^(请稍候|Loading|Untitled|无标题|新建聊天|新建|首页|Home|登录|Login|Sign ?up|注册|选择服务|我的邀请|用户中心|管理平台|后台|控制台|仪表盘|Dashboard|\(22\)|About|Index)/i;
function cleanTitle(t, u) {
  let s = t.replace(/\s*[-–—|]\s*[^|]{0,30}(XVIDEOS|XVIDEOS\.COM|xhamster|thumbzilla|pornhub|Google Chrome|YouTube|哔哩哔哩|bilibili|百度|知乎|CSDN博客|博客园|- YouTube|Video)/gi, '').trim();
  s = s.replace(/_(XVIDEOS\.COM|xhamster\w*)$/i, '').replace(/\s*\|\s*[^|]*$/, '').trim();
  // " --- 副本站名" / " — xxx" 尾部残渣（页面标题常见 A --- B 双写）
  s = s.replace(/\s+---+\s+.*$/, '').replace(/\s+—\s+.*$/, '').trim();
  // (22) 之类序号前缀
  s = s.replace(/^\(\d+\)\s*/, '').trim();
  if (!s || JUNK_TITLE.test(s)) s = hostname(u);
  if (s.length > 80) s = s.slice(0, 77) + '…';
  return s;
}

// ── 3. 分类 ──
function classify(b) {
  const h = hostname(b.url);
  for (const [re, cat] of RULES) {
    try { if (re.test(h)) return cat; } catch (e) {}
  }
  const text = b.title + ' ' + b.url;
  for (const r of KEYWORD_RULES) {
    if (r.re.test(text)) return r.cat;
  }
  return ['待整理', null];
}

// ── 主流程 ──
const seen = new Map();
let dupCount = 0;
for (const b of raw) {
  const ex = isExcluded(b);
  if (ex) { excluded.push({ url: b.url.slice(0, 100), reason: ex }); continue; }
  const nu = normalizeUrl(b.url);
  if (!nu) { excluded.push({ url: b.url.slice(0, 100), reason: 'invalid-url' }); continue; }
  const key = nu.replace(/^https?:/, '');
  if (seen.has(key)) { dupCount++; continue; }
  const h = hostname(nu);
  const clean = cleanTitle(b.title, nu);
  // title 一律用页面标题(不折叠同站不同页); desc 用介绍库, 无介绍时回退标题(前端 desc===title 时不渲染)
  const desc = DESC[h] || clean;
  const [c1, c2] = classify({ ...b, url: nu });
  const show1 = c1 === '待整理' ? '其他' : c1;
  seen.set(key, {
    title: clean,
    url: nu,
    desc,
    cat: show1,
    sub: c2 || '',
    host: h,
    added: b.added,
    profile: b.profile,
  });
}

const items = [...seen.values()];
// 折叠同域名+同标题的残页（不同 query 参数打开的同一控制台等）
const byKey = new Map();
for (const it of items) {
  const k = it.host + '|' + it.title;
  if (!byKey.has(k)) byKey.set(k, it);
}
const deduped = [...byKey.values()];

// ── 同网站折叠：一个注册域名只留一张卡（导航站语义，用户要求去重）──
// 例: github.com 23 条 → 1 条; blog.csdn.net 7 条 → 1 条; ubfgho.com 子域 10 条 → 1 条
const TWO_PART_TLD = new Set(['com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'co.uk', 'com.hk', 'com.tw', 'co.jp', 'com.au', 'com.br', 'co.kr', 'com.sg', 'co.nz', 'com.mx']);
function registrableDomain(host) {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  if (TWO_PART_TLD.has(parts.slice(-2).join('.'))) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}
function isRootUrl(it) {
  try { const u = new URL(it.url); return (u.pathname === '/' || u.pathname === '') && !u.search; } catch (e) { return false; }
}
function pickBetter(a, b) {
  // 返回 a/b 中更适合展示的一条：根路径 > 有介绍 > 标题短
  const ar = isRootUrl(a), br = isRootUrl(b);
  if (ar !== br) return ar ? a : b;
  const ad = a.desc !== a.title, bd = b.desc !== b.title;
  if (ad !== bd) return ad ? a : b;
  return (a.title || '').length <= (b.title || '').length ? a : b;
}
const byDomain = new Map();
for (const it of deduped) {
  const key = registrableDomain(it.host);
  const cur = byDomain.get(key);
  byDomain.set(key, cur ? pickBetter(it, cur) : it);
}
const finalItems = [...byDomain.values()];

finalItems.sort((a, b) => (a.cat + a.sub).localeCompare(b.cat + b.sub, 'zh') || a.host.localeCompare(b.host));

// ── 统计报告 ──
const byCat = {};
for (const it of finalItems) { const k = it.cat + (it.sub ? '/' + it.sub : ''); byCat[k] = (byCat[k] || 0) + 1; }
const report = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => '  ' + k.padEnd(24) + ' ' + v);

console.log('raw: ' + raw.length);
console.log('kept: ' + finalItems.length + '  (url-dedup ' + dupCount + ', same-host-title ' + (items.length - deduped.length) + ', same-site ' + (deduped.length - finalItems.length) + ')');
console.log('excluded: ' + excluded.length);
console.log('\n分类分布:');
console.log(report.join('\n'));
const pending = byCat['待整理'] || 0;
console.log('\n待整理占比: ' + (pending / finalItems.length * 100).toFixed(1) + '%');

fs.writeFileSync(path.join(__dirname, 'excluded-log.json'), JSON.stringify(excluded, null, 1));
fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/bookmarks.json'), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  total: finalItems.length,
  items: finalItems,
}, null, 1), 'utf8');
console.log('-> src/data/bookmarks.json written');
