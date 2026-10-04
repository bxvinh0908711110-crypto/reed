import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8793);
const b=await chromium.launch();
for(const label of ['first visit','return visit']){
  const ctx=label==='first visit'?await b.newContext({viewport:{width:1280,height:720}}):globalThis.keep;
  const c=ctx||await b.newContext({viewport:{width:1280,height:720}}); if(label==='first visit') globalThis.keep=c;
  const p=await c.newPage(); await c.route('**/*supabase.co/**',r=>r.abort());
  await p.addInitScript(()=>{window.__t={};const t0=performance.now();const iv=setInterval(()=>{const el=document.getElementById('reed-splash');if(!el)return;const tag=el.querySelector('.tag');const o=+getComputedStyle(tag).opacity;if(o>.95&&!__t.tagFull)__t.tagFull=Math.round(performance.now()-t0);if(el.classList.contains('flying')&&!__t.fly)__t.fly=Math.round(performance.now()-t0);if(getComputedStyle(el).display==='none'&&!__t.done){__t.done=Math.round(performance.now()-t0);clearInterval(iv)}},16)});
  await p.goto('http://localhost:8793/index.html'); await p.waitForTimeout(9000);
  console.log(label,JSON.stringify(await p.evaluate(()=>__t)));
  await p.close();
}
await b.close(); srv.close();
