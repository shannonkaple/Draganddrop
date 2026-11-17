// Original 27 independent PNGs: immutable byte-level contract from the approved source ZIP.
// Missing art is SKIPPED (not falsely passed); set ARROW_LAB_REQUIRE_SHOP_ART=1 to require all 27.
// Do not substitute contact sheets, generated SVGs, resized images or unrelated collectibles.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {newShopDecorationCatalog} from '../shop-purchasable-decorations.mjs';

const expected=[
  {
    "id": "shop_space_whimsical_galactic_rocket_lounge_chair",
    "path": "shop-decor/space/whimsical_galactic_rocket_lounge_chair.png",
    "sha256": "b8e80e16c07b180d172246ff86b16af2dd1d6da60944bca25d9f7c5e6180eada"
  },
  {
    "id": "shop_space_celestial_crescent_moon_hammock",
    "path": "shop-decor/space/celestial_crescent_moon_hammock.png",
    "sha256": "8a712a879501d171301b86e11b01d9a0b7fc0e2f717719ea8acbac109bf557ea"
  },
  {
    "id": "shop_space_glossy_cosmic_planet_portal_arch",
    "path": "shop-decor/space/glossy_cosmic_planet_portal_arch.png",
    "sha256": "3ececd091d454c379b2aa3a088f31796f6d58b488c98ae54ab507a38b9f28804"
  },
  {
    "id": "shop_space_whimsical_celestial_observatory_gazebo",
    "path": "shop-decor/space/whimsical_celestial_observatory_gazebo.png",
    "sha256": "4e4dc59c26a59be994d7ad5264d3b856a217c616ddc2c1730883f565a89a1406"
  },
  {
    "id": "shop_space_whimsical_galaxy_bunk_bed",
    "path": "shop-decor/space/whimsical_galaxy_bunk_bed.png",
    "sha256": "2f5bc3afbee6f48519f78efcd65426763ffd2015d29e72f79ae7ee3b69087653"
  },
  {
    "id": "shop_space_whimsical_satellite_swing_playground",
    "path": "shop-decor/space/whimsical_satellite_swing_playground.png",
    "sha256": "ee4027d6ebc80909b121ed27992fcb10e5369cf01cd0eb873c6d830cdf83e519"
  },
  {
    "id": "shop_space_glossy_meteor_crystal_picnic_table",
    "path": "shop-decor/space/glossy_meteor_crystal_picnic_table.png",
    "sha256": "359c5f5ea22324e8e24115571e2978c6a27af52863996b213f649075622df085"
  },
  {
    "id": "shop_space_alien_crystal_garden_fountain",
    "path": "shop-decor/space/alien_crystal_garden_fountain.png",
    "sha256": "fe24c17e4ea75b739e86b7eda97861b306186a1452c74fa58ba7a42913e9c924"
  },
  {
    "id": "shop_space_whimsical_ufo_canopy_bed_nook",
    "path": "shop-decor/space/whimsical_ufo_canopy_bed_nook.png",
    "sha256": "3cd5f0395b721df2bf58e88c8492e271c9d9908b6cf4c491217e6e8b584f6dfb"
  },
  {
    "id": "shop_jurassic_volcanic_lava_throne_with_tropical_foliage",
    "path": "shop-decor/jurassic/volcanic_lava_throne_with_tropical_foliage.png",
    "sha256": "c04a4b1baec3018d0738251f2724723a4cb5d837a3625eaaa2ea5b45dc6ab7b3"
  },
  {
    "id": "shop_jurassic_dinosaur_egg_garden_chair",
    "path": "shop-decor/jurassic/dinosaur_egg_garden_chair.png",
    "sha256": "cb108c083e293d40dc87dea6d3a5ed302e087996ec9d4380b31eae4b3aaf181d"
  },
  {
    "id": "shop_jurassic_tropical_hammock_island_oasis",
    "path": "shop-decor/jurassic/tropical_hammock_island_oasis.png",
    "sha256": "315f8ab8ae7a5cd6c107d4ebf9aca5bd7525f2a657ff3d65b4b7a76eee0d401f"
  },
  {
    "id": "shop_jurassic_roaring_t_rex_fossil_exhibit",
    "path": "shop-decor/jurassic/roaring_t_rex_fossil_exhibit.png",
    "sha256": "542ba5571631a2fc7a514979e43c79bebd317ef97d065a656377cf81cbdad152"
  },
  {
    "id": "shop_jurassic_tropical_grotto_waterfall_fountain",
    "path": "shop-decor/jurassic/tropical_grotto_waterfall_fountain.png",
    "sha256": "1164542a22c9189aa16e2a6e95b4bd03680f21d5a1249beeffaf66e380e4b660"
  },
  {
    "id": "shop_jurassic_jungle_rope_bridge_archway",
    "path": "shop-decor/jurassic/jungle_rope_bridge_archway.png",
    "sha256": "28b89c85425bc297aac1568174a47c1604b8ecd79b90cf13242fb817047d2332"
  },
  {
    "id": "shop_jurassic_prehistoric_stone_picnic_table_set",
    "path": "shop-decor/jurassic/prehistoric_stone_picnic_table_set.png",
    "sha256": "b3db6368761583da62ec0fabcffd15ebb1bc1b9afb3b4717e27d9f873999b9f1"
  },
  {
    "id": "shop_jurassic_vibrant_dinosaur_egg_nest_decor",
    "path": "shop-decor/jurassic/vibrant_dinosaur_egg_nest_decor.png",
    "sha256": "2eecbdf513f222b4bfc6d5f60f3c52552802261bbd3f2a00844e1457b0258ce9"
  },
  {
    "id": "shop_jurassic_dinosaur_jungle_jeep_sofa",
    "path": "shop-decor/jurassic/dinosaur_jungle_jeep_sofa.png",
    "sha256": "0bf643a44a2102ba85d9653a8763302b3f5cecc02b60e5cfec31763349c90414"
  },
  {
    "id": "shop_lava_majestic_lava_obsidian_throne",
    "path": "shop-decor/lava/majestic_lava_obsidian_throne.png",
    "sha256": "01d7bfc84febf925fda73df058b1674676a8cad3c5b8a2b737f2d705e4e9ecb8"
  },
  {
    "id": "shop_lava_whimsical_volcano_bunk_bed",
    "path": "shop-decor/lava/whimsical_volcano_bunk_bed.png",
    "sha256": "f55014ba9b12ea96fb2c2bbe9ecd8401ec6262e1bb108aa77b1f516f2bd667db"
  },
  {
    "id": "shop_lava_magical_lava_picnic_table_set",
    "path": "shop-decor/lava/magical_lava_picnic_table_set.png",
    "sha256": "5a4965b51035393a9ef4b75da1bc63ef68a21f46b80ccab87b497d49a711b44d"
  },
  {
    "id": "shop_lava_molten_lava_portal_arch",
    "path": "shop-decor/lava/molten_lava_portal_arch.png",
    "sha256": "f4a7c06774a4e45a0af9c259886f3bdb399e34badf7de7b59b4e10da7e38eda6"
  },
  {
    "id": "shop_lava_volcanic_crystal_lava_fountain",
    "path": "shop-decor/lava/volcanic_crystal_lava_fountain.png",
    "sha256": "481dbec3a112c1cc49493f81790e0fb1b886289392952304376b64d1d1253602"
  },
  {
    "id": "shop_lava_volcanic_lava_hammock_cove",
    "path": "shop-decor/lava/volcanic_lava_hammock_cove.png",
    "sha256": "5dda82ff4c3e9c67eea8c7f8a36b5e6e4dd499326738e7a40c4e195535d375f5"
  },
  {
    "id": "shop_lava_molten_crystal_gazebo",
    "path": "shop-decor/lava/molten_crystal_gazebo.png",
    "sha256": "1db2d7ecd78a60f3e5aa584bf4bcd0424026039fae0a06e88db70e673b0fe081"
  },
  {
    "id": "shop_lava_whimsical_molten_lava_swing_set",
    "path": "shop-decor/lava/whimsical_molten_lava_swing_set.png",
    "sha256": "acf15370ffdcef7e19303da858b540e16961a085d72a523875026eda240126c1"
  },
  {
    "id": "shop_lava_volcanic_lava_spa_lounge",
    "path": "shop-decor/lava/volcanic_lava_spa_lounge.png",
    "sha256": "0404087ae9f85e4bf4d48d71091f46e59b8a7257beca2a606ce659e8b0e4d9d2"
  }
];
const root=fileURLToPath(new URL('../',import.meta.url));
const fileFor=entry=>fileURLToPath(new URL('../'+entry.path,import.meta.url));
const missing=expected.filter(entry=>!existsSync(fileFor(entry)));

test('all 27 source ZIP entries match catalog stable IDs and exact target paths',()=>{
 assert.equal(expected.length,27);
 assert.equal(new Set(expected.map(entry=>entry.id)).size,27);
 for(const entry of expected){
  const catalogItem=newShopDecorationCatalog.find(item=>item.id===entry.id);
  assert.ok(catalogItem,'Missing stable catalog ID '+entry.id);
  assert.equal(catalogItem.artPath,'arrow-lab/'+entry.path);
  assert.equal(catalogItem.shopOnly,true);
 }
});

for(const entry of expected){
 test('original PNG integrity: '+entry.path,{skip:!existsSync(fileFor(entry))},()=>{
  const data=readFileSync(fileFor(entry));
  assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,'Do not alter original PNG bytes');
  assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Real PNG signature');
  assert.equal(data.toString('ascii',12,16),'IHDR');
  assert.equal(data.readUInt32BE(16),1254,'Original width');
  assert.equal(data.readUInt32BE(20),1254,'Original height');
  assert.equal(data[25],6,'RGBA PNG (not RGB contact sheet)');
 });
}

test('all 27 originals uploaded (strict deployment gate)',{
 skip:process.env.ARROW_LAB_REQUIRE_SHOP_ART!=='1'
},()=>{
 assert.deepEqual(missing.map(entry=>entry.path),[],'Missing source PNGs in /arrow-lab/: '+missing.map(entry=>entry.path).join(', '));
});
if(missing.length)console.warn('SHOP ART PENDING: '+missing.length+'/27 original PNGs missing; set ARROW_LAB_REQUIRE_SHOP_ART=1 to require uploads.');
