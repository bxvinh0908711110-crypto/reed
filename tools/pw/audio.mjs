import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8787);
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext({...devices['iPhone 13']}); await ctx.route('**/*supabase.co/**',r=>r.abort());
const p=await ctx.newPage(); const mp3=[]; p.on('response',r=>{if(r.url().includes('.mp3'))mp3.push(r.url().split('/audio/')[1]+' '+r.status())});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8787/index.html'); await p.waitForTimeout(5500);
for(const k of ['family','friends','school','work','lifestyle','health','tech']){
  await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(700);
  const txt=await p.evaluate(()=>currentText());
  const has=await p.evaluate(t=>!!AUDIO[t],txt);
  await p.evaluate(()=>speak(currentText())); await p.waitForTimeout(600);
  console.log(k,'| có file giọng:',has,'|',txt.slice(0,60));
}
console.log('mp3 requests:',mp3.slice(-8)); console.log('errors',errs);
await b.close(); srv.close();
