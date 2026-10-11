import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8797);
const b=await chromium.launch();
const vps=[['SE',{...devices['iPhone SE']}],['13',{...devices['iPhone 13']}],['14PM',{...devices['iPhone 14 Pro Max']}],['d1280x720',{viewport:{width:1280,height:720}}],['d1333x700',{viewport:{width:1333,height:700},deviceScaleFactor:1.5}],['d1366',{viewport:{width:1366,height:768}}],['d1920',{viewport:{width:1920,height:1080}}],['d1024x600',{viewport:{width:1024,height:600}}]];
for(const [name,opts] of vps){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8797/index.html'); await p.waitForTimeout(5000);
  const bad=[];
  for(const k of ['family','friends','school','work','lifestyle','health','tech']){
    await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(500);
    const n=await p.evaluate(()=>P.length);
    for(let pi=0;pi<n;pi++){
      const r=await p.evaluate((pi)=>{ document.body.classList.remove('lang-vi'); jumpToLesson&&0; return null },pi);
      // đi tới recap của bài pi
      await p.evaluate((pi)=>{const pp=P[pi];scrollTo(0,pp.el.getBoundingClientRect().top+scrollY+pp.sents[pp.sents.length-1].lo+2)},pi); await p.waitForTimeout(500);
      await p.evaluate(()=>setLang('vi')); await p.waitForTimeout(500);
      const m=await p.evaluate((pi)=>{const w=document.querySelector('#rc'+pi);const rv=w&&w.querySelector('.rv');if(!rv)return {nov:true};const box=w.closest('.sents').getBoundingClientRect();const rr=rv.getBoundingClientRect();const last=[...rv.getClientRects()];return {cur:P[pi].cur,last:P[pi].sents.length-1,over:Math.round(rr.bottom-box.bottom),h:Math.round(rv.offsetHeight),rs:getComputedStyle(w).getPropertyValue('--rs'),hh:w.style.height,marks:rv.querySelectorAll('mark').length}},pi);
      if(m.nov||m.over>1||m.cur!==m.last) bad.push(k+'#'+pi+JSON.stringify(m));
      await p.evaluate(()=>setLang('en')); await p.waitForTimeout(200);
    }
  }
  console.log(name,bad.length?bad:'ok'); await ctx.close();
}
await b.close(); srv.close();
