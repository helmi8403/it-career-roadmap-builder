import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {exportBackup,legacyKeys} from '../az305-progress-transfer/progress-core.js';
import {continuation} from '../az305-progress-transfer/continuation.js';
const routes=JSON.parse(await readFile('az305-progress-transfer/legacy-routes.json','utf8'));
test('Career Builder core files unchanged from main',async()=>{
  for(const path of ['index.html','career-map.html','v2.js']){
    const original=execFileSync('git',['show','bc7eab67e1fed39816ea10d7593225141b2ad3c1:'+path],{encoding:'utf8'});
    assert.equal((await readFile(path,'utf8')).replaceAll('\r\n','\n'),original.replaceAll('\r\n','\n'));
  }
});
test('exporter reads only four legacy progress stores and never writes',()=>{
  const reads=[],backup=exportBackup({getItem:key=>{reads.push(key);return JSON.stringify({'1':{notes:'keep me',attempts:[{answer:['A']}]}});}});
  assert.deepEqual(reads,legacyKeys);assert.equal(Object.keys(backup.data).length,4);assert.equal(backup.schemaVersion,1);
  assert.equal(Object.hasOwn(backup.data,'lms.az-305.chapters.v1'),false);
});
test('malformed storage fails without destroying data',()=>assert.throws(()=>exportBackup({getItem:()=>'{bad'})));
test('all 33 old pages are small handoff stubs with valid local links',async()=>{
  assert.equal(Object.keys(routes).length,33);
  for(const [path,target] of Object.entries(routes)){
    const html=await readFile(path,'utf8');assert.ok(Buffer.byteLength(html)<1200);assert.match(html,/AZ-305 has moved/);
    assert.doesNotMatch(html,/AZ305_QUESTIONS|const QUESTIONS|question_text|firebasejs|localStorage/);
    assert.ok(target.startsWith('/courses/az-305/study-guide/'));
    const href=/href="([^"]+)"/.exec(html)[1].split('?')[0];await stat(resolve(dirname(path),href));
  }
});
test('no LMS assets, Firebase app or deployment config remain on this branch',async()=>{
  for(const path of ['az305-study-guide/readability.css','az305-study-guide/cue-cards/progress.js','az305-study-guide/cue-cards/progress-data.js','az305-study-guide/cue-cards/results.css','az305-study-guide/cue-cards/results.js','az305-study-guide/cue-cards/transcription-audit.json','firebase-public','.firebaserc','firebase.json','firestore.rules','functions','scripts/prepare-legacy-redirects.mjs','handoff-preview'])await assert.rejects(stat(path),{code:'ENOENT'});
});
test('continuation preserves query/hash only on allowlisted fixed platform routes',()=>{
  const params=new URLSearchParams({route:routes['az305-cue-cards/index.html'],query:'?chapter=2',fragment:'#bookmark'});
  assert.equal(continuation('https://study.example',params,Object.values(routes)),'https://study.example/courses/az-305/study-guide/cue-cards/index.html?chapter=2#bookmark');
  assert.equal(continuation(null,params,Object.values(routes)),null);
  assert.throws(()=>continuation('https://study.example',new URLSearchParams({route:'https://evil.example'}),Object.values(routes)));
  for(const origin of ['http://study.example','https://it-career-builder.web.app','https://user:password@study.example','https://study.example/path'])assert.throws(()=>continuation(origin,params,Object.values(routes)));
});
