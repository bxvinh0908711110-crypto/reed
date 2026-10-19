// Skeleton ảnh, tải trước âm thanh, chế độ nhẹ. Chạy: node tools/pw/perf2.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch();
const mk=async(opts,init)=>{ const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); if(init) await ctx.addInitScript(init); await ctx.route('**/*supabase.co/**',r=>r.abort()); return ctx; };
// 1. skeleton: ảnh bìa bị làm chậm 1,2s
{ const ctx=await mk({...devices['iPhone 13'],serviceWorkers:'block'}); await ctx.route('**/img/topic-*.webp',async r=>{ await new Promise(s=>setTimeout(s,1200)); r.continue(); });
  const p=await ctx.newPage(); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(500);
  const a=await p.evaluate(()=>{ const t=document.querySelector('.ovTopic .lscThumb'), i=t.querySelector('img'); return {bg:getComputedStyle(t).backgroundColor,op:getComputedStyle(i).opacity,ld:i.classList.contains('ld')}; });
  ok(a.bg==='rgb(227, 229, 232)'&&a.op==='0'&&!a.ld,'ảnh chưa tải: ô xám làm khung chờ, ảnh ẩn '+JSON.stringify(a));
  await p.waitForTimeout(2200);
  const c=await p.evaluate(()=>{ const i=document.querySelector('.ovTopic img'); return {ld:i.classList.contains('ld'),op:getComputedStyle(i).opacity}; });
  ok(c.ld&&c.op==='1','ảnh tải xong: mờ vào '+JSON.stringify(c));
  await ctx.close(); }
// 2. tải trước âm thanh
{ const ctx=await mk(devices['iPhone 13']); const p=await ctx.newPage(); const reqs=[]; p.on('request',q=>{ if(/\/audio\/(female|male)\//.test(q.url())) reqs.push(q.url().split('/audio/')[1]); });
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(2500);
  const want=await p.evaluate(()=>{ const t=[...sentTexts(active.pi,active.si),...sentTexts(active.pi,active.si+1)]; return [...new Set(t.map(x=>AUDIO[x]).filter(Boolean))].map(id=>'female/'+id+'.mp3'); });
  ok(want.length>=1&&want.every(w=>reqs.includes(w)),'đến bước mới: tải trước âm thanh câu này và câu kế (không cần bấm ▶) '+JSON.stringify({want,reqs:reqs.length}));
  const n0=reqs.length; await p.evaluate(()=>{ prefetchAudio(active.pi,active.si); }); await p.waitForTimeout(500);
  ok(reqs.length===n0,'không tải lặp lại cùng file');
  await ctx.close(); }
{ const ctx=await mk(devices['iPhone 13'],()=>{ Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true}); }); const p=await ctx.newPage(); const reqs=[]; p.on('request',q=>{ if(/\/audio\/(female|male)\//.test(q.url())) reqs.push(q.url()); });
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(4500); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(2500);
  ok(reqs.length===0,'bật tiết kiệm dữ liệu: không tải trước ('+reqs.length+')'); await ctx.close(); }
// 3. chế độ nhẹ
for(const [name,url,opts,expect] of [['desktop ?lite=1',`/?lite=1`,{viewport:{width:1280,height:720}},true],['desktop mặc định',`/`,{viewport:{width:1280,height:720}},false],['iPhone ?lite=0',`/?lite=0`,devices['iPhone 13'],false]]){
  const ctx=await mk(opts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}${url}`); await p.waitForTimeout(4500);
  const l=await p.evaluate(()=>({cls:document.documentElement.classList.contains('lite'),noBlur:typeof noBlur!=='undefined'?noBlur:null,lite:LITE}));
  ok(l.cls===expect&&l.lite===expect&&(expect?l.noBlur===true:true),name+': lite='+l.cls+' noBlur='+l.noBlur);
  if(expect){ await p.evaluate(()=>document.querySelector('#startBtn').click()); await p.waitForTimeout(500); const a=await p.evaluate(()=>getComputedStyle(document.querySelector('#overviewScreen')).transitionDuration); ok(a==='0s','chế độ nhẹ: màn hình tổng quan hiện tức thì (transition '+a+')'); }
  ok(errs.length===0,name+': không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close(); }
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
