import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8794);
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1')}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8794/deploy/index.html');
  const tip=()=>p.evaluate(()=>{const t=document.querySelector('.tip');return t.classList.contains('on')?t.querySelector('.tt').textContent:null});
  const wait=ms=>p.waitForTimeout(ms);
  await wait(9500); // splash xong
  console.log(name,'1 hero idle ->',await tip()); await p.screenshot({path:`shots/tip_${name}_1.png`});
  await p.evaluate(()=>goStep(1)); await wait(900);
  console.log(name,'2 after step ->',await tip());
  await p.evaluate(()=>goStep(1)); await wait(900);
  await wait(3000); console.log(name,'3 dwell on phrase ->',await tip()); await p.screenshot({path:`shots/tip_${name}_3.png`});
  await p.evaluate(()=>{document.querySelector('.passage .sent .ph').dispatchEvent(new MouseEvent('click',{bubbles:true}))}); await wait(1800);
  console.log(name,'4 after tap ->',await tip()); await p.screenshot({path:`shots/tip_${name}_4.png`});
  await p.click('#player .play'); await wait(800); console.log(name,'5 after play ->',await tip());
  console.log(name,'state',await p.evaluate(()=>localStorage.getItem('reed_tips')),'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
