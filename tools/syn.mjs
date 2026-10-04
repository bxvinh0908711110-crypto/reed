import fs from 'fs';
const h=fs.readFileSync('E:/Your English/index.html','utf8');
const m=h.match(/<script type="text\/plain" id="appSrc">([\s\S]*?)<\/script>/);
try{ new Function(m[1]); console.log('syntax ok'); }catch(e){ console.log('ERR',e.message); }
