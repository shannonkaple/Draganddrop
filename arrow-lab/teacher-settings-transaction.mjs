// Apply teacher-only settings without abandoning a student's unsaved maze.
// Verify the separate teacher settings record before changing live settings.
export function commitTeacherSettings({settings,config,next,storage,persist,key='arrow-lab-teacher-settings'}){
 if(!settings||!config?.progression||!next?.costs||!storage||typeof persist!=='function')return false;
 const oldSettings=JSON.parse(JSON.stringify(settings));
 const oldCosts={...config.progression.upgradeCost};
 let oldRaw;
 try{
  oldRaw=storage.getItem(key);
  const candidate={...settings,...next,costs:{...next.costs},touchArrows:false};
  const serialized=JSON.stringify(candidate);
  storage.setItem(key,serialized);
  if(storage.getItem(key)!==serialized)throw Error('Teacher settings were not stored');
  Object.assign(settings,candidate);
  config.progression.upgradeCost={...candidate.costs};
  if(persist()!==true)throw Error('Student progress was not saved');
  return true;
 }catch{
  for(const name of Object.keys(settings))delete settings[name];
  Object.assign(settings,oldSettings);
  config.progression.upgradeCost=oldCosts;
  if(oldRaw!==undefined){
   try{if(oldRaw===null)storage.removeItem(key);else storage.setItem(key,oldRaw)}catch{}
  }
  return false;
 }
}
