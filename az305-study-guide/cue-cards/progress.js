(function(){
'use strict';
const KEY='az305.study.cards.v1';
const read=()=>{try{const n=JSON.parse(localStorage.getItem(KEY)||'{}');return n&&typeof n==='object'&&!Array.isArray(n)?n:{}}catch{return {}}};
const write=n=>{try{localStorage.setItem(KEY,JSON.stringify(n));return true}catch{alert('Your browser could not save progress. Free some browser storage and try again.');return false}};
const meta=id=>AZ305_QUESTIONS.find(q=>q.number===Number(id));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').trim().replace(/\s+/g,' ').toLowerCase();
function selection(q,n){return ['Single Choice','Multiple Choice'].includes(q.type)?(Array.isArray(n.selected)?n.selected:[]):(Array.isArray(n.responses)?n.responses:[])}
function signature(q,n){const values=selection(q,n);return JSON.stringify(q.type==='Multiple Choice'||q.unorderedFields?[...values].sort():values)}
function grade(q,values){
 const key=q.fieldCount?q.fieldKeys:q.key;
 if(!Array.isArray(key)||!key.length)return {result:'pending',score:null,grading:'Answer key unresolved'};
 let expected=key.map(normalize),actual=values.map(normalize);
 if(q.type==='Multiple Choice'||q.unorderedFields){expected.sort();actual.sort()}
 const correct=actual.length===expected.length&&actual.every((v,i)=>v===expected[i]);
 return {result:correct?'correct':'restudy',score:correct?1:0,grading:'Automatically marked against proposed answer key'};
}
function status(a){return a.result==='correct'?'known':a.result==='restudy'?'review':'studied'}
function complete(q,v){return v.length>0&&Array.from(v).every(x=>!!x)&&(!q.fieldCount||v.length===q.fieldCount)}
function submit(id){
 const q=meta(id);if(!q)return null;const notes=read(),n=notes[id]||{},values=selection(q,n);if(!complete(q,values))return null;
 const sig=signature(q,n);n.attempts=Array.isArray(n.attempts)?n.attempts:[];const last=n.attempts.at(-1);
 if(last&&last.signature===sig&&n.attemptOpen!==true)return last;
 const a={date:new Date().toISOString(),answer:[...values],signature:sig,...grade(q,values)};
 n.attempts.push(a);n.attemptOpen=false;n.status=status(a);notes[id]=n;return write(notes)?a:null;
}
// Regrade saved attempts in place, retaining attempt dates and counts.
function regrade(){
 const notes=read();let changed=false;
 for(const q of AZ305_QUESTIONS){const n=notes[q.number];if(!n||!Array.isArray(n.attempts))continue;
  for(const a of n.attempts){if(!Array.isArray(a.answer)||!complete(q,a.answer))continue;if(q.unorderedFields){const sig=JSON.stringify([...a.answer].sort());if(a.signature!==sig){a.signature=sig;changed=true}}const g=grade(q,a.answer);if(g.score===null)continue;
   if(a.result!==g.result||a.score!==g.score||a.grading!==g.grading){Object.assign(a,g);a.gradedAt=new Date().toISOString();changed=true;}
  }
  const latest=n.attempts.at(-1);if(latest&&!n.attemptOpen&&latest.signature===signature(q,n)&&latest.score!==null&&n.status!==status(latest)){n.status=status(latest);changed=true}
 }
 if(changed)write(notes);
}
function retry(id){const notes=read(),n=notes[id]||{};n.selected=[];n.responses=[];n.attemptOpen=true;n.status='unseen';notes[id]=n;write(notes)}
function reset(chapter){const ids=AZ305_QUESTIONS.filter(q=>Number(chapter)===8||q.chapter===Number(chapter)).map(q=>q.number);const notes=read();ids.forEach(id=>{const n=notes[id]||{};if(n.correct||n.explanation||n.source)notes[id]={correct:n.correct||'',explanation:n.explanation||'',source:n.source||'',selected:[],responses:[],status:'unseen'};else delete notes[id]});return write(notes)}
function feedback(id){const n=read()[id]||{},a=(n.attempts||[]).at(-1);if(!a||n.attemptOpen||a.signature!==signature(meta(id),n))return '<p class="notice">Complete all answer fields before recording an attempt.</p>';return '<div class="notice"><b>Attempt saved · '+(a.result==='correct'?'Correct — 1/1':a.result==='restudy'?'Needs restudy — 0/1':'Answer key unresolved — not scored')+'</b><p>'+esc(new Date(a.date).toLocaleString())+(a.result==='pending'?' · The source answer is incomplete or unresolved, so no score is assigned.':' · '+esc(a.grading))+'</p></div>'}
window.AZ305Progress={read,submit,regrade,retry,reset,feedback,grade,esc};
regrade();
})();
