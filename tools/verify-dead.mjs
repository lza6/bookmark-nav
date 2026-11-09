// verify-dead.mjs — 死链复核：对 link-report 中 404/timeout 的条目用 GET 重测, 复活者从清单移除
// 用法: NODE_USE_ENV_PROXY=1 node tools/verify-dead.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

if (!process.env.NODE_USE_ENV_PROXY && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY)) {
  console.error('需要 NODE_USE_ENV_PROXY=1');
  process.exit(1);
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repPath = path.join(__dirname, 'link-report.json');
const rep = JSON.parse(fs.readFileSync(repPath, 'utf8'));

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const targets = rep.dead.filter(d => d.status === 404 || d.status === 'timeout');
console.log('复核对象: ' + targets.length + ' 条 (404 + timeout)');

async function verify(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'GET', redirect: 'follow', signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' },
    });
    // 消费少量 body 确保服务端真的在响应
    try { await res.arrayBuffer(); } catch (e) {}
    return res.status;
  } catch (e) {
    return e.name === 'AbortError' ? 'timeout' : 'error';
  } finally { clearTimeout(t); }
}

const revived = [];
let done = 0;
const queue = [...targets];
async function worker() {
  while (queue.length) {
    const d = queue.shift();
    await new Promise(r => setTimeout(r, 300)); // 缓速防封
    let s = await verify(d.url);
    if (s === 'timeout' || s === 'error') {
      await new Promise(r => setTimeout(r, 2500));
      s = await verify(d.url);
    }
    console.log('[' + s + '] ' + d.url.slice(0, 80));
    if (typeof s === 'number' && s < 400) revived.push(d.url);
    if (++done % 20 === 0) console.log('-- ' + done + '/' + targets.length);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

const alive = new Set(revived);
rep.dead = rep.dead.filter(d => !alive.has(d.url));
for (const u of revived) rep.alive.push({ url: u, status: 'revived' });
fs.writeFileSync(repPath, JSON.stringify(rep, null, 1));
console.log('\n复核复活: ' + revived.length + ' 条');
console.log('最终死链: ' + rep.dead.length + ' | 最终存活: ' + rep.alive.length);
