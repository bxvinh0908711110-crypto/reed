# Xuất bài đặc biệt "Liên Xô sụp đổ" (dự án AI Editor) thành trang TÁCH FILE trong stories/ussr/ cho Reed.
# Khác dist/build_dist.py của dự án gốc: không nhúng base64 mà ghi file riêng (stories/ussr/files/...), trang chỉ tải khi người dùng mở bài.
#   python tools/export_story.py        (cần Pillow + ffmpeg; chỉ ĐỌC dự án gốc ở SRC, ghi vào stories/ussr/)
import os, re, io, json, shutil, subprocess, sys
from PIL import Image

SRC = r'E:\AI Editor\AI Editor\projects\lien-xo-sup-do'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'stories', 'ussr'); FILES = os.path.join(DEST, 'files')
OUT = os.path.join(SRC, 'out')
MAXPX = 1200   # cạnh dài tối đa của ảnh (trước 1500): giảm bộ nhớ giải mã trên điện thoại
SETS = {'vi': '', 'en_michael': '_en_am_michael'}   # giọng Việt (Hải Đăng) + English (Michael)

shutil.rmtree(DEST, ignore_errors=True); os.makedirs(FILES)
assets = {}; st = {'img_raw': 0, 'img_out': 0, 'aud_out': 0}

def put(key, data):
    p = os.path.join(FILES, key.replace('/', os.sep)); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(data); return 'files/' + key

# ---- ảnh: WebP, cạnh dài ≤ 1500
imgs = sorted(set(l.strip() for l in open(os.path.join(OUT, 'fix', 'assets_used.txt'), encoding='utf8') if l.strip().lower().endswith(('.png', '.jpg'))))
for p in imgs:
    f = os.path.join(SRC, p.lstrip('/').replace('/', os.sep))
    if not os.path.isfile(f): continue
    im = Image.open(f); im.load(); st['img_raw'] += os.path.getsize(f)
    m = max(im.size)
    if m > MAXPX:
        s = MAXPX / m; im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=78, method=4, exact=True); b = buf.getvalue(); st['img_out'] += len(b)
    key = p.lstrip('/')
    assets[key] = {'u': put(os.path.splitext(key)[0] + '.webp', b)}   # khoá giữ đuôi gốc (.png) để mã trang tra đúng

# ---- âm thanh
TMP = os.path.join(ROOT, 'tools', '_story_tmp'); os.makedirs(TMP, exist_ok=True)
def add_audio(key, src, args, ext):
    out = os.path.join(TMP, re.sub(r'[^A-Za-z0-9]+', '_', key) + ext)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src] + args + [out], check=True, capture_output=True)
    b = open(out, 'rb').read(); st['aud_out'] += len(b)
    assets[key] = {'u': put(os.path.splitext(key)[0] + ext, b)}
for k, suf in SETS.items():
    add_audio('mix/bed%s.wav' % suf, os.path.join(SRC, 'mix', 'bed%s.wav' % suf), ['-ac', '2', '-ar', '44100', '-b:a', '96k'], '.mp3')
    for i in range(1, 19):
        n = 'b%02d.wav' % i
        add_audio('mix/lines/%s/%s' % (k, n), os.path.join(SRC, 'mix', 'lines', k, n), ['-ac', '1', '-ar', '44100', '-b:a', '64k'], '.mp3')
for i in range(1, 20):   # ngân nhạc: giữ WAV để vòng lặp liền mạch (mp3 có khoảng trễ ở điểm nối)
    n = 'hold_%02d.wav' % i
    add_audio('mix/holds/' + n, os.path.join(SRC, 'mix', 'holds', n), ['-ac', '1', '-ar', '22050'], '.wav')
shutil.rmtree(TMP, ignore_errors=True)

# ---- audio_sets: chỉ 2 bộ, đường dẫn bed khớp khoá assets
s = open(os.path.join(OUT, 'chain', 'audio_sets.js'), encoding='utf8').read()
sets = json.loads(s[len('window.E2_SETS='):].rstrip().rstrip(';'))
sets = {k: sets[k] for k in SETS}
for k, v in sets.items():
    v['bed'] = '../mix/bed%s.wav' % SETS[k]
    for x in ('audio', 'voice'): v.pop(x, None)
audio_sets = 'window.E2_SETS=' + json.dumps(sets, ensure_ascii=False) + ';'

# ---- shim: tra khoá -> URL file (img.src / audio src / Audio() / innerHTML <img>)
SHIM = r'''(function(){
var D=window.__ASSETS||{};
function norm(u){u=String(u).split('?')[0].split('#')[0];u=u.replace(/^(https?:)?\/\/[^\/]+\//,'').replace(/^file:\/\/\/?.*?lien-xo-sup-do\//,'');while(/^(\.\.\/|\.\/)/.test(u))u=u.replace(/^(\.\.\/|\.\/)/,'');return u.replace(/^out\//,'').replace(/^dist\//,'')}
function res(v){if(!v||/^(data|blob):/.test(v))return v;var a=D[norm(v)];return a?a.u:v}
window.__res=res;
var d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:function(){return d.get.call(this)},set:function(v){d.set.call(this,res(v))},configurable:true});
var m=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');Object.defineProperty(HTMLMediaElement.prototype,'src',{get:function(){return m.get.call(this)},set:function(v){m.set.call(this,res(v))},configurable:true});
var A0=window.Audio;window.Audio=function(u){var a=new A0();if(u)a.src=u;return a};window.Audio.prototype=A0.prototype;
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&(this instanceof HTMLImageElement||this instanceof HTMLMediaElement))v=res(v);return sa.call(this,n,v)};
var ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(Element.prototype,'innerHTML',{get:function(){return ih.get.call(this)},set:function(v){if(typeof v==='string'&&v.indexOf('<img')>=0)v=v.replace(/(<img[^>]*?\ssrc=)(["'])([^"']+)\2/g,function(_,a,q,u){return a+q+res(u)+q});ih.set.call(this,v)},configurable:true});
})();'''

# ---- Phần thêm cho Reed: chữ giao diện tiếng Anh theo ngôn ngữ chọn + báo cho trang cha (sẵn sàng / bước / xong / đóng)
EXTRA = r'''(function(){
var q=new URLSearchParams(location.search),sel=document.getElementById('lang');
var RULES=[['Sự sụp đổ của Liên Xô','The Fall of the Soviet Union'],
['Cuộn chuột (hoặc','Scroll (or use \u2193 \u2191, Space, swipe) to see one step at a time. Each scroll plays one scene, then waits for you.'],
['Vuốt lên/xuống','Swipe up or down to see one step at a time. Each swipe plays one scene, then waits for you. Tap \u22ef at the top right for language, sound and subtitles.'],
['Bắt đầu (có âm thanh)','Start (with sound)'],['Bắt đầu không âm thanh','Start without sound'],
['Hình minh hoạ','Illustrations, not archival footage \u00b7 draft audio mix'],
['Âm thanh: bật','Sound: on'],['Âm thanh: tắt','Sound: off'],['Phụ đề: bật','Subtitles: on'],['Phụ đề: tắt','Subtitles: off'],
['Xem lại từ đầu','Restart'],['Cuộn xuống','Scroll down \u2193'],['Vuốt lên \u2191','Swipe up \u2191']];
function tr(s){for(var i=0;i<RULES.length;i++)if(s.indexOf(RULES[i][0])===0)return RULES[i][1];return null}
var ids=['#start h1','#start p','#go','#go0','#start .sub','#mu','#en','#rs','#hint'],busy=false;
function isEn(){return sel&&/^en/.test(sel.value)}
function fix(el){ if(busy||!el)return; var cur=el.textContent;
  if(el._en!==undefined&&cur===el._en) return;            // do chính ta đặt
  var e=tr(cur); if(e===null) return;                     // không phải chữ tiếng Việt đã biết
  el._vi=cur; el._en=e; if(isEn()){ busy=true; el.textContent=e; busy=false; } }
function sync(){ ids.forEach(function(s){ var el=document.querySelector(s); if(!el)return; fix(el); if(el._vi!==undefined){ busy=true; el.textContent=isEn()?el._en:el._vi; busy=false; } }); document.documentElement.lang=isEn()?'en':'vi'; document.title=isEn()?'The Fall of the Soviet Union':'Liên Xô sụp đổ'; }
var mo=new MutationObserver(function(ms){ ms.forEach(function(m){ var el=m.target.nodeType===1?m.target:m.target.parentNode; ids.forEach(function(s){ var x=document.querySelector(s); if(x&&(x===el||x.contains(el)))fix(x); }); }); });
ids.forEach(function(s){ var el=document.querySelector(s); if(el) mo.observe(el,{childList:true,characterData:true,subtree:true}); });
if(sel) sel.addEventListener('change',function(){ setTimeout(sync,0) });
sync(); new MutationObserver(sync).observe(document.body,{childList:true}); setTimeout(sync,300);
// ---- báo cho Reed (trang cha): sẵn sàng, bước hiện tại, đã xem hết, đóng bằng Esc
if(window.parent!==window){
  var post=function(o){ try{ parent.postMessage(Object.assign({source:'reed-story',id:'ussr'},o),location.origin) }catch(e){} };
  var K=function(){return document.querySelectorAll('.step').length}, last=-1, done=false;
  var rd=setInterval(function(){ if(document.body.dataset.ready==='1'){ clearInterval(rd); post({event:'ready'}); } },100);
  addEventListener('scroll',function(){ var p=Math.round(scrollY/Math.max(1,innerHeight)); if(p!==last){ last=p; post({event:'step',step:p,of:K()}); if(!done&&p>=K()-1){ done=true; post({event:'done'}); } } },{passive:true});
  addEventListener('keydown',function(e){ if(e.key==='Escape'){ post({event:'close'}); } });
}
})();'''

# ---- ghép HTML
h = open(os.path.join(OUT, 'scroll.html'), encoding='utf8').read()
def patch(a, b):
    global h
    if h.count(a) != 1: raise SystemExit('KHÔNG KHỚP (mã nguồn bài đã đổi?): ' + a[:90])
    h = h.replace(a, b)
# (a) chế độ nhẹ: bật tự động trên màn cảm ứng / nhỏ, ép bằng ?lite=1|0
patch("const q=new URLSearchParams(location.search),SC=window.SCENES", "const q=new URLSearchParams(location.search),LITE=q.get('lite')==='1'||(q.get('lite')!=='0'&&matchMedia('(pointer:coarse),(max-width:760px)').matches),SC=window.SCENES")
patch("function startHoldAnim(b){stopHoldAnim();haT=performance.now();const lp=()=>{const h=(performance.now()-haT)/1000;API.holdT=Math.min(h,40);API.frame(b);if(h<40)haRaf=requestAnimationFrame(lp);else haRaf=0};haRaf=requestAnimationFrame(lp)}",
      "function startHoldAnim(b){stopHoldAnim();haT=performance.now();let sk=0;const HM=LITE?12:40;const lp=()=>{const h=(performance.now()-haT)/1000;API.holdT=Math.min(h,HM);if(!LITE||(sk++%3===0))API.frame(b);if(h<HM)haRaf=requestAnimationFrame(lp);else haRaf=0};haRaf=requestAnimationFrame(lp)}")
patch("const loop=()=>{if(run!==r)return;API.frame(Math.min(now(),b));r.raf=requestAnimationFrame(loop)};",
      "let sk2=0;const loop=()=>{if(run!==r)return;if(!LITE||(sk2++&1)===0)API.frame(Math.min(now(),b));r.raf=requestAnimationFrame(loop)};")
# (b) âm thanh: 3 phần tử cố định (nền, giọng, ngân) được mở khoá khi bấm Start — iOS Safari chặn play() của phần tử mới ngoài thao tác chạm
patch("let au=null,vo=null;const setAudio=()=>{[au,vo].forEach(x=>x&&x.pause());au=vo=null;if(SETS&&lang){au=new Audio(SETS[lang].bed);au.preload='auto'}};",
      "const PE={},SIL='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';const pe=(n,src)=>{let a=PE[n];if(!a){a=PE[n]=new Audio()}a.pause();a.loop=false;a.volume=1;a.muted=false;a.src=src;return a};\nconst unlockAudio=()=>{['au','vo','hd'].forEach(n=>{try{let a=PE[n]||(PE[n]=new Audio());a.muted=true;a.src=SIL;const p=a.play();const un=()=>{a.pause();a.muted=false};if(p&&p.then)p.then(un,un);else un()}catch(e){}})};\nlet au=null,vo=null;const setAudio=()=>{[au,vo].forEach(x=>x&&x.pause());au=vo=null;if(SETS&&lang){au=pe('au',SETS[lang].bed);au.preload='auto'}};")
patch("vo=(useAu&&c)?new Audio(SETS[lang].lines+c.id+'.wav'):null;", "vo=(useAu&&c)?pe('vo',SETS[lang].lines+c.id+'.wav'):null;")
patch("hd=new Audio('../mix/holds/hold_'+String(i+1).padStart(2,'0')+'.wav');hd.loop=true;hd.volume=0;", "hd=pe('hd','../mix/holds/hold_'+String(i+1).padStart(2,'0')+'.wav');hd.loop=true;hd.volume=0;")
patch("document.getElementById('go').onclick=()=>begin(true);document.getElementById('go0').onclick=()=>begin(false);", "document.getElementById('go').onclick=()=>{unlockAudio();begin(true)};document.getElementById('go0').onclick=()=>{unlockAudio();begin(false)};")
h = h.replace("join('\n')", "join('\\n')")                                  # sửa lỗi: xuống dòng thật nằm trong chuỗi JS
h = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>' + open(os.path.join(OUT, m.group(1)), encoding='utf8').read() + '</style>', h)
def inl(m):
    rel = m.group(1)
    js = audio_sets if rel == 'chain/audio_sets.js' else open(os.path.join(OUT, rel), encoding='utf8').read()
    return '<script>' + js.replace('</script', '<\\/script') + '</script>'
h = re.sub(r'<script src="([^"]+)"></script>', inl, h)
first = h.index('<script>window.__errs')
h = h[:first] + '<script>window.__ASSETS=' + json.dumps(assets, separators=(',', ':')) + ';</script>\n<script>' + SHIM + '</script>\n' + h[first:]
LITECSS = '<style>html.lite #stage *{filter:none!important}html.lite #stage.e2root{box-shadow:none}</style>'
h = h.replace('</head>', LITECSS + '<script>(function(){var q=new URLSearchParams(location.search),l=q.get("lite");if(l==="1"||(l!=="0"&&matchMedia("(pointer:coarse),(max-width:760px)").matches))document.documentElement.classList.add("lite")})()</script></head>', 1)
h = h.replace('</body></html>', '<script>' + EXTRA + '</script></body></html>')
open(os.path.join(DEST, 'index.html'), 'w', encoding='utf8').write(h)

# ---- ảnh bìa 16:9 cho thẻ (cắt quanh lá bài sao của kf_b01)
kf = Image.open(os.path.join(SRC, 'assets', 'keyframes', 'kf_b01.png')).convert('RGB'); w, hh = kf.size
ch = int(w * 9 / 16); y0 = max(0, min(hh - ch, int(hh * 0.50) - ch // 2))
kf.crop((0, y0, w, y0 + ch)).resize((640, 360), Image.LANCZOS).save(os.path.join(ROOT, 'deploy', 'img', 'topic-stories.webp'), 'WEBP', quality=82, method=6)

n = sum(len(f) for _, _, f in os.walk(FILES)); tot = sum(os.path.getsize(os.path.join(d, x)) for d, _, f in os.walk(FILES) for x in f)
print('file:', n, '| ảnh %.1f -> %.1f MB' % (st['img_raw'] / 1e6, st['img_out'] / 1e6), '| âm thanh %.1f MB' % (st['aud_out'] / 1e6), '| tổng files/ %.1f MB' % (tot / 1e6), '| index.html %.0f KB' % (os.path.getsize(os.path.join(DEST, 'index.html')) / 1e3))
