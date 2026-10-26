export const legacyKeys=['az305.study.cards.v1','az305_litware_notes_v1','az305_litware_done_v1','az305_litware_selections_v1'];
export const chapterKey='lms.az-305.chapters.v1';
export const allKeys=[...legacyKeys,chapterKey];
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function validateBackup(value){
  if(!plain(value)||value.schemaVersion!==1||value.courseId!=='az-305'||!plain(value.data))throw Error('This is not an AZ-305 progress backup.');
  const data={};
  for(const [key,item] of Object.entries(value.data)){
    if(!allKeys.includes(key)||!plain(item))throw Error('Unrecognized progress data.');
    const raw=JSON.stringify(item);
    if(raw.length>2000000||/"(?:__proto__|constructor|prototype)"\s*:/.test(raw))throw Error('Invalid progress data.');
    data[key]=JSON.parse(raw);
  }
  return data;
}
export function exportBackup(storage){
  const data={};
  for(const key of allKeys){const raw=storage.getItem(key);if(raw!==null)data[key]=JSON.parse(raw);}
  const backup={schemaVersion:1,courseId:'az-305',exportedAt:new Date().toISOString(),data};validateBackup(backup);return backup;
}
// Retain existing records on collision, including entire answer histories. Reimport is idempotent.
export function importBackup(storage,backup){
  const incoming=validateBackup(backup),writes=[];
  for(const [key,records] of Object.entries(incoming)){
    const old=storage.getItem(key),current=old===null?{}:JSON.parse(old);
    if(!plain(current))throw Error('Existing progress is malformed. Export a backup before repairing it.');
    writes.push([key,JSON.stringify({...records,...current}),old]);
  }
  try{for(const [key,value] of writes)storage.setItem(key,value);}
  catch(error){for(const [key,,old] of writes){try{if(old===null)storage.removeItem(key);else storage.setItem(key,old);}catch{}}throw error;}
  return writes.length;
}
