// Trang chủ: không tab chủ đề nào sáng; bấm tab mở danh sách chủ đề (không vào bài). Chạy: node tools/pw/hometabs.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.json':'application/json','.mp4':'video/mp4'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.writeHead(200,{'content-type':MIME[path.extname(u)]||'application/octet-stream'});r.end(b);}catch(e){r.writeHead(404);r.end();}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
const init=()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({s:1}));};
const st=p=>p.evaluate(()=>({ls:!lscEl.hidden&&lscEl.classList.contains('on'),ov:!ovsEl.hidden&&ovsEl.classList.contains('on'),topic:curTopic,stories:storiesView,y:Math.round(scrollY),pressed:[...document.querySelectorAll('#topics button[aria-pressed="true"]')].map(x=>x.dataset.k||'all'),home:document.body.classList.contains('heroView')}));
for(const [name,opts] of [['m390',devices['iPhone 13']],['t834',{viewport:{width:834,height:1112},hasTouch:true}],['d1280',{viewport:{width:1280,height:720}}]]){
  console.log('--',name);
  for(const k of ['school','stories']){
    const ctx=await b.newContext(opts); await ctx.addInitScript(init); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
    let s=await st(p); ok(s.home&&s.pressed.length===0&&!s.ls&&!s.ov,name+': trang chủ, không tab nào sáng '+JSON.stringify(s));
    await p.evaluate(k=>document.querySelector('#topics button[data-k="'+k+'"]').click(),k); await p.waitForTimeout(1300);
    s=await st(p); ok(s.ls&&!s.ov&&s.y<50&&s.pressed.join()===k&&(k==='stories'?s.stories:s.topic===k),name+': bấm tab '+k+' ở trang chủ → danh sách chủ đề (không vào bài) '+JSON.stringify(s));
    ok(errs.length===0,'không lỗi JS '+JSON.stringify(errs)); await ctx.close();
  }
  // bấm logo về trang chủ: lại không tab nào sáng
  const ctx=await b.newContext(opts); await ctx.addInitScript(init); const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(1600);
  const s=await st(p); ok(s.home&&s.pressed.length===0,name+': bấm logo về trang chủ → không tab nào sáng '+JSON.stringify(s));
  await p.screenshot({path:`E:/Your English/tools/pw/shots/hometabs_${name}.png`}); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?fails+' FAIL':'ALL PASS'); process.exit(fails?1:0);
