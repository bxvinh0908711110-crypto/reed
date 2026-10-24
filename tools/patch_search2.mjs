// Chèn / cập nhật ô tìm kiếm + lớp phủ (tools/search_ui.{js,css}) vào index.html. Chạy lại được nhiều lần: node tools/patch_search2.mjs
import fs from 'fs';
const F = 'E:/Your English/index.html', D = 'E:/Your English/tools/';
let h = fs.readFileSync(F, 'utf8').split('\r\n').join('\n');
const rd = f => fs.readFileSync(D + f, 'utf8').split('\r\n').join('\n').trimEnd();
const rep = (a, b) => { const n = h.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 70)); h = h.replace(a, () => b); };
const region = (begin, end, text, anchor, before) => {   // thay vùng giữa dấu, hoặc chèn mới
  const blk = begin + '\n' + text + '\n' + end + '\n';
  const b0 = h.indexOf(begin);
  if (b0 >= 0) { const b1 = h.indexOf(end + '\n', b0) + end.length + 1; h = h.slice(0, b0) + blk + h.slice(b1); }
  else rep(anchor, before ? blk + anchor : anchor + blk);
};
const SPARK = '<svg class="sbIco" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6a4 4 0 0 0 2.5 2.5L22 12l-5.6 1.9a4 4 0 0 0-2.5 2.5L12 22l-1.9-5.6a4 4 0 0 0-2.5-2.5L2 12l5.6-1.9a4 4 0 0 0 2.5-2.5z"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
// 1) HTML: ô trong thanh trên (trước thanh chủ đề) + lớp phủ (sau storyView)
if (!h.includes('id="sbox"')) {
  rep('<nav class="topics" id="topics"', '<button type="button" id="sbox" class="sbox" aria-label="Search lessons">' + SPARK + '<span class="sbTxt" aria-hidden="true"><span class="sbA"></span><span class="sbB"></span></span><span class="sbGo" aria-hidden="true">' + ARROW + '</span></button><nav class="topics" id="topics"');
}
if (!h.includes('id="sov"')) {
  rep('<nav id="bnav" class="bnav"', '<div id="sov" class="sov" hidden role="dialog" aria-label="Search"><div class="sovHead"><label class="sovField">' + SPARK + '<input id="sovIn" type="search" enterkeyhint="search" placeholder="Search lessons" aria-label="Search lessons" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" id="sovGo" class="sbGo" aria-label="Search">' + ARROW + '</button></label><button type="button" id="sovCancel" class="sovCancel">Cancel</button></div><div class="sovBody" id="sovBody"></div></div>\n<nav id="bnav" class="bnav"');
}
// 2) CSS: cuối khối style chính (trước </style> đầu tiên)
region('/*SEARCHUI-CSS-BEGIN*/', '/*SEARCHUI-CSS-END*/', rd('search_ui.css'), '</style>', true);
// 3) JS: sau khối Search (module), trước ghi chú Stories
region('/*SEARCHUI-BEGIN*/', '/*SEARCHUI-END*/', rd('search_ui.js'), 'const hasLessons=k=>k==="stories"?STORIES.length>0:ALL.some(p=>p.cat===k);\n', false);
// 4) lscPlace: tính cả chiều cao ô tìm kiếm (≥821px ô nằm dưới thanh trên); mở màn hình: gắn class listOpen trước khi đo
if (!h.includes('const sbEl=')) {
  rep('function lscPlace(){ const v=Math.round($(".top").getBoundingClientRect().bottom)+"px"; lscEl.style.setProperty("--lsc-top",v); document.getElementById("overviewScreen").style.setProperty("--lsc-top",v); }',
    'function lscPlace(){\n  const hb=Math.round($(".top").getBoundingClientRect().bottom), sb=document.getElementById("sbox"), wide=matchMedia("(min-width:821px)").matches;\n  if(sb) sb.style.top=wide?(hb+10)+"px":"";\n  const v=(hb+(wide?68:0))+"px"; lscEl.style.setProperty("--lsc-top",v); document.getElementById("overviewScreen").style.setProperty("--lsc-top",v);   /* ≥821px: ô tìm kiếm nằm dưới thanh trên, màn hình bắt đầu dưới ô */\n}\nconst sbEl=1;');
  rep('  renderOverview(); lscPlace(); ovsEl.hidden=false; ovsBody.scrollTop=0;\n  document.body.classList.add("listOpen");', '  renderOverview(); document.body.classList.add("listOpen"); lscPlace(); ovsEl.hidden=false; ovsBody.scrollTop=0;');
  rep('  renderLessonList(); lscPlace(); lscEl.hidden=false; lscGrid.scrollTop=0;\n  document.body.classList.add("listOpen");', '  renderLessonList(); document.body.classList.add("listOpen"); lscPlace(); lscEl.hidden=false; lscGrid.scrollTop=0;');
  rep('  if(e.key!=="Escape") return;\n  if(window.__bnav&&window.__bnav.sheetOpen) return;', '  if(e.key!=="Escape") return;\n  if(window.__bnav&&window.__bnav.sheetOpen) return;\n  if(window.__sov&&window.__sov.isOpen()) return;');
}
fs.writeFileSync(F, h.split('\n').join('\r\n'));
console.log('ok');
