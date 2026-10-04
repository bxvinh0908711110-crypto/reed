import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8796);
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8796/index.html'); await p.waitForTimeout(9500);
  const coach=()=>p.evaluate(()=>{const c=document.querySelector('#coach');return c.classList.contains('on')?[c.querySelector('.cn').textContent,c.querySelector('.ct').textContent,document.querySelectorAll('.tip-ring').length]:null});
  console.log(name,'start ->',await coach(),'topic',await p.evaluate(()=>curTopic)); await p.screenshot({path:`shots/pr_${name}_1.png`});
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(1200);
  console.log(name,'after step ->',await coach()); await p.screenshot({path:`shots/pr_${name}_2.png`});
  await p.waitForTimeout(300); await p.evaluate(()=>{document.querySelector('.passage .sent .ph[data-i="0"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))}); await p.waitForTimeout(900);
  console.log(name,'after tap ->',await coach());
  await p.click('#player .play'); await p.waitForTimeout(900);
  console.log(name,'after play ->',await coach()); await p.screenshot({path:`shots/pr_${name}_4.png`});
  await p.click('#coach .cb'); await p.waitForTimeout(900);
  console.log(name,'finished ->',await p.evaluate(()=>[curTopic,Math.round(scrollY),localStorage.getItem('reed_practice_done'),JSON.stringify(localStorage.getItem('reed_topic'))]),'coach',await coach());
  // reload -> no practice again
  await p.reload(); await p.waitForTimeout(6000); console.log(name,'reload ->',await coach(), await p.evaluate(()=>curTopic));
  // ? replays
  await p.click('#tipBtn'); await p.waitForTimeout(900); console.log(name,'? ->',await coach(),await p.evaluate(()=>curTopic));
  await p.click('#coach .cs'); await p.waitForTimeout(700); console.log(name,'skip ->',await coach(),await p.evaluate(()=>curTopic),'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
