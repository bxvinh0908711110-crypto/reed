import sys, re
sys.stdout.reconfigure(encoding='utf8')
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:80]
    s = s.replace(a, b, cnt)

# ---------- HTML player row: play | divider | title | mic | divider | chevron  + vùng ghi âm trong thanh ----------
MIC = re.search(r'<button class="mic" id="micBtn"[^>]*>(<svg.*?</svg>)</button>', s, re.S).group(1)
a = s.index('      <div class="row">\n        <button class="play"')
b = s.index('      <div class="settings-row">')
s = s[:a] + '''      <div class="row">
        <button class="play" aria-label="Play"><span class="playIconWrap"></span></button>
        <span class="divider d1"></span>
        <div class="lesson-content" id="lessonContent">
          <div class="lesson-title" id="lessonTitle"></div>
          <div class="lesson-subtitle" id="lessonSubtitle"></div>
          <div class="dots" id="dots"></div>
        </div>
        <div class="rec-live" id="recLive"><div class="rl-text"></div><div class="rl-row"><span class="rdot"></span><span class="rtime">0:00</span><span class="wave">''' + '<i></i>'*24 + '''</span></div></div>
        <button class="mic" id="micBtn" type="button" aria-label="Record your voice">''' + MIC + '''</button>
        <button class="rcancel2" id="recCancel" type="button">Hủy</button>
        <span class="divider d2"></span>
        <button class="chevron-button" id="openSettings" aria-label="Open voice and speed settings"><span class="chevron"></span></button>
      </div>
''' + s[b:]

# ---------- HTML thẻ nghe lại ----------
a = s.index('<div id="recSheet"'); b = s.index('<div id="tourBlock"') if '<div id="tourBlock"' in s[a:] else None
end = s.index('</div>\n</div>', s.index('class="rst err"', a)) + len('</div>\n</div>')
s = s[:a] + '''<div id="recSheet" class="recSheet" hidden role="dialog" aria-label="Ghi âm giọng đọc">
  <div class="rtxt"></div>
  <div class="rst rev">
    <div class="rrow r1"><button class="rb rmine" type="button"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Giọng bạn</button><button class="rb rmodel" type="button"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>Giọng mẫu</button></div>
    <div class="rsep"></div>
    <div class="rrow r2"><div class="rlinks"><button class="rl rcmp" type="button"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 3 4 4-4 4"/><path d="M3 7h18"/><path d="m7 21-4-4 4-4"/><path d="M21 17H3"/></svg>So sánh</button><span class="rv"></span><button class="rl rredo" type="button"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Ghi lại</button></div><button class="rb rdone" type="button">Xong</button></div>
  </div>
  <div class="rst err"><span class="rerr"></span><button class="rb rdone" type="button">Đóng</button></div>
</div>''' + s[end:]

# ---------- CSS: thay khối cũ ----------
a = s.index(".player .mic{width:34px;")
b = s.index("@media (prefers-reduced-motion:reduce){.player .mic.rec,.recSheet .rdot{animation:none}}") + len("@media (prefers-reduced-motion:reduce){.player .mic.rec,.recSheet .rdot{animation:none}}")
css = '''.player .mic{position:relative;width:38px;height:38px;flex:0 0 38px;margin-left:6px;border:0;border-radius:50%;background:#2c2c2f;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:background .2s ease,transform .15s ease}
.player .mic:active{transform:scale(.9)}
.player .mic.has::after{content:"";position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:#d9ff73;box-shadow:0 0 0 2px #090909}
@keyframes micPulse{0%,100%{opacity:1}50%{opacity:.35}}
.player .rec-live,.player .rcancel2{display:none}
.player .rec-live{flex:1;min-width:0;flex-direction:column;justify-content:center;gap:3px;padding:0 10px}
.player .rl-text{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player .rl-row{display:flex;align-items:center;gap:10px}
.player .rdot{width:9px;height:9px;border-radius:50%;background:#ff4136;flex:0 0 9px;animation:micPulse 1.1s ease-in-out infinite}
.player .rtime{font-variant-numeric:tabular-nums;font-weight:700;font-size:15px;color:#fff;min-width:2.4em}
.player .wave{display:flex;align-items:center;gap:3px;height:26px;flex:1;min-width:0;overflow:hidden}
.player .wave i{display:block;flex:0 0 3px;width:3px;height:6px;border-radius:2px;background:#ff4136;transition:height .1s linear}
.player .wave i.off{background:#3c3c3f}
.player .rcancel2{flex:0 0 auto;margin-left:6px;border:0;border-radius:999px;background:#2c2c2f;color:#fff;font:inherit;font-size:14px;font-weight:700;padding:9px 18px;cursor:pointer}
.player.recording .play{background:#ff3b30}
.player.recording .play .playIconWrap{display:none}
.player.recording .play::after{content:"";width:16px;height:16px;border-radius:3px;background:#fff}
.player.recording .rec-live{display:flex}
.player.recording .rcancel2{display:block}
.player.recording .lesson-content,.player.recording .mic,.player.recording .d2,.player.recording .chevron-button{display:none}
.recSheet{position:fixed;z-index:70;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 100px);width:min(460px,calc(100vw - 24px));transform:translate(-50%,12px);
  background:#0b0b0b;color:#fff;border-radius:24px;padding:18px 18px 14px;box-shadow:0 16px 40px rgba(0,0,0,.35);opacity:0;transition:opacity .25s ease,transform .25s ease}
.recSheet.on{opacity:1;transform:translate(-50%,0)}
.recSheet[hidden]{display:none}
.recSheet .rtxt{font-size:19px;font-weight:600;line-height:1.35;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.recSheet .rtxt:empty{display:none}
.recSheet .rst{display:none}
.recSheet.s-rev .rst.rev{display:block}
.recSheet.s-err .rst.err{display:flex;align-items:center;gap:12px}
.recSheet .rrow{display:flex;gap:10px;align-items:center}
.recSheet .rsep{height:1px;background:rgba(255,255,255,.12);margin:14px 0 10px}
.recSheet .rb{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:15px;font-weight:700;border:0;border-radius:999px;padding:11px 18px;cursor:pointer;background:#2c2c2f;color:#fff;transition:background .2s ease,transform .12s ease}
.recSheet .rb:active{transform:scale(.95)}
.recSheet .rb.on{background:var(--leaf);color:#0b0b0b}
.recSheet .rlinks{display:flex;align-items:center;gap:6px;flex:1}
.recSheet .rl{display:inline-flex;align-items:center;gap:7px;font:inherit;font-size:15px;font-weight:600;background:none;border:0;color:rgba(255,255,255,.88);padding:8px 8px;border-radius:10px;cursor:pointer}
.recSheet .rl.on{color:var(--leaf)}
.recSheet .rv{width:1px;height:20px;background:rgba(255,255,255,.18)}
.recSheet .rdone{background:var(--leaf);color:#0b0b0b;margin-left:auto}
.recSheet .rerr{flex:1;font-size:14px;line-height:1.45}
@media (prefers-reduced-motion:reduce){.player .rdot{animation:none}}'''
s = s[:a] + css + s[b:]

# media query điện thoại: bỏ các dòng cũ của sheet, chỉnh mic
rep("  .player .mic{width:30px;height:30px;flex-basis:30px;margin-left:4px}\n  .recSheet{bottom:calc(env(safe-area-inset-bottom,0px) + 86px)}\n  .recSheet .rb{padding:8px 11px;font-size:13px}\n  .recSheet .rrow:first-child{flex-wrap:nowrap}",
    "  .player .mic{width:32px;height:32px;flex-basis:32px;margin-left:4px}\n  .player .rl-text{font-size:12px}\n  .player .rcancel2{padding:8px 14px;font-size:13px}\n  .recSheet{bottom:calc(env(safe-area-inset-bottom,0px) + 86px);padding:16px 14px 12px}\n  .recSheet .rtxt{font-size:17px}\n  .recSheet .rb{padding:10px 14px;font-size:14px}\n  .recSheet .rl{font-size:14px;padding:8px 6px}")

# ---------- JS: thay module Rec ----------
a = s.index("/* ---------- Ghi âm giọng đọc:")
b = s.index("\n/* ---------- Khởi động ---------- */")
s = s[:a] + open('E:/Your English/tools/rec_module.js', encoding='utf8').read() + s[b:]

# nút play khi đang ghi = dừng ghi
rep('playBtns.forEach(b=>b.addEventListener("click",()=>{\n  tipEvt("play");', 'playBtns.forEach(b=>b.addEventListener("click",()=>{\n  if(typeof Rec!=="undefined"&&Rec.state==="recording"){ Rec.stop(); return; }   /* trong lúc ghi, nút đỏ = dừng */\n  tipEvt("play");')
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('patched')
