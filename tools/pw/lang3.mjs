import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8790);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_lang','vi');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8790/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="family"]'); await p.waitForTimeout(700);
for(let i=0;i<30;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(350); const c=await p.evaluate(()=>[P[0].cur,P[0].sents.length-1]); if(c[0]===c[1]) break; }
await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{const w=document.querySelector('#rc0'),rv=w.querySelector('.rv');const cs=getComputedStyle(rv);return {cur:P[0].cur,h:w.style.height,rvh:rv.offsetHeight,op:cs.opacity,txt:rv.textContent.slice(0,40),tg:getComputedStyle(document.querySelector('.tg')).visibility,sentop:getComputedStyle(w.closest('.sent')).opacity}}));
await p.screenshot({path:'tools/pw/shots/lang3_recap.png'});
await p.evaluate(()=>document.querySelector('#langBtn').click()); await p.waitForTimeout(900); await p.screenshot({path:'tools/pw/shots/lang3_recap_en.png'});
await b.close(); srv.close();
