// Ô tìm kiếm gộp thanh chủ đề (khối #sbx, hàng gợi ý thay chỗ thanh chủ đề). Thay thế lớp phủ cũ. Chạy lại được: node tools/patch_search4.mjs
import fs from 'fs';
const F = 'E:/Your English/index.html', D = 'E:/Your English/tools/';
let h = fs.readFileSync(F, 'utf8').split('\r\n').join('\n');
const rd = f => fs.readFileSync(D + f, 'utf8').split('\r\n').join('\n').trimEnd();
const rep = (a, b) => { const n = h.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70)); h = h.replace(a, () => b); };
const region = (begin, end, text) => {
  const b0 = h.indexOf(begin); if (b0 < 0) throw new Error('missing region ' + begin);
  const b1 = h.indexOf(end + '\n', b0) + end.length + 1; h = h.slice(0, b0) + begin + '\n' + text + '\n' + end + '\n' + h.slice(b1);
};
const SPARK = '<svg class="sbIco" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6a4 4 0 0 0 2.5 2.5L22 12l-5.6 1.9a4 4 0 0 0-2.5 2.5L12 22l-1.9-5.6a4 4 0 0 0-2.5-2.5L2 12l5.6-1.9a4 4 0 0 0 2.5-2.5z"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
const NEW = '<div class="sbx" id="sbx"><label class="sbox" id="sbox">' + SPARK + '<span class="sbTxt" aria-hidden="true"><span class="sbA"></span><span class="sbB"></span></span><input class="sbIn" id="sbIn" type="search" enterkeyhint="search" aria-label="Search lessons" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="sbGo" id="sbGo" aria-label="Search">' + ARROW + '</button></label><div class="sug" id="sug"></div></div>';
if (h.includes('id="sov"')) {   // gỡ bản lớp phủ cũ (nút #sbox + lớp phủ #sov)
  h = h.replace(/<button type="button" id="sbox"[\s\S]*?<\/button>/, () => NEW);
  h = h.replace(/<div id="sov" class="sov"[\s\S]*?\n(?=<nav id="bnav")/, '');
}
if (!h.includes('id="sbx"')) throw new Error('chưa chèn được #sbx');
region('/*SEARCHUI-CSS-BEGIN*/', '/*SEARCHUI-CSS-END*/', rd('search_ui.css'));
region('/*SEARCHUI-BEGIN*/', '/*SEARCHUI-END*/', rd('search_ui.js'));
if (h.includes('document.getElementById("sbox")')) h = h.replace('sb=document.getElementById("sbox"), wide', 'sb=document.getElementById("sbx"), wide');
h = h.replace(/if\(sb\) sb\.style\.top=wide\?\(hb\+10\)\+"px":"";\s*const v=\(hb\+\(wide\?68:0\)\)\+"px";/, 'const v=hb+"px";');
fs.writeFileSync(F, h.split('\n').join('\r\n'));
console.log('ok');
