(function(){
'use strict';
const KEY='az305.study.cards.v1';
const read=()=>{try{const n=JSON.parse(localStorage.getItem(KEY)||'{}');return n&&typeof n==='object'&&!Array.isArray(n)?n:{}}catch{return {}}};
const write=n=>{try{localStorage.setItem(KEY,JSON.stringify(n));return true}catch{alert('Your browser could not save progress. Free some browser storage and try again.');return false}};
const meta=id=>AZ305_QUESTIONS.find(q=>q.number===Number(id));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function selection(q,n){return q.key||['Single Choice','Multiple Choice'].includes(q.type)?(Array.isArray(n.selected)?n.selected:[]):(Array.isArray(n.responses)?n.responses:[])}
function signature(q,n){const values=selection(q,n);return JSON.stringify(q.type==='Multiple Choice'?[...values].sort():values)}
function submit(id){const q=meta(id);if(!q)return null;const notes=read(),n=notes[id]||{},values=selection(q,n);if(!values.length||values.some(x=>!x)||(q.fieldCount&&values.length!==q.fieldCount))return null;
 const sig=signature(q,n);n.attempts=Array.isArray(n.attempts)?n.attempts:[];const last=n.attempts.at(-1);
 if(last&&last.signature===sig&&n.attemptOpen!==true)return last;
 let result='pending';if(q.key)result=[...values].sort().join(',')===[...q.key].sort().join(',')?'correct':'restudy';
 const a={date:new Date().toISOString(),answer:[...values],signature:sig,result,score:result==='pending'?null:result==='correct'?1:0,grading:q.key?'Proposed answer key':'Awaiting your review'};
 n.attempts.push(a);n.attemptOpen=false;n.status=result==='correct'?'known':result==='restudy'?'review':'studied';notes[id]=n;return write(notes)?a:null;
}
function mark(id,correct){if(!submit(id)){alert('Complete your answer before marking a result.');return false;}const notes=read(),n=notes[id];if(!n||!Array.isArray(n.attempts)||!n.attempts.length){alert('Choose an answer and check it before marking a result.');return false}const a=n.attempts.at(-1);a.result=correct?'correct':'restudy';a.score=correct?1:0;a.grading='Self-reviewed';a.gradedAt=new Date().toISOString();n.status=correct?'known':'review';return write(notes)}
function retry(id){const notes=read(),n=notes[id]||{};n.selected=[];n.responses=[];n.attemptOpen=true;n.status='unseen';notes[id]=n;write(notes)}
function reset(chapter){const ids=AZ305_QUESTIONS.filter(q=>Number(chapter)===8||q.chapter===Number(chapter)).map(q=>q.number);const notes=read();ids.forEach(id=>{const n=notes[id]||{};if(n.correct||n.explanation||n.source)notes[id]={correct:n.correct||'',explanation:n.explanation||'',source:n.source||'',selected:[],responses:[],status:'unseen'};else delete notes[id]});return write(notes)}
function feedback(id){const n=read()[id]||{},a=(n.attempts||[]).at(-1);if(!a||n.attemptOpen||a.signature!==signature(meta(id),n))return '<p class="notice">Choose your answer before recording an attempt.</p>';return '<div class="notice"><b>Attempt saved · '+(a.result==='correct'?'Correct — 1/1':a.result==='restudy'?'Needs restudy — 0/1':'Needs grading')+'</b><p>'+esc(new Date(a.date).toLocaleString())+(a.result==='pending'?' · Compare the explanation, then mark your result below.':' · '+esc(a.grading))+'</p></div>'}
window.AZ305Progress={read,submit,mark,retry,reset,feedback,esc};
})();
