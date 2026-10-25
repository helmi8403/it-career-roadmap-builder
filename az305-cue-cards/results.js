(function(){
'use strict';const P=AZ305Progress,e=P.esc,ch=Number(document.body.dataset.chapter),questions=AZ305_QUESTIONS.filter(q=>ch===8||q.chapter===ch);
const date=s=>s?new Date(s).toLocaleString(): '—';const label=r=>({correct:'Correct',restudy:'Needs restudy',pending:'Key unresolved',unattempted:'Not attempted'}[r]||'Key unresolved');const score=a=>a?.score==null?'—':a.score+'/1';
function render(){
 const notes=P.read(),rows=questions.map(q=>{const attempts=Array.isArray(notes[q.number]?.attempts)?notes[q.number].attempts:[];return {q,attempts,last:attempts.at(-1)}}),latest=rows.filter(r=>r.last),graded=latest.filter(r=>r.last.score!=null),correct=graded.filter(r=>r.last.score===1),restudy=graded.filter(r=>r.last.score===0),pct=graded.length?Math.round(correct.length/graded.length*100)+'%':'—';
 document.querySelector('#title').textContent='Chapter '+ch+' · '+AZ305_CHAPTERS[ch];
 document.querySelector('#chapters').innerHTML=Object.keys(AZ305_CHAPTERS).map(n=>'<a '+(Number(n)===ch?'aria-current="page"':'')+' href="chapter-'+n.padStart(2,'0')+'-results.html">Chapter '+n+'</a>').join('');
 document.querySelector('#summary').innerHTML=[['Questions',questions.length],['Correct',correct.length],['Needs restudy',restudy.length],['Key unresolved',latest.length-graded.length],['Not attempted',questions.length-latest.length],['Latest score',pct]].map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('');
 const filter=document.querySelector('#filter').value,visible=rows.filter(r=>filter==='all'||(r.last?.result||'unattempted')===filter);
 document.querySelector('#questions').innerHTML=visible.map(({q,attempts,last})=>'<tr><td><a href="./?chapter='+ch+'&question='+q.number+'">Q'+String(q.number).padStart(3,'0')+'</a></td><td>'+e(q.topic)+'</td><td><span class="badge '+(last?.result||'unattempted')+'">'+label(last?.result||'unattempted')+'</span></td><td>'+e(date(last?.date))+'</td><td>'+attempts.length+'</td><td>'+score(last)+'</td><td><a href="./?chapter='+ch+'&question='+q.number+'&attempt=new">'+(last?'Retry':'Attempt')+'</a></td></tr>').join('')||'<tr><td colspan="7">No questions match this filter.</td></tr>';
 const history=rows.flatMap(({q,attempts})=>attempts.map((a,i)=>({q,a,i}))).sort((x,y)=>new Date(y.a.date)-new Date(x.a.date));
 document.querySelector('#history').innerHTML=history.map(({q,a,i})=>'<tr><td>'+e(date(a.date))+'</td><td>Q'+String(q.number).padStart(3,'0')+'</td><td>'+ (i+1)+'</td><td>'+e((a.answer||[]).join('; '))+'</td><td><span class="badge '+e(a.result)+'">'+label(a.result)+'</span></td><td>'+score(a)+'</td><td>'+e(a.grading)+'</td></tr>').join('')||'<tr><td colspan="7">No attempts yet. Choose an answer on a cue card, then select “Check answer & record attempt”.</td></tr>';
 document.querySelector('#study').href='./?chapter='+ch;
}
document.querySelector('#filter').onchange=render;
document.querySelector('#reset').onclick=()=>{if(!confirm(ch===8?'Reset ALL 346 questions? This clears all answers, scores and attempt history in this browser.':'Reset Chapter '+ch+'? This clears its answers, scores and attempt history. Other chapters will be preserved.'))return;if(P.reset(ch)){document.querySelector('#message').textContent='Progress reset.';render()}};
window.addEventListener('storage',render);render();
})();
