import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const e=u.slice(u.lastIndexOf('.'));r.setHeader('Content-Type',{'.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'}[e]||'application/octet-stream');r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const b=await chromium.launch();
for(const [name,opts] of [['mobile',devices['iPhone 13']],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5500);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(700);
  const mid=await p.evaluate(()=>new Promise(res=>{ const ph=document.querySelector('.sent[data-s="1"] .ph')||[...document.querySelectorAll('.ph')].find(x=>x.offsetParent&&x.closest('.sent').style.opacity>.5); const act=[...document.querySelectorAll('.sent')].find(s=>+s.style.opacity>.5); const p0=act&&act.querySelector('.ph'); if(!p0) return res({err:'không có cụm'}); p0.click(); setTimeout(()=>{ const f=[...p0.querySelectorAll('.o')].map(o=>o.style.filter); res({noBlur:window.noBlur,filters:f,f:+(p0._f||0).toFixed(2)}); },130); }));
  console.log(name,'noBlur =',mid.noBlur,'| bộ lọc từng chữ giữa lúc đổi:',JSON.stringify(mid.filters),'f',mid.f);
  await p.screenshot({path:`tools/pw/shots/blur_${name}.png`}); console.log('  lỗi JS',errs); await ctx.close();
}
await b.close(); srv.close();
