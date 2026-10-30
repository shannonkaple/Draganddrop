/**
 * Drag & Drop only: every successfully finished activity awards three stars,
 * including replays. Core level-unlock and rescue rules still run once.
 * No saved IDs, completed levels, collectibles, purchases, or prior star totals
 * are replaced or reset.
 */
export function awardActivityStars(progress, run, level, config, completeLevel) {
  const alreadyFinished=progress.completedLevelIds.includes(level.id);
  const adjusted={...config,progression:{...config.progression,
    starRewards:{completion:3,itemCollection:0,skillChallenge:0}}};
  const firstAward=completeLevel(progress,run,level,adjusted);
  if(!alreadyFinished)return firstAward;
  progress.wallet.rainbowStars+=3;
  progress.lifetimeStarsEarned+=3;
  return 3;
}

/** Merge the legacy wallet bonus into the SAME student-record write. */
export function withLegacyActivityBonus(existing, stars) {
  if(!Number.isFinite(stars)||stars<=0||!existing.wallet)return existing;
  return {...existing,wallet:{...existing.wallet,
    total:(Number(existing.wallet.total)||0)+stars,
    earned:(Number(existing.wallet.earned)||0)+stars,
    finished:(Number(existing.wallet.finished)||0)+1
  }};
}
