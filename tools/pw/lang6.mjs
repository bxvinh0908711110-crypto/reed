import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8794);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8794/index.html'); await p.waitForTimeout(5500);
await p.click('#topics button[data-k="lifestyle"]'); await p.waitForTimeout(700);
for(let i=0;i<3;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(450); }
const cap=()=>p.evaluate(()=>{const s=P[active.pi].sents[active.si];return [getComputedStyle(s.cap).display,s.cap.textContent.slice(0,20)]});
console.log('EN',await cap()); await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(600); console.log('VI',await cap()); await p.screenshot({path:'tools/pw/shots/lang6_vi.png'});
await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(600); console.log('EN lại',await cap());
await b.close(); srv.close();
