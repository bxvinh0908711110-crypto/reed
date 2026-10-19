// Hiệu ứng trượt khi chuyển chủ đề (đọc bài, trang All, danh sách bài) theo hướng của thanh chủ đề. Chạy: node tools/pw/slide.mjs
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true}],['desktop',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  ok(!(await p.evaluate(()=>LITE)),'không ở chế độ nhẹ (hiệu ứng được bật)');
  // 1. đang đọc: sang chủ đề bên PHẢI (family → friends) rồi bên TRÁI
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1300);
  const dirs=[];
  await p.evaluate(()=>document.querySelector('#topics [data-k=friends]').click()); await p.waitForTimeout(60); dirs.push(await p.evaluate(()=>document.querySelector('#main').style.getPropertyValue('--tdir'))); await p.waitForTimeout(1200);
  await p.evaluate(()=>document.querySelector('#topics [data-k=family]').click()); await p.waitForTimeout(60); dirs.push(await p.evaluate(()=>document.querySelector('#main').style.getPropertyValue('--tdir'))); await p.waitForTimeout(1200);
  ok(dirs[0]==='1'&&dirs[1]==='-1','đọc bài: sang tab bên phải trượt +1, sang tab bên trái trượt -1 '+JSON.stringify(dirs));
  ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#main')).transitionProperty.includes('transform')),'#main có chuyển động transform');
  // 2. trang All → danh sách bài: bấm tab, danh sách trượt (Web Animation chạy một lần)
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics [data-k=school]').click()); await p.waitForTimeout(80);
  const a1=await p.evaluate(()=>lscGrid.getAnimations().map(a=>({n:a.effect.getKeyframes().map(k=>k.transform).join('→'),d:a.effect.getTiming().duration})));
  ok(a1.length===1&&/translateX\(34px\)/.test(a1[0].n),'từ trang All bấm School: danh sách trượt từ phải vào '+JSON.stringify(a1));
  await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('#topics [data-k=friends]').click()); await p.waitForTimeout(80);
  const a2=await p.evaluate(()=>lscGrid.getAnimations().map(a=>a.effect.getKeyframes().map(k=>k.transform).join('→')));
  ok(a2.length===1&&/translateX\(-34px\)/.test(a2[0]),'từ School bấm Friends (bên trái): trượt từ trái vào '+JSON.stringify(a2));
  await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('#topics [data-k=stories]').click()); await p.waitForTimeout(80);
  const a3=await p.evaluate(()=>lscGrid.getAnimations().length); ok(a3===1,'sang Stories: danh sách trượt');
  await p.waitForTimeout(600);
  // 3. về All: trượt từ trái
  await p.evaluate(()=>document.querySelector('#topics [data-all]').click()); await p.waitForTimeout(80);
  const a4=await p.evaluate(()=>ovsBody.getAnimations().map(a=>a.effect.getKeyframes().map(k=>k.transform).join('→')));
  ok(a4.length===1&&/translateX\(-34px\)/.test(a4[0]),'về trang All: trượt từ trái vào '+JSON.stringify(a4));
  await p.waitForTimeout(600);
  // 4. hiệu ứng chạy xong thì không để lại trạng thái (opacity/transform)
  ok(await p.evaluate(()=>{ const c=getComputedStyle(ovsBody); return c.transform==='none'&&c.opacity==='1'&&ovsBody.getAnimations().length===0; }),'xong hiệu ứng: nội dung về trạng thái bình thường, không còn animation');
  ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
// 5. chế độ nhẹ / giảm chuyển động: không có hiệu ứng
{ const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics [data-k=family]').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#topics [data-k=friends]').click()); await p.waitForTimeout(80);
  ok(await p.evaluate(()=>lscGrid.getAnimations().length===0),'giảm chuyển động: không trượt');
  await ctx.close(); }
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
