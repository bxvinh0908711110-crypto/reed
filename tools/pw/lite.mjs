import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8809);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8809/index.html'); await p.waitForTimeout(6500);
  await p.click('#topics button[data-k="tech"]'); await p.waitForTimeout(1200); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  await p.evaluate(()=>{document.querySelector('.passage.on .sent .ph').dispatchEvent(new MouseEvent('click',{bubbles:true}))}); await p.waitForTimeout(1400);
  await p.screenshot({path:`shots/lite_${name}.png`});
  await ctx.close();
}
await b.close(); srv.close();
