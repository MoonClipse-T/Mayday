// 대사 뽑기 : 장면 파일에서 인물별 대사 → tools/lines.json (ElevenLabs 목소리 만들기용 · node tools/lines.mjs)
import fs from 'fs';
const F=['web/scenes/s0_meeting.js','web/scenes/flight.js','web/scenes/game.js'];
const who={VG:'vega',I:'chris',me:'chris',RADIO:'radio',LE:'leah',G:'gray',A:'amara',E:'elena',MY:'maya',SJ:'seojun',DN:'daniel'};
const out={}; const add=(k,t)=>{ (out[k]=out[k]||[]); if(!out[k].includes(t)) out[k].push(t); };
const Q="'((?:[^'\\\\]|\\\\.)*)'";
for(const f of F){ const s=fs.readFileSync(f,'utf8');
  for(const m of s.matchAll(new RegExp("(?<![A-Za-z_.$])(VG|I|me|RADIO|LE|G|A|E|MY|SJ|DN)\\("+Q,'g'))) add(who[m[1]],m[2]);
  for(const m of s.matchAll(new RegExp("\\{who:'(레아|하위헌스 1호)',[^}]*?t:"+Q,'g'))) add(m[1]==='레아'?'leah':'radio',m[2]);
  for(const m of s.matchAll(/MUT=\[([^\]]*)\]/g)) for(const t of m[1].matchAll(new RegExp(Q,'g'))) add('leah',t[1]); }
fs.writeFileSync('tools/lines.json',JSON.stringify(out,null,1)); for(const [k,v] of Object.entries(out)) console.log(k,v.length,v.join('').length);
