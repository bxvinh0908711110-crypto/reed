import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8798);
const b=await chromium.launch(); const [W,H]=(process.argv[2]||'1333x700').split('x').map(Number);
const ctx=await b.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8798/index.html'); await p.waitForTimeout(5000);
await p.click('#topics button[data-k="family"]'); await p.waitForTimeout(600);
for(let i=0;i<30;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(300); if(await p.evaluate(()=>P[0].cur===P[0].sents.length-1)) break; }
await p.waitForTimeout(700); await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(900);
console.log(await p.evaluate(()=>{const R=e=>{const r=e.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom)]};const w0=document.querySelector('#rc0');return {box:R(w0.closest('.sents')),sent:R(w0.closest('.sent')),rcw:R(w0),rv:R(w0.querySelector('.rv')),up:R(w0.querySelector('.up')),sentsOthers:[...w0.closest('.sents').children].map(c=>Math.round(c.getBoundingClientRect().height)),label:R(w0.closest('.passage').querySelector('.label'))}}));console.log(await p.evaluate(()=>{const w=document.querySelector('#rc0'),rv=w.querySelector('.rv'),box=w.closest('.sents'),bb=box.getBoundingClientRect(),rr=rv.getBoundingClientRect();return {boxH:Math.round(bb.height),maxH:getComputedStyle(box).maxHeight,rvH:Math.round(rv.offsetHeight),over:Math.round(rr.bottom-bb.bottom),rs:getComputedStyle(w).getPropertyValue('--rs'),wh:w.style.height,wrapH:Math.round(w.getBoundingClientRect().height)}}));
await p.screenshot({path:`tools/pw/shots/lang10_${W}x${H}.png`}); await b.close(); srv.close();
