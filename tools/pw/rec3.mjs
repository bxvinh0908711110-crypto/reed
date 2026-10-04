import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs';
const types={'.svg':'image/svg+xml','.html':'text/html','.webp':'image/webp','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');try{const e=u.slice(u.lastIndexOf('.'));if(types[e])r.setHeader('Content-Type',types[e]);r.end(fs.readFileSync('E:/Your English/deploy/'+u))}catch{r.statusCode=404;r.end()}}).listen(8804);
fs.copyFileSync('E:/Your English/index.html','E:/Your English/deploy/index.html');
const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['mobile',{...devices['iPhone 13']}],['desktop',{viewport:{width:1280,height:720}}]]){
  const ctx=await b.newContext({...opts,permissions:['microphone']}); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8804/index.html'); await p.waitForTimeout(6500); await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
  const st=()=>p.evaluate(()=>({state:Rec.state,mic:document.querySelector('#micBtn').className,player:document.querySelector('#player').className,sheet:document.querySelector('#recSheet').hidden}));
  const clip=async f=>p.screenshot({path:`shots/r3_${name}_${f}.png`,clip:{x:0,y:p.viewportSize().height-100,width:p.viewportSize().width,height:100}});
  await clip('0'); await p.click('#micBtn'); await p.waitForTimeout(2200); console.log(name,'recording ->',JSON.stringify(await st())); await clip('1');
  await p.click('#player .play'); await p.waitForTimeout(500); console.log(name,'after stop ->',JSON.stringify(await st())); await clip('2');
  await p.click('#micBtn'); await p.waitForTimeout(300); console.log(name,'tap while playing (stop) ->',(await st()).mic);
  await clip('3');
  await p.mouse.move(0,0); await p.waitForTimeout(300);
  await p.click('#micBtn'); await p.waitForTimeout(1200); console.log(name,'tap = re-record ->',(await st()).state);
  await p.click('#player .play'); await p.waitForTimeout(600); await p.click('#micBtn'); await p.waitForTimeout(300); // stop playback
  const box=await p.locator('#micBtn').boundingBox(); await p.mouse.move(box.x+box.width/2,box.y+box.height/2); await p.mouse.down(); await p.waitForTimeout(700); await p.mouse.up(); await p.waitForTimeout(300);
  console.log(name,'long-press replay ->',(await st()).mic,'errors',errs);
  await ctx.close();
}
await b.close(); srv.close();
