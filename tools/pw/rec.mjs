import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8802);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext({...opts,permissions:['microphone']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8802/index.html'); await p.waitForTimeout(6500);
  await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  const st=()=>p.evaluate(()=>({state:Rec.state,open:Rec.open,cls:document.querySelector('#recSheet').className,time:document.querySelector('.rtime').textContent,mic:document.querySelector('#micBtn').className,txt:document.querySelector('.rtxt').textContent.slice(0,30)}));
  await p.click('#micBtn'); await p.waitForTimeout(2300); console.log(name,'recording ->',JSON.stringify(await st())); await p.screenshot({path:`shots/rec_${name}_1.png`});
  await p.click('#recSheet .rstop'); await p.waitForTimeout(800); console.log(name,'review ->',JSON.stringify(await st())); await p.screenshot({path:`shots/rec_${name}_2.png`});
  await p.click('#recSheet .rmine'); await p.waitForTimeout(400); console.log(name,'playing mine ->',await p.evaluate(()=>document.querySelector('.rmine').className));
  await p.waitForTimeout(2500); await p.click('#recSheet .rcmp'); await p.waitForTimeout(700); console.log(name,'compare ->',await p.evaluate(()=>[document.querySelector('.rcmp').className,document.querySelector('.rmine').className]));
  await p.click('#recSheet .rcmp'); await p.waitForTimeout(300);
  await p.click('#recSheet .rdone'); await p.waitForTimeout(500); console.log(name,'closed ->',JSON.stringify(await st()));
  await p.click('#micBtn'); await p.waitForTimeout(700); console.log(name,'2nd tap (saved) ->',JSON.stringify(await st()));
  await p.click('#recSheet .rredo'); await p.waitForTimeout(1500); console.log(name,'redo ->',(await st()).state);
  const y0=await p.evaluate(()=>scrollY); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(600); console.log(name,'step blocked while recording:',y0===await p.evaluate(()=>scrollY));
  await p.click('#recSheet .rcancel'); await p.waitForTimeout(400); console.log(name,'cancelled ->',(await st()).open,'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
