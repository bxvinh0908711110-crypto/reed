import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8803);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}]]){
const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); await p.goto('http://localhost:8803/index.html'); await p.waitForTimeout(5000);
await p.click('#topics button[data-k="school"]'); await p.waitForTimeout(700); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(500); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(600);
await p.screenshot({path:`tools/pw/shots/lang13_${name}_en.png`}); await p.evaluate(()=>langBtn.click()); await p.waitForTimeout(800); await p.screenshot({path:`tools/pw/shots/lang13_${name}_vi.png`}); await ctx.close();}
await b.close(); srv.close();
