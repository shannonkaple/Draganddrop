// Probe storage without writing a student record or changing an existing wallet.
// A successful probe is not a substitute for checking every actual save.
export function canSaveStudentProgress(storageProvider=()=>globalThis.localStorage){
 const probeKey='arrow-lab-storage-probe:'+Date.now()+':'+Math.random().toString(36).slice(2);
 let storage;
 try{
  storage=storageProvider();
  storage.setItem(probeKey,probeKey);
  const persisted=storage.getItem(probeKey)===probeKey;
  storage.removeItem(probeKey);
  return persisted;
 }catch{
  try{storage?.removeItem(probeKey)}catch{}
  return false;
 }
}
