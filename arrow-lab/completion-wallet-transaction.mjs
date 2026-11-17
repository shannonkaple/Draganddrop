// Merge the legacy practice-wallet award into the SAME verified student-record
// write as the Arrow Adventure maze completion. Never award on replay (0 stars).
// The old wallet format and exact +5 practice reward are intentionally preserved.
export function withLegacyMazeCompletion(record, earnedStars) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error('Invalid student record');
  }
  if (!(Number(earnedStars) > 0) || !record.wallet) return record;
  const wallet = record.wallet;
  if (typeof wallet !== 'object' || Array.isArray(wallet)) {
    throw new Error('Invalid legacy wallet');
  }
  return {
    ...record,
    wallet: {
      ...wallet,
      total: (Number(wallet.total) || 0) + 5,
      earned: (Number(wallet.earned) || 0) + 5,
      finished: (Number(wallet.finished) || 0) + 1
    }
  };
}
