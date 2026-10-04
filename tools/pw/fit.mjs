import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8783);
const b=await chromium.launch();
for(const dev of ['iPhone SE','iPhone 13']){
  const ctx=await b.newContext({...devices[dev]}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8783/index.html'); await p.waitForTimeout(5500);
  for(const k of ['family','friends','school','work','lifestyle']){
    await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{const out=[];P.forEach((pp,pi)=>{const box=pp.el.querySelector('.sents');pp.sents.forEach((s,si)=>{if(s.recap)return;const el=s.el;out.push([pi,si,(()=>{el.style.alignSelf="start";const h=el.offsetHeight;el.style.alignSelf="";return h})()>box.clientHeight+1?'CLIP':'ok',getComputedStyle(el).getPropertyValue('--fit')])})});return out});
    const bad=r.filter(x=>x[2]==='CLIP'); const minFit=Math.min(...r.map(x=>+x[3]||1));
    console.log(dev,k,'slides',r.length,'clipped',bad.length,'minFit',minFit.toFixed(2));
  }
  if(true){await p.click('#topics button[data-k="friends"]');await p.waitForTimeout(900);await p.screenshot({path:'shots/fit_friends_'+dev.replace(/ /g,'')+'.png'});}
  await ctx.close();
}
await b.close(); srv.close();
