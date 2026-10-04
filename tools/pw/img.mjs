import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8801);
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const bad=[]; p.on('response',r=>{if(r.url().includes('.webp')&&r.status()!==200)bad.push(r.url())});
  await p.goto('http://localhost:8801/index.html'); await p.waitForTimeout(6500);
  const out=[];
  for(const k of ['family','friends','school','work','lifestyle','health','tech']){ await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(1100);
    out.push(k+':'+await p.evaluate(()=>{const i=document.querySelector('.passage .art .afg');return i?(i.complete&&i.naturalWidth>0?'img ok':'img BROKEN'):'svg'}));
    if(name==='mobile'&&['friends','health','tech'].includes(k)) await p.screenshot({path:`tools/pw/shots/img_${name}_${k}.png`,clip:{x:0,y:100,width:390,height:300}});
    if(name==='desktop'&&['work','tech'].includes(k)) await p.screenshot({path:`tools/pw/shots/img_${name}_${k}.png`});
  }
  console.log(name,out.join(' | '),'bad',bad,'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
