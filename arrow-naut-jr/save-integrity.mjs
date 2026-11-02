/** Browser persistence guard adapted from Arrow Adventure's verified save/navigation.
 * Keep actual student progress in localStorage, and only the current tab's
 * teacher/number/page in sessionStorage for seamless refresh.
 */
export const TAB_KEY='arrownaut-junior:active-tab-v1';
export const PROGRESS_PREFIX='mskaple-arrownaut-junior-v1:';
export function verifiedWrite(storage,key,value){
 if(!storage||typeof key!=='string'||!key)throw Error('Storage unavailable');
 const bytes=JSON.stringify(value);
 if(typeof bytes!=='string')throw Error('Cannot serialize student work');
 storage.setItem(key,bytes);
 if(storage.getItem(key)!==bytes)throw Error('Save did not verify');
 return true;
}
export function verifiedExisting(storage,key){
 if(!storage||typeof key!=='string'||!key)return false;
 try{
  const raw=storage.getItem(key);
  return typeof raw==='string'&&raw.length>0&&storage.getItem(key)===raw;
 }catch{return false}
}
export function writeTabSession(storage,info){
 if(!storage)return false;
 try{
  verifiedWrite(storage,TAB_KEY,{teacher:info.teacher,number:info.number,view:info.view,world:info.world,stage:info.stage??null});
  return true;
 }catch{return false}
}
export function readTabSession(storage){
 try{
  if(!storage)return null;
  const raw=storage.getItem(TAB_KEY);
  if(raw===null)return null;
  const data=JSON.parse(raw);
  if(!data||typeof data.teacher!=='string'||!/^grade1-\d{2}$/.test(data.teacher)||
   !Number.isInteger(data.number)||data.number<1||data.number>30||
   !['home','world','game','shop','stuff','help'].includes(data.view)||
   !Number.isInteger(data.world)||data.world<0||data.world>=8||
   (data.stage!==null&&data.stage!==undefined&&(!Number.isInteger(data.stage)||data.stage<0||data.stage>=8)))
   return null;
  return data;
 }catch{return null}
}
export function clearTabSession(storage){
 try{storage?.removeItem(TAB_KEY)}catch{}
}
export function canLeaveStudentScreen(storage,key){
 return verifiedExisting(storage,key);
}

/** Test write permissions without touching or resetting any student's record. */
export function storageProbe(storage){
 const key=PROGRESS_PREFIX+'storage-probe:'+Date.now()+':'+Math.random().toString(36).slice(2);
 if(!storage)return false;
 try{
  storage.setItem(key,key);
  const verified=storage.getItem(key)===key;
  storage.removeItem(key);
  return verified;
 }catch{
  try{storage.removeItem(key)}catch{}
  return false;
 }
}
