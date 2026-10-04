import re, json
s = open('E:/Your English/index.html', encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

# file -> topic (tên file trong bộ icon không khớp nghĩa: Family.svg là hình người = Friends, Family_1 là ngôi nhà = Family, Tech_1 là cặp = Work, Tech là laptop)
MAP = [("family", "Family", "Family_1"), ("friends", "Friends", "Family"), ("school", "School", "School"),
       ("work", "Work", "Tech_1"), ("lifestyle", "Lifestyle", "Lifestyle"), ("health", "Health", "Health"), ("tech", "Tech", "Tech")]
items = []
for k, label, f in MAP:
    t = open(f'E:/Your English/Icon/SVG/{f}.svg', encoding='utf8').read()
    vb = re.search(r'viewBox="([^"]+)"', t).group(1)
    paths = ''.join(f'<path d="{d}"/>' for d in re.findall(r'<path[^>]*? d="([^"]+)"', t))
    items.append(f'  {{k:{json.dumps(k)},label:{json.dumps(label)},vb:{json.dumps(vb)},icon:{json.dumps(paths)}}}')
block = 'const TOPICS=[\n' + ',\n'.join(items) + '\n];\n'
i = s.index('const TOPICS=['); j = s.index('let passages=[]', i)
s = s[:i] + block + s[j:]

# render icon as filled svg
rep('<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg><span>${t.label}</span>',
    '<svg viewBox="${t.vb}" width="20" height="20" fill="currentColor" aria-hidden="true">${t.icon}</svg><span>${t.label}</span>')

# nav: từ hero -> header
rep('  <nav class="topics" id="topics" aria-label="Topics"></nav>\n  <div class="cue">PICK A TOPIC, THEN SCROLL ↓</div>', '  <div class="cue">SCROLL ↓</div>')
rep('<span class="right">', '<nav class="topics" id="topics" aria-label="Topics"></nav><span class="right">')

# CSS
rep(".topics{display:flex;gap:8px;margin-top:28px;padding:9px;background:var(--leaf);border-radius:999px;width:max-content;max-width:100%;",
    ".top .topics{pointer-events:auto;margin-left:32px;flex:0 1 auto}\n.top .right{margin-left:auto}\n.topics{display:flex;gap:8px;padding:7px;background:var(--leaf);border-radius:999px;width:max-content;max-width:100%;min-width:0;")
rep("padding:10px 16px;border:0;border-radius:999px;background:#fff;", "padding:8px 14px;border:0;border-radius:999px;background:#fff;")
rep("font:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .2s ease", "font:inherit;font-size:13px;font-weight:700;letter-spacing:0;cursor:pointer;white-space:nowrap;transition:background .2s ease")
# mobile: dưới header
rep("@media (max-width:820px){\n  .stage{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;gap:3vh;align-content:start;padding-top:64px}",
    "@media (max-width:820px){\n  .top{flex-wrap:wrap;row-gap:10px;padding:14px 5vw 6px}\n  .top .topics{order:3;width:100%;margin:0}\n  .stage{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;gap:3vh;align-content:start;padding-top:122px}")
open('E:/Your English/index.html', 'w', encoding='utf8').write(s)
print('ok')
