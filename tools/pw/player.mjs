// Kích thước vùng chạm của thanh player (nên >= 40px): node tools/pw/player.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.js':'text/javascript','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
for(const [name,opts] of [['SE',devices['iPhone SE']],['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1300);
  const m=await p.evaluate(()=>{ const R=s=>{const e=document.querySelector(s);const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}; const pl=document.querySelector('#player').getBoundingClientRect(); return {bar:[Math.round(pl.width),Math.round(pl.height)],play:R('.row .play'),lang:R('#langBtn'),mic:R('#micBtn'),chev:R('#openSettings'),inView:pl.bottom<=innerHeight&&pl.top>0}; });
  const tall=[m.play,m.lang,m.mic].every(x=>x[1]>=36)&&m.bar[1]>=56;
  ok(tall&&m.inView,name+': thanh '+m.bar.join('×')+', play '+m.play.join('×')+', EN '+m.lang.join('×')+', mic '+m.mic.join('×')+', mũi tên '+m.chev.join('×'));
  const gap=await p.evaluate(()=>{ const pl=document.querySelector('#player').getBoundingClientRect(); const bars=[...document.querySelectorAll('.foot')].map(f=>f.getBoundingClientRect()).filter(r=>r.height>0&&r.top>0&&r.top<innerHeight&&r.left>=0&&r.left<innerWidth); const b=bars.sort((a,b)=>b.bottom-a.bottom)[0]; return b?Math.round(pl.top-b.bottom):null; });
  ok(gap!==null&&gap>=10,name+': thanh tiến trình cách thanh player '+gap+'px (cần ≥ 10)');
  // mở hàng cài đặt (giọng/tốc độ) rồi đóng lại
  await p.evaluate(()=>document.querySelector('#openSettings').click()); await p.waitForTimeout(600);
  const st=await p.evaluate(()=>({settings:document.querySelector('#player').classList.contains('settings'),btn:[...document.querySelectorAll('.settings-row .setting')].map(b=>Math.round(b.getBoundingClientRect().height))}));
  ok(st.settings&&st.btn.every(h=>h>=36),name+': hàng cài đặt mở, nút '+JSON.stringify(st.btn));
  await p.screenshot({path:`tools/pw/shots/player_${name}.png`,clip:{x:0,y:(opts.viewport?.height||opts.screen?.height||720)-120,width:opts.viewport?.width||390,height:120}}).catch(()=>{});
  ok(errs.length===0,name+': không lỗi JS'); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
