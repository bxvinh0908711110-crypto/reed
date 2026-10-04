import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8807);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext({...opts,permissions:['microphone']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8807/index.html'); await p.waitForTimeout(6500); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  const st=()=>p.evaluate(()=>({state:Rec.state,mic:document.querySelector('#micBtn').className,card:document.querySelector('#recSheet').className,hidden:document.querySelector('#recSheet').hidden}));
  await p.click('#micBtn'); await p.waitForTimeout(2200);
  await p.click('#player .play'); await p.waitForTimeout(600); console.log(name,'after stop ->',JSON.stringify(await st()),await p.evaluate(()=>document.querySelector('.rcmp').className)); await p.screenshot({path:`shots/r5_${name}.png`,clip:{x:0,y:p.viewportSize().height-250,width:p.viewportSize().width,height:250}});
  await p.click('#recSheet .rmine'); await p.waitForTimeout(300); console.log(name,'mine ->',await p.evaluate(()=>document.querySelector('.rmine').className)); await p.click('#recSheet .rmodel'); await p.waitForTimeout(400); console.log(name,'model ->',await p.evaluate(()=>[document.querySelector('.rmine').className,document.querySelector('.rmodel').className]));
  await p.click('#recSheet .rcmp'); await p.waitForTimeout(500); console.log(name,'compare ->',await p.evaluate(()=>[document.querySelector('.rcmp').className,document.querySelector('.rmine').className])); await p.click('#recSheet .rcmp'); await p.waitForTimeout(300);
  await p.click('#recSheet .rdone'); await p.waitForTimeout(500); console.log(name,'Xong ->',JSON.stringify(await st()));
  await p.click('#micBtn'); await p.waitForTimeout(700); console.log(name,'tap mic w/ take ->',JSON.stringify(await st()));
  await p.click('#recSheet .rredo'); await p.waitForTimeout(1300); console.log(name,'Ghi lại ->',JSON.stringify(await st()));
  await p.click('#player .play'); await p.waitForTimeout(500); await p.click('#recSheet .rdone'); await p.waitForTimeout(300);
  const box=await p.locator('#micBtn').boundingBox(); await p.mouse.move(box.x+box.width/2,box.y+box.height/2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(1200); console.log(name,'long-press ->',(await st()).state,'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
