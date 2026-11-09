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

// ── 1. 排除 ──
const excluded = [];
function isExcluded(b) {
  const h = hostname(b.url);
  const fu = b.folders.join('/');
  if (isLocalHost(h)) return 'local';
  for (const d of EXCLUDE_DOMAINS) if (h === d || h.endsWith('.' + d)) return 'domain:' + d;
  const lu = b.url.toLowerCase();
  for (const p of EXCLUDE_URL_PARTS) if (lu.includes(p)) return 'url:' + p;
  if (urlHasSexKeyword(b.url)) return 'url:sex(standalone)';
  for (const f of EXCLUDE_FOLDERS) if (fu.includes(f)) return 'folder:' + f;
  if (EXCLUDE_TITLE.test(b.title)) return 'title-match';
  return null;
}

// ── 2. 标题清洗 ──
function cleanTitle(t, u) {
  let s = t.replace(/\s*[-–—|]\s*[^|]{0,30}(XVIDEOS|XVIDEOS\.COM|xhamster|thumbzilla|pornhub|Google Chrome|YouTube|哔哩哔哩|bilibili|百度|知乎|CSDN博客|博客园|- YouTube|Video)/gi, '').trim();
  s = s.replace(/_(XVIDEOS\.COM|xhamster\w*)$/i, '').replace(/\s*\|\s*[^|]*$/, '').trim();
  if (!s) s = hostname(u);
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
  const desc = DESC[h] || cleanTitle(b.title, nu);
  const [c1, c2] = classify({ ...b, url: nu });
  const show1 = c1 === '待整理' ? '其他' : c1;
  seen.set(key, {
    title: DESC[h] ? h : cleanTitle(b.title, nu),
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
deduped.sort((a, b) => (a.cat + a.sub).localeCompare(b.cat + b.sub, 'zh') || a.host.localeCompare(b.host));

// ── 统计报告 ──
const byCat = {};
for (const it of deduped) { const k = it.cat + (it.sub ? '/' + it.sub : ''); byCat[k] = (byCat[k] || 0) + 1; }
const report = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => '  ' + k.padEnd(24) + ' ' + v);

console.log('raw: ' + raw.length);
console.log('kept: ' + deduped.length + '  (url-dedup ' + dupCount + ', same-host-title folded ' + (items.length - deduped.length) + ')');
console.log('excluded: ' + excluded.length);
console.log('\n分类分布:');
console.log(report.join('\n'));
const pending = byCat['待整理'] || 0;
console.log('\n待整理占比: ' + (pending / deduped.length * 100).toFixed(1) + '%');

fs.writeFileSync(path.join(__dirname, 'excluded-log.json'), JSON.stringify(excluded, null, 1));
fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/bookmarks.json'), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  total: deduped.length,
  items: deduped,
}, null, 1), 'utf8');
console.log('-> src/data/bookmarks.json written');
