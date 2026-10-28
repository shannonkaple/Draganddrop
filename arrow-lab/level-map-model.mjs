// Arrow Adventure map presentation data. No student progress is stored here.
// The Library's 2026-10-28 candidate maps have NOT been approved or published.
// Add a JPEG here only after user approval and exact 2048x682 hotspot QA.
export const WORLD_MAP_SIZE=Object.freeze({width:2048,height:682});
export const WORLD_STOP_POINTS=Object.freeze([
  [6.7,41.7],[20.8,53.7],[33.1,70.6],[39.4,42.3],
  [53.5,57],[69.2,51.5],[84.2,69.8],[92.1,37.4]
].map(([x,y])=>Object.freeze({x,y})));
export const APPROVED_WORLD_LEVEL_MAPS=Object.freeze({
  candy:'arrow-lab/assets/candy-world-map-original.png'
  // Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava remain gated:
  // measured candidate hotspot offsets range 43.4–212.5px, so none is safe.
});
export function worldStopStatus(level,progress){
  const completed=!!progress?.completedLevelIds?.includes(level.id);
  // Some older student profiles kept only activeRun; do not hide their unfinished maze.
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
  return stages.map((level,stage)=>Object.freeze({level,stage:stage+1,position:WORLD_STOP_POINTS[stage],
    ...worldStopStatus(level,progress)}));
}
