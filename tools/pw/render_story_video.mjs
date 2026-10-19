// Quay sẵn bài Stories thành video H.264 từng bước (cho điện thoại): hình từ Engine2.frame(t), âm thanh trộn sẵn (nền + giọng).
//   node tools/render_story_video.mjs [vi|en_michael ...]      (cần Playwright, ffmpeg; đọc âm thanh gốc ở dự án AI Editor)
// Kết quả: stories/ussr/video/<bộ>/bNN.mp4 + pNN.jpg (khung đầu làm poster) và stories/ussr/v.html (trang phát video, từ tools/story_player.html)
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const SRC='E:/AI Editor/AI Editor/projects/lien-xo-sup-do', ROOT='E:/Your English', DEST=ROOT+'/stories/ussr';
const SETS={ vi:{suf:'', label:'Tiếng Việt'}, en_michael:{suf:'_en_am_michael', label:'English (Michael)'} };
const PAGEONLY=process.argv[2]==='--page-only';   // chỉ ghi lại v.html từ manifest + mẫu, không quay lại video
const wanted=PAGEONLY?[]:(process.argv.slice(2).length?process.argv.slice(2):Object.keys(SETS));
const FPS=30, VW=640, VH=1136, TMP=process.env.TEMP+'/story_frames';
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]).replace(/^\//,'');if(u===''||u.endsWith('/'))u+='index.html';try{const b=fs.readFileSync(ROOT+'/stories/'+u.replace(/^stories\//,''));r.setHeader('Content-Type',MIME[path.extname(u)]||'application/octet-stream');r.end(b)}catch{r.statusCode=404;r.end()}}).listen(0);
const port=await new Promise(res=>srv.on('listening',()=>res(srv.address().port)));
const ff=(...a)=>execFileSync('ffmpeg',['-y','-v','error',...a],{stdio:['ignore','inherit','inherit']});
const dur=f=>+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f]).toString().trim();
const b=await chromium.launch(); const manifest={};
for(const L of wanted){
  const S=SETS[L]; console.log('==',L);
  const ctx=await b.newContext({viewport:{width:660,height:1170},deviceScaleFactor:1}); const p=await ctx.newPage();
  await p.goto(`http://localhost:${port}/ussr/?lang=${L}&lite=0`); await p.waitForSelector('body[data-ready="1"]',{timeout:120000});
  await p.evaluate(()=>{ for(const id of ['start','menu','dots','cap','hint','prog']){ const e=document.getElementById(id); if(e) e.style.display='none'; } });
  const info=await p.evaluate(L=>{ const SC=window.SCENES,K=SC.length; return {T0:SC.map(s=>s.t0),T1:SC.map((s,i)=>i<K-1?SC[i+1].t0-0.001:s.t1),subs:window.E2_SETS[L].subs}; },L);
  const K=info.T0.length, out=`${DEST}/video/${L}`; fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
  const box=await p.evaluate(()=>{const r=document.getElementById('stage').getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width)&~1,height:Math.round(r.height)&~1}});
  const steps=[]; const t00=Date.now();
  for(let k=0;k<K;k++){
    const a=info.T0[k], bb=info.T1[k], c=info.subs[k]; const n=Math.max(2,Math.round((bb-a)*FPS)+1); const nn=String(k+1).padStart(2,'0');
    fs.rmSync(TMP,{recursive:true,force:true}); fs.mkdirSync(TMP,{recursive:true});
    for(let i=0;i<n;i++){ await p.evaluate(t=>Engine2.frame(t),Math.min(bb,a+i/FPS)); await p.screenshot({path:`${TMP}/f${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92,clip:box}); }
    // âm thanh: nền từ a tới b rồi tắt dần 0,4 s (như trang chạy trực tiếp) + giọng của bước, vào đúng mốc phụ đề
    const bedF=`${SRC}/mix/bed${S.suf}.wav`, voF=c?`${SRC}/mix/lines/${L}/b${String(k+1).padStart(2,'0')}.wav`:null;
    const bedDur=(bb-a)+0.4, vDelay=c?Math.max(0,c.start-a):0, vLen=voF?dur(voF):0, total=Math.max(bedDur,voF?vDelay+vLen+0.3:0);
    const vidDur=n/FPS, pad=Math.max(0,total-vidDur);
    const fc=`[0:a]atrim=start=${a}:end=${bb+0.4},asetpts=PTS-STARTPTS,afade=t=out:st=${(bb-a).toFixed(3)}:d=0.4,apad=whole_dur=${total.toFixed(3)}[bed]`+(voF?`;[1:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${Math.round(vDelay*1000)}|${Math.round(vDelay*1000)}[v];[bed][v]amix=inputs=2:normalize=0:duration=longest[a]`:`;[bed]anull[a]`);
    const args=['-framerate',String(FPS),'-i',`${TMP}/f%04d.jpg`,'-i',bedF]; if(voF) args.push('-i',voF);
    // đầu vào video là ảnh (0), nền là 1, giọng là 2 → sắp lại chỉ số trong bộ lọc
    const fc2=fc.replace('[0:a]','[1:a]').replace('[1:a]aformat','[2:a]aformat');
    ff(...args,'-filter_complex',fc2,'-map','0:v','-map','[a]','-vf',`scale=${VW}:${VH}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}`,
       '-c:v','libx264','-profile:v','main','-pix_fmt','yuv420p','-preset','slow','-crf','27','-r',String(FPS),'-g','60','-c:a','aac','-b:a','80k','-ar','44100','-ac','2','-t',total.toFixed(3),'-movflags','+faststart',`${out}/b${nn}.mp4`);
    ff('-i',`${TMP}/f0000.jpg`,'-vf',`scale=${Math.round(VW/2)}:${Math.round(VH/2)}:flags=lanczos`,'-q:v','6',`${out}/p${nn}.jpg`);
    steps.push({file:`video/${L}/b${nn}.mp4`,poster:`video/${L}/p${nn}.jpg`,dur:+total.toFixed(2)});
    console.log(`  bước ${k+1}/${K}  ${n} khung  ${total.toFixed(1)}s  ${(fs.statSync(`${out}/b${nn}.mp4`).size/1000)|0} KB  (${((Date.now()-t00)/1000)|0}s)`);
  }
  manifest[L]={label:S.label,subs:info.subs,steps};
  await ctx.close();
}
fs.rmSync(TMP,{recursive:true,force:true});
// trang phát
const old=fs.existsSync(DEST+'/video/manifest.json')?JSON.parse(fs.readFileSync(DEST+'/video/manifest.json','utf8')):{};
const all={...old,...manifest}; fs.writeFileSync(DEST+'/video/manifest.json',JSON.stringify(all));
const tpl=fs.readFileSync(ROOT+'/tools/story_player.html','utf8');
fs.writeFileSync(DEST+'/v.html',tpl.replace('/*__MANIFEST__*/null',JSON.stringify(all)));
const tot=[...fs.readdirSync(DEST+'/video',{recursive:true})].filter(f=>/\.(mp4|jpg)$/.test(f)).reduce((s,f)=>s+fs.statSync(DEST+'/video/'+f).size,0);
console.log('xong. video+poster %.1f MB',tot/1e6);
await b.close(); srv.close();
