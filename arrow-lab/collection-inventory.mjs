// MY STUFF: safe, saved placement of earned items.
// Approved collectible art is PNG or JPEG. SVGs and synthetic SVG shapes
// must not appear as newly generated maze pickups.
// IMPORTANT: format policy never deletes a student's previously earned items.
export const isSupportedCollectibleArt=path=>typeof path==='string'&&/\.(?:png|jpe?g)(?:[?#].*)?$/i.test(path);
export const earnedKeys=state=>[...new Set([
 ...(state.collectedWorldItems||[]),
 ...(state.collectedComputerGearIds||[]),
 ...(state.earnedSkillBadgeIds||[])
].filter(id=>typeof id==='string'&&id.length))];

export function visibleCollectedKeys(state,worldId){
 const earned=new Set(earnedKeys(state));
 return [...new Set(state.collectionExtraObjects?.[worldId]||[])].filter(id=>earned.has(id));
}

export function toggleCollectedInWorld(state,worldId,key){
 if(!earnedKeys(state).includes(key)||typeof worldId!=='string'||!worldId)return {changed:false,added:false};
 state.collectionExtraObjects??={};
 const existing=state.collectionExtraObjects[worldId]??=[];
 if(existing.includes(key)){
   state.collectionExtraObjects[worldId]=existing.filter(id=>id!==key);
   return {changed:true,added:false};
 }
 const next=[...existing,key];
 state.collectionExtraObjects[worldId]=next;
 // Put new additions in a visible part of the screen, not behind world edges.
 // Existing manually arranged coordinates remain exactly as students saved them.
 state.positions??={};
 state.positions[worldId]??={};
 const positionKey='treasure:'+key;
 if(!state.positions[worldId][positionKey]){
   const index=(next.length-1)%9;
   state.positions[worldId][positionKey]={x:35+(index%3)*15,y:37+Math.floor(index/3)*16};
 }
 return {changed:true,added:true,position:state.positions[worldId][positionKey]};
}


// World-exclusive shop art may stay in legacy saves from earlier builds.
// Never delete those purchases, but prevent NEW cross-world placements.
export function canPlaceDecorationInWorld(item,targetTheme){
 return !!item && (item.world==='all'||item.world===targetTheme);
}
export function moveOwnedDecoration(state,key,targetId,item,targetTheme){
 if(!canPlaceDecorationInWorld(item,targetTheme)||!state?.ownedWorldIds?.includes(targetId))return false;
 const source=Object.keys(state.decorations||{}).find(id=>id!==targetId&&Array.isArray(state.decorations[id])&&state.decorations[id].includes(key));
 if(!source||(state.decorations[targetId]||[]).includes(key))return false;
 state.decorations[source]=state.decorations[source].filter(id=>id!==key);
 state.decorations[targetId]??=[];
 state.decorations[targetId].push(key);
 // Keep old scene coordinates so moving an item back restores its arrangement.
 // Neither stars nor any other student's save is touched.
 if(state.hiddenDecorations?.[source])state.hiddenDecorations[source]=state.hiddenDecorations[source].filter(id=>id!==key);
 if(state.hiddenDecorations?.[targetId])state.hiddenDecorations[targetId]=state.hiddenDecorations[targetId].filter(id=>id!==key);
 return true;
}
