import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8802);
const b=await chromium.launch();
for(const [name,opts] of [['SE',devices['iPhone SE']],['13',devices['iPhone 13']],['14PM',devices['iPhone 14 Pro Max']],['d1024x600',{viewport:{width:1024,height:600}}],['d1280',{viewport:{width:1280,height:720}}],['d1366',{viewport:{width:1366,height:768}}],['d1920',{viewport:{width:1920,height:1080}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8802/index.html'); await p.waitForTimeout(5000);
  const bad=[]; let minRatio=1;
  for(const k of ['family','friends','school','work','lifestyle','health','tech']){
    await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(500);
    const r=await p.evaluate(()=>{document.body.classList.add('lang-vi');const out=[];P.forEach((pp,pi)=>{const box=pp.el.querySelector('.sents');pp.sents.forEach((s,si)=>{const v=s.el.querySelector('.vt');if(!v)return;const over=(s.el.offsetTop+v.offsetHeight)-(box.offsetTop+box.clientHeight);const fe=parseFloat(getComputedStyle(s.el.querySelector('.line')).fontSize),fv=parseFloat(getComputedStyle(v).fontSize);out.push({t:passages[pi].topic,si,over,ratio:fv/fe})})});document.body.classList.remove('lang-vi');return out});
    r.forEach(x=>{minRatio=Math.min(minRatio,x.ratio); if(x.over>1) bad.push(k+':'+x.t.slice(0,12)+'#'+x.si+' over '+x.over)});
  }
  console.log(name,'cỡ chữ VI/EN nhỏ nhất',minRatio.toFixed(2),'tràn',bad.length?bad:'không'); await ctx.close();
}
await b.close(); srv.close();
