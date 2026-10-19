// Trang phát video của Stories (điện thoại): phát thật bằng Chrome cài trên máy (Chromium của Playwright không có H.264). Chạy: node tools/pw/storyvideo.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.mp4':'video/mp4','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');if(u===''||u.endsWith('/'))u+='index.html';
  try{ const f='E:/Your English/deploy/'+u, st=fs.statSync(f), ct=MIME[path.extname(u)]||'application/octet-stream', rg=q.headers.range;
    if(rg){ const m=/bytes=(\d*)-(\d*)/.exec(rg); let s=+m[1]||0, e=m[2]?+m[2]:st.size-1; r.writeHead(206,{'Content-Type':ct,'Content-Range':`bytes ${s}-${e}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':e-s+1}); fs.createReadStream(f,{start:s,end:e}).pipe(r); }
    else { r.writeHead(200,{'Content-Type':ct,'Accept-Ranges':'bytes','Content-Length':st.size}); fs.createReadStream(f).pipe(r); } }catch{ r.statusCode=404; r.end(); } }).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext(devices['iPhone 13']); const p=await ctx.newPage(); const errs=[],bad=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().slice(-50)); });
await p.goto(`http://localhost:${port}/stories/ussr/v.html?lang=en_michael`); await p.waitForSelector('body[data-ready="1"]');
ok(await p.evaluate(()=>document.querySelector('#start h1').textContent==='The Fall of the Soviet Union'&&document.documentElement.lang==='en'),'giao diện tiếng Anh');
const st=()=>p.evaluate(()=>{const v=document.getElementById('v'); return {src:v.currentSrc.split('/').slice(-2).join('/'),t:+v.currentTime.toFixed(2),paused:v.paused,ended:v.ended,w:v.videoWidth,h:v.videoHeight,muted:v.muted,poster:v.poster.split('/').pop(),dur:+v.duration.toFixed(2)}});
await p.click('#go'); await p.waitForTimeout(1500);
let s=await st(); ok(s.src.endsWith('en_michael/b01.mp4')&&s.t>0.5&&!s.paused&&s.w===640&&Math.abs(s.h-1136)<=4&&!s.muted,'Start: video bước 1 đang phát, 640×1136, có tiếng '+JSON.stringify(s));
await p.screenshot({path:'tools/pw/shots/video_1.png'});
await p.waitForTimeout(2800); s=await st(); ok(s.ended,'hết video: dừng ở khung cuối (ended)');
await p.evaluate(()=>scrollTo(0,3*innerHeight)); await p.waitForTimeout(2000); s=await st();
ok(s.src.endsWith('en_michael/b04.mp4')&&s.t>0.5&&!s.paused,'vuốt tới bước 4: phát b04 '+JSON.stringify(s));
ok(await p.evaluate(()=>document.querySelector('#cap').textContent.includes('perestroika')),'phụ đề đúng bước 4');
await p.screenshot({path:'tools/pw/shots/video_4.png'});
ok(await p.evaluate(()=>document.querySelector('#spin').className===''),'không còn vòng chờ khi đã phát');
// tắt tiếng
await p.evaluate(()=>document.querySelector('#mu').click()); ok((await st()).muted,'bấm Sound: tắt tiếng video');
await p.evaluate(()=>document.querySelector('#mu').click());
// đổi ngôn ngữ
await p.evaluate(()=>{const l=document.querySelector('#lang'); l.value='vi'; l.dispatchEvent(new Event('change'));}); await p.waitForTimeout(1800); s=await st();
ok(s.src.endsWith('vi/b04.mp4')&&s.t>0.3&&await p.evaluate(()=>document.querySelector('#mu').textContent.startsWith('\u00c2m')),'đổi sang tiếng Việt: phát b04 bản Việt, giao diện Việt '+JSON.stringify(s));
await p.evaluate(()=>{const l=document.querySelector('#lang'); l.value='en_michael'; l.dispatchEvent(new Event('change'));}); await p.waitForTimeout(1200);
// tải trước bước kế
const warmed=await p.evaluate(async()=>{ const r=performance.getEntriesByType('resource').map(e=>e.name.split('/').slice(-2).join('/')); return r.filter(x=>/b0[4-6]\.mp4/.test(x)); });
ok(warmed.some(x=>x.endsWith('b05.mp4')),'tải trước video bước kế (b05) '+JSON.stringify(warmed));
// bước cuối
await p.evaluate(()=>scrollTo(0,18*innerHeight)); await p.waitForTimeout(2500); s=await st(); ok(s.src.endsWith('b19.mp4')&&s.t>0.3,'bước cuối phát được');
ok(errs.length===0&&bad.length===0,'không lỗi JS / không file 404'+(errs.length?': '+errs[0]:'')+(bad.length?' '+bad[0]:''));
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
