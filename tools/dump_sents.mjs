import fs from 'fs';
const L=fs.readFileSync('index.html','utf8').split('\n');
const a=L.findIndex(l=>l.startsWith('const ALL = '));
const b=L.findIndex(l=>l.startsWith('const PRACTICE'));
const body=L.slice(a,b).join('\n').replace(/^const ALL = .*?:\s*\[/,'[').replace(/\];\s*\/\*.*$/s,']');
const arr=eval(body.trim().replace(/;\s*$/,''));
for(const p of arr){ console.log('#'+p.id+' '+p.topic);
 p.tpl.split(/(?<=[.!?])\s+/).forEach((t,k)=>console.log(' '+k+': '+t.replace(/\{(\d)\}/g,(_,i)=>'['+p.hl[+i].o+'|'+p.hl[+i].u+']'))); }
