export const legacyKeys=['az305.study.cards.v1','az305_litware_notes_v1','az305_litware_done_v1','az305_litware_selections_v1'];
// One-way migration adapter only. No LMS import, grading, account or chapter code.
export function exportBackup(storage){
  const data={};
  for(const key of legacyKeys){
    const raw=storage.getItem(key);if(raw===null)continue;
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Saved progress is malformed.');
    data[key]=value;
  }
  return {schemaVersion:1,courseId:'az-305',exportedAt:new Date().toISOString(),data};
}
