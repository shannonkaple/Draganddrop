// Persist first-play character selection and later character changes atomically.
// Roll back only the fields this action touches; never reset a student's mazes,
// stars, purchases, rescued friends, or arranged MY STUFF scene on a failed save.
export function commitCharacterSelection({progress,id,changing=false,starterWorldId,choose,persist}) {
  if(!progress||typeof id!=='string'||!id||typeof starterWorldId!=='string'||!starterWorldId||typeof choose!=='function'||typeof persist!=='function')return false;
  const fields=['selectedPlayerCharacterId','friends','unlockedCharacterIds','retiredPlayerCharacterIds','ownedWorldIds','primaryRainbowLandId'];
  const snapshot=fields.map(field=>({field,existed:Object.prototype.hasOwnProperty.call(progress,field),value:progress[field]===undefined?undefined:JSON.parse(JSON.stringify(progress[field]))}));
  const rollback=()=>{for(const {field,existed,value} of snapshot){if(existed)progress[field]=value;else delete progress[field]}};
  try {
    const previous=progress.selectedPlayerCharacterId;
    const previousHome=progress.friends?.[previous]?.homeLandId;
    if(changing&&previous&&previous!==id)progress.retiredPlayerCharacterIds=[...new Set([...(progress.retiredPlayerCharacterIds||[]),previous])];
    if(!choose(progress,id,starterWorldId))throw Error('Character selection refused');
    if(changing&&previousHome&&progress.ownedWorldIds?.includes(previousHome))progress.friends[id].homeLandId=previousHome;
    if(!changing){
      progress.ownedWorldIds??=[];
      if(!progress.ownedWorldIds.includes(starterWorldId))progress.ownedWorldIds.push(starterWorldId);
      if(!progress.primaryRainbowLandId||!progress.ownedWorldIds.includes(progress.primaryRainbowLandId))progress.primaryRainbowLandId=starterWorldId;
      progress.friends[id]??={isRescued:true,upgradeStage:'starter',homeLandId:starterWorldId};
    }
    if(persist()!==true)throw Error('Student character choice not saved');
    return true;
  } catch {
    rollback();
    return false;
  }
}
