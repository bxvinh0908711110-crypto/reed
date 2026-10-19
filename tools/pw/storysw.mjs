// Service Worker + Stories: lưu bài sau lần xem đầu, mở lại được khi offline, và không làm hỏng bản lưu trang chủ. Chạy: node tools/pw/storysw.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');
  if(/(^|\/)index\.html$/.test(u)){ const qs=q.url.includes('?')?q.url.slice(q.url.indexOf('?')):''; r.statusCode=307; r.setHeader('Location','/'+u.replace(/index\.html$/,'')+qs); r.end(); return; }   // giống Cloudflare: /…/index.html → /…/ (307)
  if(u===''||u.endsWith('/'))u+='index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(3500);
await p.reload(); await p.waitForTimeout(4500);
ok(await p.evaluate(()=>!!navigator.serviceWorker.controller),'service worker đang điều khiển trang');
const open=async()=>{ await p.evaluate(()=>{ document.querySelector('#startBtn').click(); }); await p.waitForTimeout(800); await p.evaluate(()=>document.querySelector('.ovTopic[data-k="stories"]').click()); await p.waitForTimeout(800); await p.evaluate(()=>document.querySelector('#lscGrid .lscCard.story').click()); await p.waitForTimeout(500); const fr=p.frames().find(f=>f.url().includes('/stories/ussr/')); await fr.waitForSelector('body[data-ready="1"]',{timeout:60000}); return fr; };
let fr=await open();
await fr.evaluate(()=>document.querySelector('#go').click()); await p.waitForTimeout(500);
await fr.evaluate(()=>scrollTo(0,innerHeight)); await p.waitForTimeout(4000);   // phát bước 2 để lưu file
const c=await p.evaluate(async()=>{ const s=await caches.open('reed-stories-v1'); const k=(await s.keys()).map(r=>new URL(r.url).pathname); const sh=await caches.open('reed-v4-shell'); const home=await sh.match('index.html'); const t=home?await home.text():''; return {n:k.length,hasPage:k.some(x=>/\/stories\/ussr\/(v\.html)?$/.test(x)),hasImg:k.some(x=>/\.(webp|jpg)$/.test(x)),hasAudio:k.some(x=>/\.(mp3|wav|mp4)$/.test(x)),homeIsReed:t.includes('id="startBtn"')&&!t.includes('The Fall of the Soviet Union</title>')}; });
ok(c.hasPage&&c.hasImg&&c.hasAudio&&c.n>=3,'đã lưu trang, ảnh bìa và video/âm thanh của Stories sau lần xem đầu '+JSON.stringify({n:c.n}));
ok(c.homeIsReed,'bản lưu trang chủ vẫn là trang Reed (iframe không ghi đè)');
await p.evaluate(()=>document.querySelector('#storyClose').click()); await p.waitForTimeout(400);
// offline
await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(4500);
ok(await p.evaluate(()=>!!document.querySelector('.hero h1')&&!!document.querySelector('#startBtn')),'offline: tải lại vẫn ra trang Reed');
fr=await open();
ok(await fr.evaluate(()=>document.body.dataset.ready==='1'&&document.querySelectorAll('#stage img').length>=0),'offline: bài Stories mở được từ bản đã lưu');
const imgs=await fr.evaluate(()=>{ const v=document.getElementById('v'); if(v) return v.poster?1:0; return [...document.images].filter(i=>i.complete&&i.naturalWidth>0).length; });
ok(imgs>=1,'offline: bài hiển thị (poster/ảnh: '+imgs+')');
ok(errs.length===0,'không lỗi JS'+(errs.length?': '+errs[0]:''));
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
