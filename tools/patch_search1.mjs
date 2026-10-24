// Chèn / cập nhật khối tìm kiếm (tools/search_module.js) vào appSrc của index.html. Chạy: node tools/patch_search1.mjs
import fs from 'fs';
const F = 'E:/Your English/index.html';
let h = fs.readFileSync(F, 'utf8').split('\r\n').join('\n');
const mod = fs.readFileSync('E:/Your English/tools/search_module.js', 'utf8').split('\r\n').join('\n').trimEnd();
const block = '/*SEARCH-BEGIN*/\n' + mod + '\n/*SEARCH-END*/\n';
const b0 = h.indexOf('/*SEARCH-BEGIN*/');
if (b0 >= 0) {
  const b1 = h.indexOf('/*SEARCH-END*/\n') + '/*SEARCH-END*/\n'.length;
  h = h.slice(0, b0) + block + h.slice(b1);
} else {
  const anchor = '/* Stories: bài đặc biệt có hoạt hình tương tác';
  if (h.split(anchor).length !== 2) throw new Error('anchor not unique');
  h = h.replace(anchor, () => block + anchor);
}
fs.writeFileSync(F, h.split('\n').join('\r\n'));
console.log('ok');
