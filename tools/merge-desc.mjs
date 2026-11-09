// merge-desc.mjs — 合并子代理生成的介绍 → rules.mjs 的 DESC 库
// 用法: node tools/merge-desc.mjs
// 读取 tools/desc-out/*.json ({"host": "介绍"}), 过滤 N/A, 与 rules.mjs 中 DESC 合并,
// 重新生成为 tools/desc-generated.mjs 供 rules.mjs 引入
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'desc-out');
const files = fs.readdirSync(outDir).filter(f => f.endsWith('.json'));

const merged = {};
let na = 0, dup = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
  for (const [host, desc] of Object.entries(data)) {
    if (!desc || /^(N\/A|na)$/i.test(desc.trim())) { na++; continue; }
    if (merged[host]) { dup++; continue; }
    merged[host] = String(desc).trim().slice(0, 60);
  }
}

const entries = Object.entries(merged).map(([h, d]) => `  ${JSON.stringify(h)}: ${JSON.stringify(d)},`);
const content = `// desc-generated.mjs — 子代理批量生成的站点介绍 (由 tools/merge-desc.mjs 生成, 勿手改)
// 合并来源: ${files.join(', ')}
export const GENERATED_DESC = {
${entries.join('\n')}
};
`;
fs.writeFileSync(path.join(__dirname, 'desc-generated.mjs'), content);
console.log('merged hosts: ' + Object.keys(merged).length + '  (N/A skipped: ' + na + ', dup skipped: ' + dup + ')');
console.log('-> tools/desc-generated.mjs written');
