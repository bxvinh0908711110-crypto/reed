/* ---------- Tìm kiếm thông minh: tag + chỉ mục + xếp hạng (hàm thuần, chạy trên máy, không gọi dịch vụ ngoài) ----------
   Tag của bài: topic = chủ đề con, sit = tình huống, gram = ngữ pháp, vi = từ khoá tiếng Việt, syn = đồng nghĩa/từ liên quan.
   cefr lấy từ level của bài. Bài nào thiếu tag vẫn tìm được bằng tiêu đề, chủ đề và nội dung.
   Dữ liệu bài (ALL, kể cả từ Supabase) không cần cột tag: SEARCH_TAGS ghép theo id; bài/ story có thuộc tính tags thì thuộc tính đó thắng. */
const SEARCH_TAGS={
  1:{topic:["family"],sit:["introduce yourself","talk about my family"],gram:["present simple"],vi:["gia đình","ba mẹ","bố mẹ","anh chị em","giới thiệu bản thân"],syn:["parents","siblings","relatives","home","dinner"]},
  2:{topic:["friends"],sit:["describe a friend","hobbies"],gram:["like + noun"],vi:["bạn thân","bạn bè","sở thích","tình bạn"],syn:["buddy","friendship","games","pets"]},
  3:{topic:["school"],sit:["give directions","places in town"],gram:["prepositions of place"],vi:["trường học","chỉ đường","địa điểm","ở đâu"],syn:["where","map","near","street"]},
  4:{topic:["work"],sit:["talk about my job"],gram:["present simple","love + ing"],vi:["công việc","nghề nghiệp","đi làm","văn phòng"],syn:["career","office","job interview","colleagues"]},
  5:{topic:["lifestyle"],sit:["weekend plans","daily routine"],gram:["present simple","time words"],vi:["cuối tuần","thói quen","kế hoạch","thư giãn"],syn:["saturday","sunday","free day","relax"]},
  6:{topic:["lifestyle"],sit:["free time","hobbies"],gram:["like + ing"],vi:["sở thích","thời gian rảnh","giải trí"],syn:["interests","leisure","fun","activities"]},
  7:{topic:["school"],sit:["daily routine","getting to school"],gram:["present simple"],vi:["đi học","buổi sáng","phương tiện","học sinh"],syn:["bus","walk","commute","students"]},
  8:{topic:["health"],sit:["morning routine","daily routine","healthy habits"],gram:["imperatives"],vi:["sức khoẻ","buổi sáng","tập thể dục","thói quen tốt"],syn:["exercise","breakfast","sleep","fitness"]},
  9:{topic:["tech"],sit:["using phones","using the internet"],gram:["present simple"],vi:["công nghệ","điện thoại","máy tính","mạng"],syn:["smartphone","laptop","online","apps","computer"]},
  "story-ussr":{topic:["stories"],sit:["history","world events"],gram:[],vi:["liên xô","lịch sử","chiến tranh lạnh","hoạt hình","truyện"],syn:["ussr","soviet union","cold war","russia","history story"]}
};
/* từ khoá thêm cho từng chủ đề (tiếng Việt + từ liên quan) */
const SEARCH_TOPIC_ALIAS={
  family:["gia đình","ba mẹ","anh chị em","parents","home"],
  friends:["bạn bè","bạn thân","tình bạn","buddy"],
  school:["trường học","đi học","học sinh","student","class"],
  work:["công việc","nghề nghiệp","đi làm","job","career","office"],
  lifestyle:["lối sống","cuộc sống","sở thích","cuối tuần","hobbies","routine"],
  health:["sức khoẻ","tập thể dục","ăn uống","healthy","exercise"],
  tech:["công nghệ","điện thoại","máy tính","technology","phone","internet"],
  stories:["truyện","câu chuyện","lịch sử","hoạt hình","animation","history"]
};
const Search=(function(){
  const norm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]+/g," ").trim();
  const toks=s=>{ const n=norm(s); return n?n.split(" "):[]; };
  const uniq=a=>Array.from(new Set(a));
  const limOf=len=>len<4?0:len<=7?1:2;
  /* khoảng cách Damerau–Levenshtein (có hoán vị hai ký tự kề nhau), dừng sớm khi vượt max */
  function dist(a,b,max){
    const n=a.length,m=b.length; if(Math.abs(n-m)>max) return max+1;
    let p2=null,p1=[],c;
    for(let j=0;j<=m;j++) p1[j]=j;
    for(let i=1;i<=n;i++){
      c=[i]; let rowMin=i;
      for(let j=1;j<=m;j++){
        let v=Math.min(p1[j]+1,c[j-1]+1,p1[j-1]+(a[i-1]===b[j-1]?0:1));
        if(p2&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) v=Math.min(v,p2[j-2]+1);
        c[j]=v; if(v<rowMin) rowMin=v;
      }
      if(rowMin>max) return max+1;
      p2=p1; p1=c;
    }
    return p1[m];
  }
  /* mức khớp của một từ gõ vào (q) với một từ trong chỉ mục (t): 1 = đúng hệt … 0 = không khớp */
  function tokScore(q,t,last){
    if(t===q) return 1;
    if(t.startsWith(q)) return q.length>=2?0.85:(last?0.5:0);
    if(q.length>=3&&t.includes(q)) return 0.5;
    const m=limOf(q.length);
    if(m){
      let d=dist(q,t,m); if(d<=m) return 0.6-0.1*(d-1);
      if(last&&t.length>q.length){ d=dist(q,t.slice(0,q.length),m); if(d<=m) return 0.45; }   /* gõ dở và sai chính tả: "fmail" → family */
    }
    return 0;
  }
  const cleanTpl=s=>String(s||"").replace(/\{\d+\}/g," ");
  function field(w,arr){ const t=uniq(toks(arr.join(" "))); return t.length?[w,t,arr.map(norm).filter(Boolean)]:null; }
  /* tags của một mục: thuộc tính tags của chính nó, nếu không có thì bảng SEARCH_TAGS theo id */
  const tagsOf=(x,map)=>x.tags||map[x.id]||{};
  /* data: {lessons, stories, topics:[{k,label}], tags (tuỳ chọn, mặc định SEARCH_TAGS), topicAlias (tuỳ chọn)} */
  function buildIndex(data){
    const map=data.tags||SEARCH_TAGS, alias=data.topicAlias||SEARCH_TOPIC_ALIAS;
    const topicLabel={}; (data.topics||[]).forEach(t=>{ topicLabel[t.k]=t.label; });
    const entries=[], tagMap=new Map();
    const addTag=(kind,label,id)=>{
      const key=kind+":"+norm(label); let t=tagMap.get(key);
      if(!t){ t={type:"tag",kind,label,key,ids:[],f:[field(10,[label])].filter(Boolean)}; tagMap.set(key,t); }
      if(t.ids.indexOf(id)<0) t.ids.push(id);
    };
    (data.topics||[]).forEach(t=>{
      const own=(data.lessons||[]).filter(p=>p.cat===t.k).map(p=>p.topic);
      const f=[field(10,[t.label]),field(6,alias[t.k]||[]),field(2,own)].filter(Boolean);
      entries.push({type:"topic",k:t.k,title:t.label,f,count:own.length});
    });
    const addItem=(x,type,k,level)=>{
      const tg=tagsOf(x,map), f=[];
      const push=v=>{ if(v) f.push(v); };
      push(field(10,[x.title||x.topic]));
      push(field(6,[topicLabel[k]||k].concat(tg.topic||[],tg.vi||[])));
      push(field(4,[level||""].concat(tg.sit||[],tg.gram||[],tg.syn||[])));
      if(x.hl) push(field(1,[cleanTpl(x.tpl)].concat(x.hl.map(h=>[h.o,h.u,h.ex,h.vn].join(" ")))));
      entries.push({type,id:x.id,k,title:x.title||x.topic,level,f,story:type==="story"});
      (tg.sit||[]).forEach(l=>addTag("sit",l,x.id)); (tg.gram||[]).forEach(l=>addTag("gram",l,x.id));
    };
    (data.lessons||[]).filter(p=>p.id>0).forEach(p=>addItem(p,"lesson",p.cat,p.level));
    (data.stories||[]).forEach(s=>addItem(s,"story","stories",s.level));
    tagMap.forEach(t=>entries.push(t));
    return {entries,tags:Array.from(tagMap.values()),norm};
  }
  function scoreEntry(e,qt,qn){
    let total=0;
    for(let i=0;i<qt.length;i++){
      const q=qt[i], last=i===qt.length-1; let best=0;
      for(const [w,ts] of e.f){
        for(let j=0;j<ts.length;j++){ const v=w*tokScore(q,ts[j],last); if(v>best) best=v; }
      }
      if(!best) return 0;
      total+=best;
    }
    if(qt.length>1){   /* cụm đúng thứ tự trong cùng một tag/tiêu đề ("cong nghe" = công nghệ) hơn là hai từ rời rạc */
      let pb=0; for(const f of e.f){ if(f[2]&&f[2].some(p=>(" "+p+" ").includes(" "+qn+" "))) pb=Math.max(pb,f[0]*0.8*qt.length); }
      total+=pb;
    }
    const tn=norm(e.title||e.label||"");
    if(tn===qn) total+=8; else if(tn.startsWith(qn)) total+=5;
    return total;
  }
  /* opt: {read: Set id đã đọc (bài chưa đọc lên trước khi hoà điểm), max:{topics,lessons,tags}} */
  function search(idx,q,opt){
    opt=opt||{}; const mx=Object.assign({topics:3,lessons:5,tags:4},opt.max||{});
    const qn=norm(q), qt=qn?qn.split(" "):[];
    const out={topics:[],lessons:[],tags:[],query:qn};
    if(!qt.length) return out;
    const hits=[];
    for(const e of idx.entries){ const s=scoreEntry(e,qt,qn); if(s>0) hits.push({e,s:s+(e.id!=null&&opt.read&&!opt.read.has(e.id)?0.4:0)}); }
    hits.sort((a,b)=>b.s-a.s||String(a.e.title||a.e.label).localeCompare(String(b.e.title||b.e.label)));
    for(const h of hits){
      const e=h.e, o=Object.assign({score:h.s},e); delete o.f;
      if(e.type==="topic"&&out.topics.length<mx.topics) out.topics.push(o);
      else if((e.type==="lesson"||e.type==="story")&&out.lessons.length<mx.lessons) out.lessons.push(o);
      else if(e.type==="tag"&&out.tags.length<mx.tags) out.tags.push(o);
    }
    return out;
  }
  /* các tag tình huống phổ biến nhất (chip "Try" trong lớp phủ) */
  function popularTags(idx,n,kind){
    return idx.tags.filter(t=>!kind||t.kind===kind).sort((a,b)=>b.ids.length-a.ids.length||a.label.localeCompare(b.label)).slice(0,n||8);
  }
  /* các mục khớp một tag (danh sách lọc theo tag) */
  function byTag(idx,key){ const t=idx.tags.find(x=>x.key===key); return t?t.ids.slice():[]; }
  return {norm,buildIndex,search,popularTags,byTag,dist};
})();
