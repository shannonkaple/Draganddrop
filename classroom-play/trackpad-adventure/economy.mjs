export const worldCosts=[4,6,8,10,12,14];
export function migrate(s,lands){s.ownedWorlds??=s.friends.length?[s.land]:[];s.homes??={};s.friendLevels??={};s.collection??=[...new Set(s.records.flatMap(r=>r.done||[]))];for(const id of s.friends){if(!s.homes[id]&&s.ownedWorlds.includes(s.land))s.homes[id]=s.land}s.pendingRescue??=null;s.positions??={};s.decorations??={};s.playerLevels??={};if(s.hero)s.playerLevels[s.hero]=s.level;return s}
export function buyWorld(s,id,lands){const index=lands.findIndex(l=>l.id===id);if(index<0||s.ownedWorlds.includes(id)||s.stars<worldCosts[index])return false;s.stars-=worldCosts[index];s.ownedWorlds.push(id);s.land=id;return true}
export function grow(s,id){if(id!==s.hero&&!s.friends.includes(id))return false;const level=id===s.hero?s.level:Math.max(s.friendLevels[id]||0,s.playerLevels?.[id]||0),cost=[3,5][level];if(cost===undefined||s.stars<cost||(!s.ownedWorlds.length&&s.stars-cost<worldCosts[0]))return false;s.stars-=cost;if(id===s.hero)s.level++;if(s.friends.includes(id))s.friendLevels[id]=level+1;(s.playerLevels??={})[id]=level+1;return true}
export function place(s,id,world){if(!s.friends.includes(id)||!s.ownedWorlds.includes(world))return false;s.homes[id]=world;return true}

export const decorations=[
 {id:'flowers',name:'Rainbow flowers',art:'flowers',cost:2},
 {id:'tree',name:'Rainbow candy tree',art:'tree',cost:3},
 {id:'crystals',name:'Rainbow crystals',art:'crystals',cost:4},
 {id:'monitor',name:'Rainbow monitor',art:'monitor',cost:4},
 {id:'mouse',name:'Rainbow mouse',art:'mouse',cost:3},
 {id:'keyboard',name:'Rainbow keyboard',art:'keyboard',cost:4},
 {id:'headphones',name:'Rainbow headphones',art:'headphones',cost:4},
 {id:'signpost',name:'Rainbow signpost',art:'signpost',cost:5},
 {id:'bridge',name:'Rainbow bridge',art:'bridge',cost:6},
 {id:'bench',name:'Butterfly bench',art:'bench',cost:6},
 {id:'cottage',name:'Mushroom cottage',art:'cottage',cost:10},
 {id:'treasure',name:'Rainbow treasure chest',art:'treasure',cost:8},
 {id:'tent',name:'Adventure tent',emoji:'⛺',cost:5},
 {id:'trophy',name:'Star trophy',emoji:'🏆',cost:6}
];
export function switchPlayer(s,id,allowed){
 if(!allowed.includes(id))return false;
 s.playerLevels??={};
 if(s.hero)s.playerLevels[s.hero]=s.level;
 const legacyLevel=s.reselectGuide?s.level:0;
 s.hero=id;s.level=Math.max(s.playerLevels[id]||0,s.friendLevels[id]||0,legacyLevel);
 s.playerLevels[id]=s.level;s.reselectGuide=false;
 return true
}

export function buyDecoration(s,id){const d=decorations.find(x=>x.id===id);if(!d||!s.ownedWorlds.includes(s.land)||s.stars<d.cost||(s.decorations[s.land]||[]).includes(id))return false;s.stars-=d.cost;(s.decorations[s.land]??=[]).push(id);return true}
export function savePosition(s,world,id,x,y){const allowed=id===s.hero||s.friends.includes(id)&&s.homes[id]===world||id.startsWith('decor:')&&(s.decorations[world]||[]).includes(id.slice(6));if(!allowed||!s.ownedWorlds.includes(world)||!Number.isFinite(x)||!Number.isFinite(y))return false;(s.positions[world]??={})[id]={x:Math.max(8,Math.min(92,x)),y:Math.max(18,Math.min(86,y))};return true}
