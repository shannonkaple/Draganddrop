// Refuse to leave a student's active screen until the complete current record
// has been durably verified. A silent/throwing Chromebook storage failure must
// not close a challenge, log out a student, or replace an unfinished maze.
export function navigateWithVerifiedSave(persist, proceed, warn) {
  if (typeof persist !== 'function' || typeof proceed !== 'function') return false;
  let saved = false;
  try { saved = persist() === true; } catch { saved = false; }
  if (!saved) {
    if (typeof warn === 'function') warn();
    return false;
  }
  proceed();
  return true;
}
