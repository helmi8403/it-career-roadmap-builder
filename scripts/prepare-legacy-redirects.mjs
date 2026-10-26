// Prepare reviewable redirect files only. Does not modify the existing study pages.
import {readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const origin=new URL(process.argv[2]);
if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'||origin.hostname==='it-career-builder.web.app'||origin.hostname==='it-career-builder.firebaseapp.com')throw Error('Provide the verified isolated platform HTTPS origin only.');
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(p.endsWith('.html'))out.push(p);}return out;}
let count=0;
for(const directory of ['az305-study-guide','az305-cue-cards','az305-litware-cue-cards']){
  for(const source of await files(resolve(root,directory))){
    const oldPath=relative(root,source).replaceAll('\\','/');
    let route=oldPath.replace(/^az305-study-guide/,'courses/az-305/study-guide');
    if(directory==='az305-cue-cards')route='courses/az-305/study-guide/cue-cards/'+relative(resolve(root,directory),source).replaceAll('\\','/');
    if(directory==='az305-litware-cue-cards')route='courses/az-305/study-guide/case-studies/case-study-1/index.html';
    const destination=new URL('/'+route,origin).href;
    const escaped=destination.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
    const output=resolve(root,'handoff-preview',oldPath);await mkdir(dirname(output),{recursive:true});
    await writeFile(output,`<!doctype html><html lang="en"><meta charset="utf-8"><title>AZ-305 has moved</title><p>Before continuing, <a href="/it-career-roadmap-builder/az305-progress-transfer/">export your saved progress on this old site</a>. Import it using My learning on the new platform.</p><p><a id="continue" href="${escaped}">Continue to the independent AZ-305 course</a></p><script>document.getElementById('continue').href=${JSON.stringify(destination)}+location.search+location.hash;</script></html>`);
    count++;
  }
}
console.log(`Prepared ${count} fixed-destination handoff pages in handoff-preview/. Review before manually replacing ONLY corresponding AZ-305 HTML pages. No existing files or production changed.`);
