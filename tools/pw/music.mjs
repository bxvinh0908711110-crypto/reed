// Nút nhạc nền trên đầu trang. Chạy: node tools/pw/music.mjs
import { chromium, devices } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const MIME={'.html':'text/html','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'')||'index.html';try{const b=fs.readFileSync('E:/Your English/deploy/'+u);r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
let fails=0; const ok=(c,m)=>{ console.log((c?'PASS ':'FAIL ')+m); if(!c) fails++; };
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for(const [name,opts] of [['SE',devices['iPhone SE']],['13',devices['iPhone 13']],['d1280',{viewport:{width:1280,height:720}}],['w320',{viewport:{width:320,height:640},isMobile:true,hasTouch:true}]]){
  const ctx=await b.newContext(opts); await ctx.addInitScript(()=>{localStorage.setItem('reed_tour_done','1');localStorage.setItem('reed_tips',JSON.stringify({swipe_done:1,tap_done:1,listen_done:1,hold_done:1,recap_done:1,save_done:1}))}); await ctx.route('**/*supabase.co/**',r=>r.abort());
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(5000);
  const lay=await p.evaluate(()=>{ const r=s=>document.querySelector(s).getBoundingClientRect(); const m=r('#musicBtn'), n=r('#nbBtn'), t=r('#tipBtn'), br=r('#brandHome'); return {musicW:Math.round(m.width),h:Math.round(m.height),right:Math.round(n.right),vw:innerWidth,gapTip:Math.round(m.left-t.right),gapNb:Math.round(n.left-m.right),brandToTip:Math.round(t.left-br.right)}; });
  ok(lay.right<=lay.vw&&lay.gapTip>=4&&lay.gapNb>=4&&lay.brandToTip>=4&&lay.musicW>=30,name+': nút nằm gọn trên đầu trang '+JSON.stringify(lay));
  await p.screenshot({path:`tools/pw/shots/music_${name}.png`,clip:{x:0,y:0,width:opts.viewport?.width||opts.screen?.width||390,height:130}});
  if(name==='13'||name==='d1280'){
    await p.click('#musicBtn'); await p.waitForTimeout(700); await p.screenshot({path:'tools/pw/shots/music_on_'+name+'.png',clip:{x:0,y:0,width:opts.viewport?.width||390,height:130}});
    let s=await p.evaluate(()=>({pressed:musicBtn.getAttribute('aria-pressed'),playing:Bgm.playing}));
    ok(s.pressed==='true'&&s.playing,name+': bấm → phát '+JSON.stringify(s));
    const t1=await p.evaluate(()=>0); await p.waitForTimeout(600);
    await p.evaluate(()=>goStep(1)); await p.waitForTimeout(900);
    ok(await p.evaluate(()=>Bgm.playing),name+': đổi bước/vào bài, nhạc vẫn phát');
    await p.click('#musicBtn'); await p.waitForTimeout(400);
    s=await p.evaluate(()=>({pressed:musicBtn.getAttribute('aria-pressed'),playing:Bgm.playing}));
    ok(s.pressed==='false'&&!s.playing,name+': bấm nữa → dừng '+JSON.stringify(s));
  }
  ok(errs.length===0,name+': không lỗi JS'+(errs.length?': '+errs[0]:'')); await ctx.close();
}
await b.close(); srv.close(); console.log(fails?`\n${fails} rớt`:'\nTất cả đạt'); process.exit(fails?1:0);
