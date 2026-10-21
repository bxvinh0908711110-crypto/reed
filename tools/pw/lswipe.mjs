// Vuốt ngang trên danh sách bài / trang tổng quan để đổi chủ đề (touch thật qua CDP). Chạy: node tools/pw/lswipe.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch(); const ctx=await b.newContext(devices['iPhone 13']);
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const cdp=await ctx.newCDPSession(p);
await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
async function swipe(x1,x2,y1,y2=y1){ await T('touchStart',x1,y1); for(let i=1;i<=8;i++){ await T('touchMove',x1+(x2-x1)*i/8,y1+(y2-y1)*i/8); await p.waitForTimeout(16);} await T('touchEnd'); await p.waitForTimeout(700); }
const st=()=>p.evaluate(()=>({ov:ovsEl.classList.contains('on'),ls:lscEl.classList.contains('on'),topic:curTopic,y:Math.round(scrollY),all:document.querySelector('#topics [data-all]').getAttribute('aria-pressed')}));
const order=await p.evaluate(()=>TOPICS.filter(t=>hasLessons(t.k)).map(t=>t.k));
await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(900);
ok((await st()).ov,'tổng quan mở');
await swipe(300,80,300); let s=await st(); ok(s.ls&&s.topic===order[0],'vuốt trái ở tổng quan → danh sách '+order[0]+' '+JSON.stringify(s));
await swipe(300,80,300); s=await st(); ok(s.ls&&s.topic===order[1],'vuốt trái → '+order[1]+' '+JSON.stringify(s));
await swipe(80,300,300); s=await st(); ok(s.ls&&s.topic===order[0],'vuốt phải → '+order[0]);
await swipe(300,320,300,500); s=await st(); ok(s.ls&&s.topic===order[0],'vuốt dọc (cuộn) không đổi chủ đề');
await swipe(80,300,300); s=await st(); ok(s.ov&&!s.ls&&s.all==='true','vuốt phải ở chủ đề đầu → về tổng quan '+JSON.stringify(s));
await swipe(80,300,300); s=await st(); ok(s.ov,'vuốt phải ở tổng quan: đứng yên');
await swipe(300,80,300); await p.keyboard.press('Escape'); await p.waitForTimeout(700); s=await st(); ok(s.ov,'Esc từ danh sách (đi từ tổng quan) → tổng quan');
await p.evaluate(()=>document.querySelector('#brandHome').click()); await p.waitForTimeout(900);
ok((await st()).y<5,'đóng hết, trang phía sau không bị cuộn');
ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
