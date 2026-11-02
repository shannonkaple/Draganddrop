/** Original Arrow-Naut art; backgrounds are 1672×941 JPEGs.
 * World ids from the early prototype are intentionally unchanged to protect
 * previously saved student progress. Visual labels/order follow the new map.
 * All hotspots refer to percentages of the entire rendered image rectangle.
 */
export const GALAXY_MAP='./assets/galaxy-map.jpg';
export const PLANET_BACKGROUNDS=[
 './assets/candy-moon.jpg',
 './assets/rocket-launch.jpg',
 './assets/neon-rings.jpg',
 './assets/crystal-ice.jpg',
 './assets/robot-station.jpg',
 './assets/dino-asteroid.jpg',
 './assets/ocean-planet.jpg',
 './assets/lava-planet.jpg',
];
// Approximate pad centers checked against the actual 1672×941 panorama.
export const GALAXY_STOPS=[
 {x:7.2,y:47.2},{x:20.7,y:43.4},{x:33.0,y:45.3},{x:44.7,y:49.4},
 {x:56.3,y:44.2},{x:67.6,y:50.8},{x:79.6,y:45.5},{x:92.1,y:45.5}
];
// Eight clearly separated level pins (not painted into the JPG).
export const LEVEL_STOPS=[
 {x:16,y:32},{x:35,y:22},{x:57,y:26},{x:79,y:35},
 {x:84,y:65},{x:62,y:76},{x:40,y:73},{x:18,y:64}
];
export const planetImage=index=>PLANET_BACKGROUNDS[index]||PLANET_BACKGROUNDS[0];
