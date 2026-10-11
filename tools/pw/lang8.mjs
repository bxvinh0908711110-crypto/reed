import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8796);
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1280,height:720}});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8796/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="family"]'); await p.waitForTimeout(700);
for(let i=0;i<30;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(350); if(await p.evaluate(()=>P[0].cur===P[0].sents.length-1)) break; }
await p.waitForTimeout(900);
// lấy mẫu độ mờ chồng nhau của các dòng recap mỗi khung hình
const sample=(dir)=>p.evaluate(()=>new Promise(res=>{const w=document.querySelector('#rc0'),ls=[...w.querySelectorAll('.rl')],out=[];langBtn.click();const t0=performance.now();(function f(){const o=ls.map(l=>+(+getComputedStyle(l).opacity).toFixed(2));const sw=+(+getComputedStyle(w.closest('.sents')).opacity).toFixed(2);out.push({t:Math.round(performance.now()-t0),sents:sw,base:o[0],up:o[1],rv:o[2]});if(performance.now()-t0<700)requestAnimationFrame(f);else res(out.filter((_,i)=>i%5==0))})()}));
console.log('EN→VI'); console.table(await sample()); await p.waitForTimeout(500);
console.log('VI→EN'); console.table(await sample());
await b.close(); srv.close();
