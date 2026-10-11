import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8789);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']});
await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_lang','vi');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8789/index.html'); await p.waitForTimeout(5500);
console.log('persist',await p.evaluate(()=>[document.body.classList.contains('lang-vi'),langBtn.textContent]));
await p.click('#topics button[data-k="family"]'); await p.waitForTimeout(700);
for(let i=0;i<9;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(450); if(i===3) await p.screenshot({path:'tools/pw/shots/lang2_mid.png'}); }
await p.waitForTimeout(600); await p.screenshot({path:'tools/pw/shots/lang2_recap.png'});
await b.close(); srv.close();
