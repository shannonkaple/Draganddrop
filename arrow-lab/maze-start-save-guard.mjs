// Keep an unfinished student's maze state intact if entering/restarting a maze
// cannot be durably saved. Deep copies are intentional: resume repair mutates
// the existing run's item/enemy arrays before the save attempt.
const copy = value => value === undefined ? undefined : structuredClone(value);

export function snapshotMazeStart({run,definition,mapWorld,progress}) {
  return {
    run: copy(run),
    definition,
    mapWorld,
    activeRun: copy(progress.activeRun),
    hadMazeRuns: Object.prototype.hasOwnProperty.call(progress,'mazeRuns'),
    mazeRuns: copy(progress.mazeRuns)
  };
}

export function restoreMazeStart(snapshot,progress) {
  if(snapshot.hadMazeRuns) progress.mazeRuns=copy(snapshot.mazeRuns);
  else delete progress.mazeRuns;
  if(snapshot.activeRun===undefined) delete progress.activeRun;
  else progress.activeRun=copy(snapshot.activeRun);
  return {run:copy(snapshot.run),definition:snapshot.definition,mapWorld:snapshot.mapWorld};
}
