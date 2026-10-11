import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8801);
const b=await chromium.launch();
for(const [name,opts] of [['13',devices['iPhone 13']],['SE',devices['iPhone SE']],['d1280',{viewport:{width:1280,height:720}}],['d1920',{viewport:{width:1920,height:1080}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); await p.goto('http://localhost:8801/index.html'); await p.waitForTimeout(5000);
  const diffs=[]; let n=0;
  for(const k of ['family','school','work','health','tech']){
    await p.click(`#topics button[data-k="${k}"]`); await p.waitForTimeout(500);
    const cnt=await p.evaluate(()=>P.length);
    const res=await p.evaluate(()=>{ // đo tất cả slide (không recap) ở EN rồi VI
      const out=[];
      const measure=()=>P.map(pp=>pp.sents.map(s=>{ if(s.recap) return null; const el=s.el,l=el.querySelector('.line'),v=el.querySelector('.vt'); const t=document.body.classList.contains('lang-vi')?v:l; if(!t) return null; const r=t.getBoundingClientRect(),sr=el.closest('.sents').getBoundingClientRect(); return {top:Math.round(r.top-sr.top),fs:+parseFloat(getComputedStyle(t).fontSize).toFixed(1)}; }));
      const en=measure(); document.body.classList.add('lang-vi'); const vi=measure(); document.body.classList.remove('lang-vi');
      en.forEach((a,pi)=>a.forEach((x,si)=>{ const y=vi[pi][si]; if(x&&y) out.push({pi,si,topEN:x.top,topVI:y.top,fsEN:x.fs,fsVI:y.fs}); }));
      return out; });
    res.forEach(x=>{ n++; if(Math.abs(x.topEN-x.topVI)>1||Math.abs(x.fsEN-x.fsVI)>.6) diffs.push(k+JSON.stringify(x)); });
  }
  console.log(name,'slides',n,'khác nhau',diffs.length?diffs.slice(0,12):'không'); await ctx.close();
}
await b.close(); srv.close();
