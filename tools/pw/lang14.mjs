import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8804);
const b=await chromium.launch();
for(const [name,opts] of [['d1333x700',{viewport:{width:1333,height:700}}],['13',devices['iPhone 13']]]){
const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8804/index.html'); await p.waitForTimeout(5000);
await p.click('#topics button[data-k="school"]'); await p.waitForTimeout(700);
for(let i=0;i<5;i++){ await p.evaluate(()=>goStep(1)); await p.waitForTimeout(400); }
console.log(name,await p.evaluate(()=>{ const s=P[0].sents[2]; const lines=el=>{const out=[];const rg=document.createRange();el.querySelectorAll('br').forEach(()=>{});return el.innerText.split('\n')}; document.body.classList.add('lang-vi'); const vi=s.el.querySelector('.vt').innerText.split('\n'); document.body.classList.remove('lang-vi'); return {en:s.el.querySelector('.line').innerText.split('\n'),vi}; }));
await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(800); await p.screenshot({path:`tools/pw/shots/lang14_${name}.png`});
await ctx.close();}
await b.close(); srv.close();
