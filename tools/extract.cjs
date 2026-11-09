// extract.cjs — 从 Chrome 各 Profile 提取原始书签 → raw-bookmarks.json
// 用法: node tools/extract.cjs
const fs = require('fs');
const path = require('path');

const base = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
const profiles = fs.readdirSync(base).filter(d => d === 'Default' || /^Profile \d+$/.test(d));
const out = [];
let seq = 0;

function walk(node, folderPath, profile) {
  if (node.type === 'url') {
    out.push({
      id: 'b' + (seq++),
      title: (node.name || '').trim(),
      url: node.url,
      added: node.date_added ? chromeTime(node.date_added) : null,
      folders: folderPath,
      profile,
    });
    return;
  }
  const kids = node.children || [];
  for (const k of kids) walk(k, folderPath.concat(k.name), profile);
}

function chromeTime(v) {
  // Chrome 时间戳: 1601-01-01 起的微秒
  const n = Number(v);
  if (!isFinite(n) || n === 0) return null;
  return new Date(n / 1e6 - 11644473600e3).toISOString().slice(0, 10);
}

for (const p of profiles) {
  let f = path.join(base, p, 'Bookmarks');
  if (!fs.existsSync(f)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.error(p, 'PARSE_FAIL'); continue; }
  for (const rk of ['bookmark_bar', 'other', 'synced']) {
    const r = data.roots[rk];
    if (r) walk(r, [], p);
  }
}

const outFile = path.join(__dirname, 'raw-bookmarks.json');
fs.writeFileSync(outFile, JSON.stringify(out, null, 1), 'utf8');
console.log('extracted: ' + out.length + ' bookmarks from ' + profiles.length + ' profiles -> ' + outFile);
