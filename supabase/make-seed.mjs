// Chuyển mảng `passages` trong index.html thành supabase/seed.sql.   Chạy: node supabase/make-seed.mjs
import fs from 'fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/const ALL = [^\n]*: (\[[\s\S]*?\n\]);/);
const passages = new Function('return ' + m[1])();
const q = s => "'" + String(s ?? '').replace(/'/g, "''") + "'";
const FROM = +((process.argv.find(a => a.startsWith('--from=')) || '--from=1').split('=')[1]);
const INC = FROM > 1;
let sql = '-- Sinh tự động từ index.html bằng make-seed.mjs. Chạy SAU 0001_init.sql và 0002_category.sql.\n' + (INC ? '-- Chế độ thêm (--from=' + FROM + '): chỉ THÊM bài từ vị trí này, không xoá gì.\n' : '-- CẢNH BÁO: xoá toàn bộ bài hiện có rồi nạp lại từ app (giai đoạn demo, chưa có dữ liệu thật).\n') + 'begin;\n' + (INC ? '' : 'delete from public.lessons;\n');
passages.forEach((p, i) => {
  if (i + 1 < FROM) return;
  sql += `with l as (insert into public.lessons (position,title,level,scene_key,category,template,status) values (${i + 1},${q(p.topic)},${q(p.level)},${q(p.scene)},${q(p.cat)},${q(p.tpl)},'published') returning id)\n`;
  sql += 'insert into public.phrases (lesson_id,idx,base,upgrade,level,vn,example) values\n';
  sql += p.hl.map((h, k) => `((select id from l),${k},${q(h.o)},${q(h.u)},${q(h.lv)},${q(h.vn)},${q(h.ex)})`).join(',\n') + ';\n';
});
sql += 'commit;\n';
const OUT = INC ? `./seed_from_${FROM}.sql` : './seed.sql';
fs.writeFileSync(new URL(OUT, import.meta.url), sql);
console.log(OUT + ':', passages.length - FROM + 1, 'bài');
