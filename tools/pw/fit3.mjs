import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8786);
const b=await chromium.launch();
const devs=[['SE',{...devices['iPhone SE']}],['13',{...devices['iPhone 13']}],['14PM',{...devices['iPhone 14 Pro Max']}],['d1280',{viewport:{width:1280,height:720}}],['d1366',{viewport:{width:1366,height:768}}],['d1920',{viewport:{width:1920,height:1080}}]];
for(const [name,opts] of devs){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8786/index.html'); await p.waitForTimeout(5500);
  let bad=[],minFit=1;
  for(const k of ['family','friends','school','work','lifestyle','health','tech']){
    await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(700);
    const r=await p.evaluate(()=>{const out=[];P.forEach((pp,pi)=>{const box=pp.el.querySelector('.sents');const bw=box.clientWidth,bh=box.clientHeight;pp.sents.forEach((s,si)=>{if(s.recap)return;const el=s.el;el.style.alignSelf='start';const h=el.offsetHeight;el.style.alignSelf='';const wide=[...el.querySelectorAll('.ph')].some(ph=>Math.max(...[...ph.querySelectorAll('.o')].map(o=>o.getBoundingClientRect().width))>bw);out.push({t:passages[pi].topic,si,tall:h>bh+1,wide,fit:+getComputedStyle(el).getPropertyValue('--fit')||1})})});return out});
    r.forEach(x=>{minFit=Math.min(minFit,x.fit); if(x.tall||x.wide)bad.push(k+':'+x.t.slice(0,12)+'#'+x.si+(x.tall?' tall':'')+(x.wide?' wide':''))});
  }
  console.log(name,'minFit',minFit.toFixed(2),'bad',bad.length?bad:'none');
  if(name==='13'||name==='d1280'){await p.click('#topics button[data-k="friends"]');await p.waitForTimeout(800);await p.screenshot({path:`tools/pw/shots/fit3_${name}.png`});}
  await ctx.close();
}
await b.close(); srv.close();
