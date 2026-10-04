import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8782);
const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8782/index.html'); await p.waitForTimeout(5500);
for(const k of ['family','friends','school','work','lifestyle']){
  await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(900);
  const info=await p.evaluate(()=>({n:passages.length,titles:passages.map(x=>x.topic),sents:P.map(x=>x.sents.length),lbl:document.querySelector('.passage .label')?.textContent}));
  console.log(k,JSON.stringify(info));
  await p.screenshot({path:`shots/content_${k}.png`});
}
// A1 -> A2 text check for each lesson by recap content
const recap=await p.evaluate(()=>ALL.map(l=>[l.topic,l.tpl.replace(/\{(\d)\}/g,(_,i)=>l.hl[+i].u)]));
console.log(recap.map(r=>r[0]+': '+r[1]).join('\n'));
console.log('errors',errs);
await b.close(); srv.close();
