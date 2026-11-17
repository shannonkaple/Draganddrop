// Keep enemy patrol movement and any resulting collision atomic with the
// student's durable maze save. Never display a phantom enemy position or
// erase a saved route when Chromebook storage refuses the write.
export function advanceHazardsSafely(run, persist) {
  const previous = {
    hazards: run.hazards.map(enemy => ({
      index: enemy.index,
      warning: enemy.warning,
      hadWarning: Object.prototype.hasOwnProperty.call(enemy, 'warning')
    })),
    player: {...run.player},
    checkpoint: run.checkpoint ? {...run.checkpoint} : run.checkpoint,
    trail: Array.isArray(run.trail)
      ? run.trail.map(point => Array.isArray(point) ? [...point] : point)
      : run.trail
  };
  for (const enemy of run.hazards) {
    if (enemy.warning) {
      if (enemy.path.length > 1) enemy.index = (enemy.index + 1) % enemy.path.length;
      delete enemy.warning;
    }
  }
  const collision = run.hazards.some(enemy => {
    const position = enemy.path[enemy.index];
    return position && position.x === run.player.x && position.y === run.player.y;
  });
  if (collision) {
    run.player = {...run.start};
    run.checkpoint = {...run.start};
    run.trail = [[run.start.x, run.start.y]];
  }
  let saved = false;
  try { saved = persist() === true; } catch { /* Roll back on rejected writes. */ }
  if (!saved) {
    run.hazards.forEach((enemy, index) => {
      const old = previous.hazards[index];
      enemy.index = old.index;
      if (old.hadWarning) enemy.warning = old.warning;
      else delete enemy.warning;
    });
    run.player = previous.player;
    run.checkpoint = previous.checkpoint;
    run.trail = previous.trail;
  }
  return {saved, collision: saved && collision};
}
