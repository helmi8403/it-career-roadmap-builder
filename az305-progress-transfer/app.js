import {exportBackup} from './progress-core.js';
import {platformOrigin} from './config.js';
import {continuation} from './continuation.js';
const status=document.getElementById('status');
document.getElementById('export').onclick=()=>{
  try{
    const data=exportBackup(localStorage);
    if(!Object.keys(data.data).length){status.textContent='No saved AZ-305 progress found on this origin. Use the browser and address where you studied.';return;}
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='az-305-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='Export complete. Import the file under My learning on the independent platform. Your old progress is unchanged.';
  }catch{status.textContent='Export failed. Browser storage may be blocked or malformed. Your saved data was not changed.';}
};
try{
  const response=await fetch('./legacy-routes.json');if(!response.ok)throw Error();
  const target=continuation(platformOrigin,new URLSearchParams(location.search),Object.values(await response.json()));
  if(target){const link=document.getElementById('continue');link.href=target;link.hidden=false;document.getElementById('destination').textContent='Export your progress before continuing to the independent platform.';}
}catch{document.getElementById('destination').textContent='The course link is unavailable. You can still export your progress.';}
