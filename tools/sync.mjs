// Đồng bộ file app từ gốc repo sang deploy/ và netlify-upload/ (index.html + file PWA). Chạy: node tools/sync.mjs
// Không đụng img/ và audio/ (quy trình riêng) hay deploy/export. netlify-upload/ bị gitignore nên chỉ có trên máy bạn.
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FILES=['index.html','manifest.webmanifest','sw.js','_headers','reed-icon.svg'], DIRS=['icons','fonts'];
let n=0;
for(const t of ['deploy','netlify-upload']){
  const dest=path.join(ROOT,t); fs.mkdirSync(dest,{recursive:true});
  const put=(rel)=>{ const from=path.join(ROOT,rel), to=path.join(dest,rel); fs.mkdirSync(path.dirname(to),{recursive:true}); const a=fs.readFileSync(from); if(!fs.existsSync(to)||!a.equals(fs.readFileSync(to))){ fs.writeFileSync(to,a); n++; console.log('  cập nhật',t+'/'+rel); } };
  FILES.forEach(f=>fs.existsSync(path.join(ROOT,f))&&put(f));
  DIRS.forEach(d=>fs.existsSync(path.join(ROOT,d))&&fs.readdirSync(path.join(ROOT,d)).forEach(f=>put(path.join(d,f))));
}
console.log(n?`Đã đồng bộ ${n} file.`:'Đã đồng bộ sẵn, không có gì thay đổi.');
