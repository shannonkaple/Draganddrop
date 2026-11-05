/** Arrow-Naut standalone transparent PNG catalog (2026-11-05).
 * NO sprite sheet slicing, shape emojis, or CSS background-position crops.
 * Legacy saved player IDs remain mapped to whole PNG characters.
 */
const a = name => './assets/standalone/'+name+'.png';
const j = name => '../arrow-naut-jr/assets/explorers/'+name+'.png';
const ja= name => '../arrow-naut-jr/assets/new-space-art/'+name+'.png';
export const PLAYERS=[
 {id:'astro-pup',name:'Cosmo Fox',image:a('astro_fox')},
 {id:'luna-cat',name:'Nova Panda',image:a('astro_panda')},
 {id:'comet-fox',name:'Comet Kitty',image:a('astro_kitten')},
 {id:'orbit-bunny',name:'Bolt Astronaut Robot',image:a('astro_robot')}
];
const PLAYER_LEGACY={'nova-otter':'astro-pup','pixel-penguin':'luna-cat','zippy-turtle':'orbit-bunny','ziggy-alien':'orbit-bunny','cosmo-kid':'astro-pup'};
export const FRIEND_SPRITES=[
 a('rescue_bunny'),a('rescue_turtle'),a('rescue_otter'),a('rescue_koala'),
 a('rescue_puppy'),j('space_panda'),j('space_kitty'),j('star_bot')
];
export const ENEMY_SPRITES=[
 a('enemy_meteor'),a('enemy_glitch'),a('enemy_asteroid'),
 ja('meteor_slime'),ja('space_bat')
];
export const SHOP_SPRITES={
 telescope:a('pickup_crystals'),'moon-buggy':a('space_rover'),'robot-pet':a('rescue_puppy'),
 crystals:a('pickup_crystals'),'rocket-lamp':a('pickup_star'),
 'alien-plant':ja('crystal_moon'),'space-helmet':a('astro_robot'),
 'rocket-boots':a('space_rover'),'star-cape':a('pickup_star'),
 'astro-goggles':a('astro_panda'),'mini-ufo':a('space_ufo'),
 'solar-satellite':ja('star_beacon'),'cosmic-snowglobe':ja('star_chest'),
 'legacy-lollipop':'../arrow-lab/collectibles/candy/lollipop.png',
 'legacy-cupcake':'../arrow-lab/collectibles/candy/cupcake.png',
 'legacy-pirate-chest':'../arrow-lab/collectibles/pirate/treasure_chest.png',
 'legacy-gold-coins':'../arrow-lab/collectibles/pirate/gold_coins.png',
 'legacy-compass':'../arrow-lab/collectibles/pirate/compass.png',
 'legacy-ice-gem':'../arrow-lab/collectibles/arctic/icicle_gem.png',
 'legacy-snowglobe':'../arrow-lab/collectibles/arctic/snow_globe.png',
 'legacy-pearl-shell':'../arrow-lab/collectibles/ocean/pearl_shell.png',
 'legacy-sea-turtle':'../arrow-lab/collectibles/ocean/sea_turtle.png',
 'legacy-starfish':'../arrow-lab/collectibles/ocean/starfish.png',
 'legacy-golden-key':'../arrow-lab/collectibles/castle/golden_key.png',
 'legacy-hot-cocoa':'../arrow-lab/collectibles/arctic/hot_cocoa.png'
};
export const PUZZLE_SPRITES={
 'box-a':a('crate_pink'),'box-b':a('crate_blue'),
 'box-c':a('crate_purple'),'box-d':a('crate_mint'),'box-e':a('crate_purple'),
 'rover':a('space_rover'),
 'resize-tile-1':a('crate_blue'),'resize-tile-2':a('crate_mint'),'resize-tile-3':a('crate_pink'),
 'cargo-l':'../arrow-naut-jr/assets/puzzle/l_shaped_cargo.png',
 'cargo-t':'../arrow-naut-jr/assets/puzzle/t_shaped_cargo.png',
 'rocket':'../arrow-naut-jr/assets/puzzle/rocket.png',
 'decoy':a('crate_pink'),'module':a('crate_blue'),
 'decoy-2':a('crate_purple'),'decoy-3':a('crate_mint'),
 'satellite':'../arrow-naut-jr/assets/puzzle/space_station_satellite.png',
 'panel':'../arrow-naut-jr/assets/puzzle/communications_satellite.png',
 'antenna':ja('star_beacon'),'window':'../arrow-naut-jr/assets/puzzle/space_greenhouse.png',
 'console':'../arrow-naut-jr/assets/puzzle/robot_probe.png',
 'bridge':a('space_rover'),'beacon':ja('star_beacon'),'signal':a('pickup_star')
};
export const EARNABLES=[
 {id:'candy-crystal',name:'Candy Moon Crystal',image:a('pickup_crystals'),planet:0,level:4},
 {id:'rocket-medal',name:'Rocket Launch Medal',image:a('pickup_star'),planet:1,level:4},
 {id:'orbit-gear',name:'Orbit Star Crystal',image:ja('crystal_moon'),planet:2,level:4},
 {id:'frost-diamond',name:'Frost Crystal',image:a('pickup_crystals'),planet:3,level:4},
 {id:'robot-battery',name:'Robot Signal',image:ja('star_beacon'),planet:4,level:4},
 {id:'dino-fossil',name:'Meteor Star',image:a('pickup_star'),planet:5,level:4},
 {id:'ocean-pearl',name:'Ocean Satellite',image:a('space_ufo'),planet:6,level:4},
 {id:'lava-light',name:'Lava Star',image:a('pickup_star'),planet:7,level:4}
];
export const playerPortrait=id=>PLAYERS.find(p=>p.id===(PLAYER_LEGACY[id]||id))?.image||PLAYERS[0].image;
export const friendPortrait=index=>FRIEND_SPRITES[index]||FRIEND_SPRITES[0];
export const enemyPortrait=index=>ENEMY_SPRITES[Math.abs(index)%ENEMY_SPRITES.length];
export const earnedItems=progress=>EARNABLES.filter(item=>{
 const ids=['launch','moon','robot','crystal','slime','ice','jungle','core'];
 return progress?.completed?.includes(ids[item.planet]+'-'+item.level);
});
