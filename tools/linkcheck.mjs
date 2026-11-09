// linkcheck.mjs — 全量链接存活审计（真实调用验收数据源）
// 用法: NODE_USE_ENV_PROXY=1 node tools/linkcheck.mjs
//   Node 内置 fetch 默认不走 HTTP(S)_PROXY 环境变量, 必须加 NODE_USE_ENV_PROXY=1
//   产出 tools/link-report.json + 控制台摘要
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

if (!process.env.NODE_USE_ENV_PROXY && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
  console.error('需要代理环境: 请用  NODE_USE_ENV_PROXY=1 node tools/linkcheck.mjs  运行');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/bookmarks.json'), 'utf8'));

const TIMEOUT = 15000;
const CONCURRENCY = 12;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

// 判定: error/timeout/404/410 = 死; 其余(含 401/403/405/429/5xx) = 站活着(反爬/临时故障)
function isDead(status) {
  return status === 'timeout' || status === 'error' || status === 404 || status === 410;
}

async function probe(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  const opt = { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } };
  try {
    let res = await fetch(url, { method: 'HEAD', ...opt });
    if ([403, 405, 501].includes(res.status)) {
      res = await fetch(url, { method: 'GET', ...opt, headers: { 'User-Agent': UA, Range: 'bytes=0-2047' } });
    }
    return res.status;
  } catch (e) {
    return e.name === 'AbortError' ? 'timeout' : 'error';
  } finally { clearTimeout(t); }
}

async function check(item) {
  let s = await probe(item.url);
  if (isDead(s)) {
    await new Promise(r => setTimeout(r, 2000));
    s = await probe(item.url); // 一轮重试, 排除偶发
  }
  return { host: item.host, url: item.url, cat: item.cat, status: s };
}

const results = [];
let done = 0;
const queue = [...data.items];
async function worker() {
  while (queue.length) {
    results.push(await check(queue.shift()));
    if (++done % 100 === 0) console.log('progress: ' + done + '/' + data.total);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const dead = results.filter(r => isDead(r.status));
const ok = results.length - dead.length;
const byStatus = {};
for (const r of dead) byStatus[r.status] = (byStatus[r.status] || 0) + 1;

fs.writeFileSync(path.join(__dirname, 'link-report.json'), JSON.stringify({
  checked: results.length,
  generated: new Date().toISOString().slice(0, 10),
  dead,
  alive: results.filter(r => !isDead(r.status)).map(r => ({ url: r.url, status: r.status })),
}, null, 1));
console.log('\n=== 审计完成 ===');
console.log('存活: ' + ok + ' / ' + results.length);
console.log('死链: ' + dead.length + '  状态分布: ' + JSON.stringify(byStatus));
console.log('\n死链清单:');
for (const d of dead) console.log('  [' + d.status + '] ' + d.host + ' | ' + d.url.slice(0, 90));
