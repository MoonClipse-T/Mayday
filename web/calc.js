/* 계산 문제 : 왼쪽 풀이(칸) + 오른쪽 계산기. 칸은 계산기 [칸에 넣기] 로만 채운다 (1장 라운지 · 2장 블링크 비교기)
   calcQuiz({work, order, check}) → Promise
     work  : 풀이 HTML — 칸은 <input class="bx" data-k="…">
     order : 칸을 채우는 순서 (앞 칸을 맞혀야 다음 칸이 열린다)
     check(k, v, tries) → {ok:'글'} 이면 맞음, {no:'글'} 이면 다시 */
'use strict';
const numStr=r=>!isFinite(r)?'오류':String(+r.toPrecision(10));
function calcQuiz({work,order,check}){ return new Promise(res=>{ const q=document.createElement('div'); q.id='quiz'; q.className='calc';
  q.innerHTML=`<div class="work">${work}<p class="note">칸을 누르고, 계산기 값을 <b>칸에 넣기</b></p><p class="msg"></p></div>
    <div class="pad"><p class="ex"></p><p class="dsp">0</p><div class="keys">${['C','⌫','÷','×','7','8','9','−','4','5','6','+','1','2','3','=','0','.'].map(k=>`<button data-k="${k}"${k==='0'?' class="w2"':k==='='?' class="h2"':''}>${k}</button>`).join('')}</div>
      <button class="put">칸에 넣기 ↵</button></div>`;
  document.body.appendChild(q); requestAnimationFrame(()=>q.classList.add('on'));
  const dsp=q.querySelector('.dsp'), ex=q.querySelector('.ex'), msg=q.querySelector('.msg'), bx={};
  order.forEach((k,i)=>{ const b=q.querySelector(`.bx[data-k="${k}"]`); b.readOnly=true; b.disabled=i>0; bx[k]=b; });
  let cur='0', acc=null, op=null, fresh=false, sel=order[0], tries=0;
  const calc=(a,o,b)=>o==='+'?a+b:o==='−'?a-b:o==='×'?a*b:a/b;
  const key=k=>{ AUDIO.tick();
    if(/[0-9.]/.test(k)){ if(fresh){ cur='0'; fresh=false; } if(k==='.'&&cur.includes('.')) return; if(cur.length<15) cur=cur==='0'&&k!=='.'?k:cur+k; }
    else if(k==='C'){ cur='0'; acc=null; op=null; ex.textContent=''; }
    else if(k==='⌫'){ if(!fresh) cur=cur.length>1?cur.slice(0,-1):'0'; }
    else if(k==='='){ if(op===null) return; ex.textContent=numStr(acc)+' '+op+' '+cur+' ='; cur=numStr(calc(acc,op,+cur)); op=null; fresh=true; }
    else { if(op&&!fresh) cur=numStr(calc(acc,op,+cur)); acc=+cur; op=k; fresh=true; ex.textContent=cur+' '+k; }
    dsp.textContent=cur; };
  q.querySelectorAll('.keys button').forEach(b=>b.onclick=()=>key(b.dataset.k));
  const pick=k=>{ sel=k; Object.values(bx).forEach(b=>b.classList.toggle('sel',b===bx[k])); }; pick(sel);
  Object.entries(bx).forEach(([k,b])=>b.onclick=()=>{ if(!b.disabled) pick(k); });
  q.querySelector('.put').onclick=()=>{ const v=+cur, b=bx[sel]; if(b.disabled||!isFinite(v)) return; b.value=cur; tries++;
    const r=check(sel,v,tries);
    if(r.no){ AUDIO.tone(220,.18,'square',.04); q.classList.remove('ok'); msg.textContent=r.no; return; }
    AUDIO.tone(880,.12,'sine',.08); AUDIO.tone(1320,.2,'sine',.07,.1); msg.textContent=r.ok; q.classList.add('ok'); tries=0;
    const nx=order[order.indexOf(sel)+1];
    if(nx){ bx[nx].disabled=false; pick(nx); return; }
    removeEventListener('keydown',kb,true); setTimeout(()=>{ q.remove(); res(); },1800); };
  // PC 키보드도 계산기로 (숫자 · + − * / · Enter · Backspace · Esc)
  const map={'*':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Backspace':'⌫','Escape':'C'};
  const kb=e=>{ const k=/^[0-9.]$/.test(e.key)?e.key:map[e.key]; if(!k) return; e.preventDefault(); e.stopPropagation(); key(k); };
  addEventListener('keydown',kb,true); }); }
