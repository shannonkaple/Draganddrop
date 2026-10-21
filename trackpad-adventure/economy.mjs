export const worldCosts=[4,6,8,10,12,14];
export function migrate(s,lands){s.ownedWorlds??=s.friends.length?[s.land]:[];s.homes??={};s.friendLevels??={};s.collection??=[...new Set(s.records.flatMap(r=>r.done||[]))];for(const id of s.friends){if(!s.homes[id]&&s.ownedWorlds.includes(s.land))s.homes[id]=s.land}s.pendingRescue??=null;return s}
export function buyWorld(s,id,lands){const index=lands.findIndex(l=>l.id===id);if(index<0||s.ownedWorlds.includes(id)||s.stars<worldCosts[index])return false;s.stars-=worldCosts[index];s.ownedWorlds.push(id);s.land=id;return true}
export function grow(s,id){if(id!==s.hero&&!s.friends.includes(id))return false;const level=id===s.hero?s.level:(s.friendLevels[id]||0),cost=[3,5][level];if(cost===undefined||s.stars<cost)return false;s.stars-=cost;if(id===s.hero)s.level++;else s.friendLevels[id]=level+1;return true}
export function place(s,id,world){if(!s.friends.includes(id)||!s.ownedWorlds.includes(world))return false;s.homes[id]=world;return true}
