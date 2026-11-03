// 한 번에 만든 여러 줄 목소리를 줄마다 자르기 → web/audio/voice/<이름>_<번호>.mp3
//   쉼 후보(0.25 s 넘는 조용한 곳) 가운데 N-1 곳을 고른다 : 줄 글자 수로 예상한 길이와 맞고(동적 계획법) · 쉼이 길수록 좋다
// node tools/split_audio.mjs <원본.mp3> <이름> <첫 번호> <줄 글자 수들(쉼표)>
import {execFileSync,spawnSync} from 'child_process'; import fs from 'fs';
const [src,name,first,lens]=process.argv.slice(2), F=+first, L=lens.split(',').map(Number), N=L.length;
const text=spawnSync('ffmpeg',['-hide_banner','-i',src,'-af','silencedetect=noise=-36dB:d=0.25','-f','null','-'],{encoding:'utf8'}).stderr;
const dur=+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',src],{encoding:'utf8'}).trim();
const sil=[]; let st=null; for(const l of text.split(/\r?\n/)){ const a=l.match(/silence_start: ([\d.]+)/), b=l.match(/silence_end: ([\d.]+)/); if(a) st=+a[1]; if(b&&st!==null){ sil.push([st,+b[1]]); st=null; } }
const C=sil.filter(([a,b])=>a>.15&&b<dur-.15).map(([a,b])=>({t:(a+b)/2,len:b-a}));
const speech=dur-C.reduce((s,c)=>s+c.len,0)*.5, rate=speech/L.reduce((a,b)=>a+b,0);
// dp[i][j] : i 번째 줄 끝을 j 번째 후보에서 자를 때 최소 비용
const exp=i=>Math.max(.6,L[i]*rate), cost=(d,i)=>Math.pow(d-exp(i),2)/exp(i);
const K=C.length, INF=1e18, dp=Array.from({length:N},()=>Array(K).fill(INF)), from=Array.from({length:N},()=>Array(K).fill(-1));
for(let j=0;j<K;j++) dp[0][j]=cost(C[j].t,0)-C[j].len*2;
for(let i=1;i<N-1;i++) for(let j=0;j<K;j++) for(let p=0;p<j;p++){ const v=dp[i-1][p]+cost(C[j].t-C[p].t,i)-C[j].len*2; if(v<dp[i][j]){ dp[i][j]=v; from[i][j]=p; } }
let best=INF, bj=-1; for(let j=0;j<K;j++){ const v=dp[N-2][j]+cost(dur-C[j].t,N-1); if(v<best){ best=v; bj=j; } }
if(bj<0){ console.log('쉼이 모자람',K,N-1); process.exit(1); }
const pick=[]; for(let i=N-2,j=bj;i>=0;i--){ pick.unshift(C[j].t); j=from[i][j]; }
const cuts=[0,...pick,dur]; fs.mkdirSync('web/audio/voice',{recursive:true});
for(let i=0;i<N;i++){ const a=cuts[i], b=cuts[i+1], o=`web/audio/voice/${name}_${F+i}.mp3`;
  execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',src,'-ss',a.toFixed(3),'-to',b.toFixed(3),'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse','-ac','1','-b:a','64k',o]);
  console.log(o,(b-a).toFixed(1)+'s / 예상 '+exp(i).toFixed(1)+'s'); }
