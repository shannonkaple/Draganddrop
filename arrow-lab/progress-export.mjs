// Read-only classroom summary. Never parse and rewrite the original student saves.
// Spreadsheet programs may execute formula-like CSV cells even when quoted.
// Keep exported student data literal; do not modify the original stored value.
const cell=value=>{
 const text=String(value??'');
 const safe=/^[\u0000-\u001f\u007f]|^\s*[=+@-]/u.test(text)?"'"+text:text;
 return '"'+safe.replaceAll('"','""')+'"';
};
const row=values=>values.map(cell).join(',');
export function buildArrowLabProgressCsv(teachers,storage,maxStudents=24){
 const rows=[['Homeroom','Number','Levels','Friends','Rainbow Stars','Equipment','Skill badges','Save status']];
 for(const teacher of teachers){
  for(let number=1;number<=maxStudents;number++){
   let raw;
   try{raw=storage.getItem('arrow-lab-class-v1:'+teacher.id+':'+number)}
   catch{rows.push([teacher.name,number,'','','','','','STORAGE UNAVAILABLE']);continue}
   if(raw===null)continue;
   let profile;
   try{profile=JSON.parse(raw)}
   catch{rows.push([teacher.name,number,'','','','','','UNREADABLE SAVE — DO NOT OVERWRITE']);continue}
   if(!profile||typeof profile!=='object'||Array.isArray(profile)){
    rows.push([teacher.name,number,'','','','','','UNREADABLE SAVE — DO NOT OVERWRITE']);continue;
   }
   const d=profile.adventure;
   if(d===undefined||d===null){
    rows.push([profile.teacherName||teacher.name,number,'','','','','','PRACTICE ONLY — NO ADVENTURE']);continue;
   }
   if(typeof d!=='object'||Array.isArray(d)){
    rows.push([profile.teacherName||teacher.name,number,'','','','','','UNREADABLE ADVENTURE — DO NOT OVERWRITE']);continue;
   }
   const levels=Array.isArray(d.completedLevelIds)?d.completedLevelIds.length:'';
   const friends=d.worldFriends&&typeof d.worldFriends==='object'&&!Array.isArray(d.worldFriends)
    ?Object.values(d.worldFriends).filter(Boolean).length:Object.keys(d.friends&&typeof d.friends==='object'&&!Array.isArray(d.friends)?d.friends:{}).length;
   const stars=Number.isFinite(d.wallet?.rainbowStars)?d.wallet.rainbowStars:'';
   const gear=Array.isArray(d.collectedComputerGearIds)?d.collectedComputerGearIds.join(' / '):'';
   const badges=Array.isArray(d.earnedSkillBadgeIds)?d.earnedSkillBadgeIds.join(' / '):'';
   const healthy=Array.isArray(d.completedLevelIds)&&d.wallet&&Number.isFinite(d.wallet.rainbowStars);
   rows.push([profile.teacherName||teacher.name,number,levels,friends,stars,gear,badges,healthy?'OK':'NEEDS REVIEW — ORIGINAL PRESERVED']);
  }
 }
 return rows.map(row).join('\n');
}
