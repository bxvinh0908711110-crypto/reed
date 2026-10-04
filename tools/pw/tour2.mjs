import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/'+u))}catch{r.statusCode=404;r.end()}}).listen(8798);
const b=await chromium.launch();
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext(opts); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8798/index.html'); await p.waitForTimeout(9500);
  console.log(name,'welcome open:',await p.evaluate(()=>[Tour.welcomeOpen,!document.querySelector('#welcome').hidden])); await p.screenshot({path:`shots/wel_${name}.png`});
  await p.mouse.wheel(0,500); await p.waitForTimeout(500); console.log(name,'gesture blocked:',await p.evaluate(()=>scrollY===0));
  await p.click('#welcome .w1'); await p.waitForTimeout(1500);
  for(let n=1;n<=6;n++){ await p.waitForTimeout(900);
    const o=await p.evaluate(()=>{const a=document.querySelector('#tourArrow');const d=a.querySelector('.ta').getAttribute('d');return {n:document.querySelector('#tourCard .tn').textContent,arrow:a.classList.contains('on'),d:d.slice(0,40)}});
    console.log(name,JSON.stringify(o)); await p.screenshot({path:`shots/tour2_${name}_${n}.png`}); if(n<6) await p.click('#tourCard .tg2'); }
  await p.click('#tourCard .tg2'); await p.waitForTimeout(700);
  console.log(name,'done:',await p.evaluate(()=>[Tour.active,localStorage.getItem('reed_tour_done'),document.querySelector('#tourArrow').hidden]),'errors',errs);
  await ctx.close();
  // "Đã hiểu"
  const c2=await b.newContext(opts); await c2.route('**/*supabase.co/**',r=>r.abort()); const p2=await c2.newPage();
  await p2.goto('http://localhost:8798/index.html'); await p2.waitForTimeout(9500); await p2.click('#welcome .w2'); await p2.waitForTimeout(700);
  console.log(name,'Đã hiểu ->',await p2.evaluate(()=>[Tour.active,Tour.welcomeOpen,localStorage.getItem('reed_tour_done'),document.querySelector('#welcome').hidden]));
  await p2.reload(); await p2.waitForTimeout(8000); console.log(name,'reload welcome?',await p2.evaluate(()=>Tour.welcomeOpen));
  await c2.close();
}
await b.close(); srv.close();
