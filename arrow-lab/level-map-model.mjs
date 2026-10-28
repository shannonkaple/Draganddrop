// Native-size illustrated world level maps. Every saved maze/level ID is untouched.
// The seven existing world JPEG originals were published Oct 28 on the teacher's
// explicit request to use the created maps and FIX THE PLACES.
// Each world has its OWN measured eight-pad centers; never stretch/crop/warp art.
export const WORLD_MAP_SIZE=Object.freeze({width:2048,height:682});
export const WORLD_IDS=Object.freeze(["candy","pirate","arctic","castle","space","jurassic","ocean","lava"]);
export const WORLD_STOP_POINTS=Object.freeze([[6.7,41.7],[20.8,53.7],[33.1,70.6],[39.4,42.3],[53.5,57],[69.2,51.5],[84.2,69.8],[92.1,37.4]].map(([x,y])=>Object.freeze({x,y})));
export const WORLD_STOP_POINTS_BY_WORLD=Object.freeze({
  candy:Object.freeze([[6.7,41.7],[20.8,53.7],[33.1,70.6],[39.4,42.3],[53.5,57],[69.2,51.5],[84.2,69.8],[92.1,37.4]].map(([x,y])=>Object.freeze({x,y}))),
  pirate:Object.freeze([[6.72,35.96],[20.74,48.97],[34.54,65.93],[40.62,39.95],[54.03,55.59],[69.12,49.55],[83.47,67.23],[93.08,35.86]].map(([x,y])=>Object.freeze({x,y}))),
  arctic:Object.freeze([[7.08,38.73],[21.46,51.93],[35.06,66.46],[40.21,43.22],[55.01,59.52],[69.76,52.89],[84.83,67.78],[92.69,40.64]].map(([x,y])=>Object.freeze({x,y}))),
  castle:Object.freeze([[7.65,36.48],[22.7,49.2],[36.23,67.36],[43.98,49.3],[56.68,59.17],[69.89,52.27],[82.66,67.88],[94.37,56.86]].map(([x,y])=>Object.freeze({x,y}))),
  space:Object.freeze([[7.39,36.09],[20.68,49.84],[33.87,64.94],[42.26,40.99],[55.58,57.1],[69.4,51.48],[83.56,65.05],[92.81,36.49]].map(([x,y])=>Object.freeze({x,y}))),
  jurassic:Object.freeze([[6.87,38.14],[21.57,49.48],[36.73,53.19],[44.97,68.59],[56.21,56.34],[68.91,65.56],[82.57,54.8],[93.06,41.12]].map(([x,y])=>Object.freeze({x,y}))),
  ocean:Object.freeze([[7.26,25.3],[18.29,44.52],[32.37,62.48],[45.32,39.39],[58.97,58.27],[73.66,37.69],[85.77,60.63],[92.63,25.64]].map(([x,y])=>Object.freeze({x,y}))),
  lava:Object.freeze([[7.84,27.22],[21.5,47.92],[35.66,63.12],[43.48,40.38],[56.56,57.62],[70.53,49.79],[84.33,66.62],[92.9,36.39]].map(([x,y])=>Object.freeze({x,y})))
});
export const APPROVED_WORLD_LEVEL_MAPS=Object.freeze({
 candy:'arrow-lab/assets/candy-world-map-original.png'
});
// These seven existing images are now deliberately published for visual review,
// with their *measured* actual clickable pad positions (not Candy's positions).
export const PUBLISHED_WORLD_LEVEL_MAPS=Object.freeze({
  candy:'arrow-lab/assets/candy-world-map-original.png',
  pirate:'arrow-lab/world-maps/pirate-world-map.jpg',
  arctic:'arrow-lab/world-maps/arctic-world-map.jpg',
  castle:'arrow-lab/world-maps/castle-world-map.jpg',
  space:'arrow-lab/world-maps/space-world-map.jpg',
  jurassic:'arrow-lab/world-maps/jurassic-world-map.jpg',
  ocean:'arrow-lab/world-maps/ocean-world-map.jpg',
  lava:'arrow-lab/world-maps/lava-world-map.jpg'
});
export function worldStopStatus(level,progress){
 const completed=!!progress?.completedLevelIds?.includes(level.id);
 const saved=progress?.mazeRuns?.[level.id];
 const active=progress?.activeRun?.id===level.id?progress.activeRun:null;
 const started=!completed&&[saved,active].some(run=>run&&run.complete!==true);
 const unlocked=completed||level.number<=Number(progress?.highestUnlockedLevel||1);
 return Object.freeze({completed,started,unlocked,
  label:completed?'Completed — replay':started?'In progress — continue':unlocked?'Ready to play':'Locked',
  symbol:completed?'✓':started?'↪':unlocked?'▶':'🔒'});
}
export function worldStopModels(worldIndex,levels,progress){
 if(!Number.isInteger(worldIndex)||worldIndex<0||worldIndex>7)throw RangeError('Invalid world');
 const stages=levels.slice(worldIndex*8,worldIndex*8+8);
 if(stages.length!==8)throw Error('Expected eight maze definitions');
 const points=WORLD_STOP_POINTS_BY_WORLD[WORLD_IDS[worldIndex]];
 return stages.map((level,stage)=>Object.freeze({level,stage:stage+1,position:points[stage],
  ...worldStopStatus(level,progress)}));
}
