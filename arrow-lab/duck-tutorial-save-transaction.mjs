// Save the one-time duck tutorial acknowledgement atomically with the maze.
// If a Chromebook refuses the write, both in-memory flags return to their
// previous values so the tutorial can be retried without losing progress.
export function commitDuckTutorial({run,progress,persist}){
  if(!run||!progress||typeof persist!=='function')return false;
  const runHad=Object.prototype.hasOwnProperty.call(run,'duckLearned');
  const progressHad=Object.prototype.hasOwnProperty.call(progress,'duckTutorialSeen');
  const oldRun=run.duckLearned,oldProgress=progress.duckTutorialSeen;
  run.duckLearned=true;
  progress.duckTutorialSeen=true;
  let saved=false;
  try{saved=persist()===true}catch{saved=false}
  if(saved)return true;
  if(runHad)run.duckLearned=oldRun;else delete run.duckLearned;
  if(progressHad)progress.duckTutorialSeen=oldProgress;else delete progress.duckTutorialSeen;
  return false;
}
