/** New illustrated Arrow-Naut prototype asset set, 2026-11-02.
 * 63 independently loadable RGBA PNGs from original generated artboards.
 * Small portraits are isolated in transparent-corner space badges so no
 * cut-up sprite sheets or label panels appear on the screens.
 * Student progress IDs and all mission IDs remain stable.
 */
const file = name => `./assets/sprites/${name}.png`;
export const PLAYERS = [
 {id:'astro-pup',name:'Astro Pup',image:file('astro-pup')},
 {id:'luna-cat',name:'Luna Cat',image:file('luna-cat')},
 {id:'comet-fox',name:'Comet Fox',image:file('comet-fox')},
 {id:'orbit-bunny',name:'Orbit Bunny',image:file('orbit-bunny')},
 {id:'nova-otter',name:'Nova Otter',image:file('nova-otter')},
 {id:'pixel-penguin',name:'Pixel Penguin',image:file('pixel-penguin')},
 {id:'zippy-turtle',name:'Zippy Turtle',image:file('zippy-turtle')},
 {id:'ziggy-alien',name:'Ziggy Alien',image:file('ziggy-alien')},
 {id:'cosmo-kid',name:'Cosmo Kid',image:file('cosmo-kid')},
];
export const FRIEND_SPRITES = [
 'pip-star-sprout','momo-moon-mouse','beebo-bot','glimmer-gecko',
 'bloop-blob','frosty-ferret','zuzu-comet-cub','nova-starling'
].map(file);
export const ENEMY_SPRITES = [
 'meteor-mite','zap-bot','glitch-rover','asteroid-spike',
 'cosmic-cube','crater-crab','shadow-ufo','violet-blob'
].map(file);
export const SHOP_SPRITES = {
 'telescope':file('telescope'),
 'moon-buggy':file('moon-buggy'),
 'robot-pet':file('beebo-bot'),
 'crystals':file('crystals'),
 'rocket-lamp':file('rocket-lamp'),
 'alien-plant':file('alien-plant'),
 'space-helmet':file('space-helmet'),
 'rocket-boots':file('rocket-boots'),
 'star-cape':file('star-cape'),
 'astro-goggles':file('astro-goggles'),
 'mini-ufo':file('mini-ufo'),
 'solar-satellite':file('solar-satellite'),
 'cosmic-snowglobe':file('cosmic-snowglobe'),
};
export const PUZZLE_SPRITES = {
 'box-a':file('pink-window'),'box-b':file('blue-window'),
 'box-c':file('purple-circle'),'rover':file('moon-buggy'),
 'cargo-l':file('cargo-l-blue'),'cargo-t':file('cargo-t-pink'),
 'rocket':file('rocket-boots'),'decoy':file('pink-window'),
 'module':file('blue-console'),'satellite':file('solar-satellite'),
 'panel':file('solar-panel'),'antenna':file('telescope'),
 'window':file('space-window'),'console':file('blue-console'),
 'bridge':file('cargo-bar-orange'),'beacon':file('comet-star')
};
export const EARNABLES = [
 {id:'candy-crystal',name:'Candy Moon Crystal',image:file('crystals'),planet:0,level:4},
 {id:'rocket-medal',name:'Rocket Launch Medal',image:file('gold-star'),planet:1,level:4},
 {id:'orbit-gear',name:'Neon Ring Gear',image:file('silver-gear'),planet:2,level:4},
 {id:'frost-diamond',name:'Frost Diamond',image:file('ice-diamond'),planet:3,level:4},
 {id:'robot-battery',name:'Robot Energy Cell',image:file('energy-canister'),planet:4,level:4},
 {id:'dino-fossil',name:'Meteor Star',image:file('comet-star'),planet:5,level:4},
 {id:'ocean-pearl',name:'Ocean Pearl',image:file('purple-circle'),planet:6,level:4},
 {id:'lava-light',name:'Lava Light',image:file('rocket-lamp'),planet:7,level:4},
];
export const playerPortrait=(id)=>PLAYERS.find(p=>p.id===id)?.image||PLAYERS[0].image;
export const friendPortrait=(index)=>FRIEND_SPRITES[index]||FRIEND_SPRITES[0];
export const enemyPortrait=(index)=>ENEMY_SPRITES[index]||ENEMY_SPRITES[0];
export const earnedItems=progress=>EARNABLES.filter(item=>{
 const ids=['launch','moon','robot','crystal','slime','ice','jungle','core'];
 return progress?.completed?.includes(`${ids[item.planet]}-${item.level}`);
});
