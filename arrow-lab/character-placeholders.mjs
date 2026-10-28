// Arrow Adventure-only fallback roster. These are NOT substitute character illustrations.
// All ten original individual player portraits have been approved and published as native PNGs.
// Keep stable IDs and upgrade stages so prior student selections, friends and purchases remain usable.
// Deployment and live-browser acceptance are tracked separately in master issue #20.
const missing=[
 ['luna_axolotl','Luna Axolotl','#8DABD1'],
 ['cosmo_fox','Cosmo Fox','#A7A1C7'],
 ['nova_panda','Nova Panda','#8699B5'],
 ['pixel_pig','Pixel Pig','#C7A6B7'],
 ['zippy_turtle','Zippy Turtle','#8DAFA6'],
 ['coco_koala','Coco Koala','#A4A8B5'],
 ['berry_bunny','Berry Bunny','#C3A4C9'],
 ['sparky_dragon','Sparky Dragon','#A2A7C6'],
 ['mochi_otter','Mochi Otter','#A7B8C1'],
 ['bolt_bot','Bolt Bot','#96A7BC']
];
export const pendingCharacters=missing.map(([id,name,themeColor])=>({
 id,name,themeColor,
 levels:['starter','power_up','super_power'].map((stage,i)=>({
   id:stage,level:i+1,name:['Starter','Power-Up','Super Power'][i],
   // Exact approved standalone PNG for this stable character ID, shared by all upgrade stages.
   image:'arrow-lab/characters/'+id+'.png',
   thumbnail:'arrow-lab/characters/'+id+'.png'
 })),
 rescuable:true,isStarterOption:true,friendUpgradesEnabled:true,
 artworkPending:false
}));
export function arrowLabCharacters(published){
 const list=Array.isArray(published)?published:[];
 const existing=new Set(list.map(c=>c.id));
 return [...list,...pendingCharacters.filter(c=>!existing.has(c.id))];
}
