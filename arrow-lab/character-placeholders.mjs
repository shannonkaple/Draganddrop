// Arrow Adventure-only fallback roster. These are NOT substitute character illustrations.
// The original ten character artworks have not been published. Keep their stable IDs and
// upgrade stages so students' previous selections, friends and purchases remain usable.
// Remove a placeholder only after its own approved PNGs are deployed and browser-tested.
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
   // A non-URL marker deliberately rendered as an explicit neutral placeholder.
   // Luna is the original standalone 1278×1230 transparent illustration.
   // Other characters retain honest named placeholders until their own PNGs exist.
   image:id==='luna_axolotl'?'arrow-lab/characters/luna_axolotl.png':'pending:character:'+id,
   thumbnail:id==='luna_axolotl'?'arrow-lab/characters/luna_axolotl.png':'pending:character:'+id
 })),
 rescuable:true,isStarterOption:true,friendUpgradesEnabled:true,
 artworkPending:id!=='luna_axolotl'
}));
export function arrowLabCharacters(published){
 const list=Array.isArray(published)?published:[];
 const existing=new Set(list.map(c=>c.id));
 return [...list,...pendingCharacters.filter(c=>!existing.has(c.id))];
}
