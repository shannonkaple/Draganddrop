/** Teacher-directed level access with no false completions, stars or rescued friends. */
export const MAP_ONE_LEVELS=64;
export const MAP_TWO_FINISHED_WORLDS=2;
export const teacherThrough=progress=>Number.isInteger(progress?.teacherUnlockThrough)&&progress.teacherUnlockThrough>=0
 ? Math.min(79,progress.teacherUnlockThrough):-1;
export function levelIndex(map,world,stage){
 if(!Number.isInteger(world)||!Number.isInteger(stage)||stage<0||stage>=8)
  throw Error('Choose a valid world and level.');
 if(map==='one'&&world>=0&&world<8)return world*8+stage;
 if(map==='two'&&world>=0&&world<MAP_TWO_FINISHED_WORLDS)return MAP_ONE_LEVELS+world*8+stage;
 throw Error('This world does not have playable levels yet.');
}
export const teacherCanOpen=(progress,map,world,stage)=>teacherThrough(progress)>=levelIndex(map,world,stage);
export function grantTeacherLevel(progress,{map,world,stage}){
 const n=levelIndex(map,world,stage);
 return {...progress,teacherUnlockThrough:Math.max(teacherThrough(progress),n),
  teacherTarget:{map,world,stage},teacherUnlockVersion:1};
}
