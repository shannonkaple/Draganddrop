/**
 * Keep an owned-world view change atomic with the student's verified save.
 * Never switch the visible world when a Chromebook silently ignores a write.
 * Existing saved world IDs, decorations, placements, stars and runs are untouched.
 */
export function commitWorldView({progress, worldId, persist, fields=['collectionWorldId','primaryRainbowLandId']}) {
  if (!progress || typeof progress !== 'object' || !worldId || typeof persist !== 'function' ||
      !Array.isArray(fields) || !fields.length ||
      fields.some(field => !['collectionWorldId','primaryRainbowLandId'].includes(field))) return false;
  if (fields.every(field => progress[field] === worldId)) return true;
  const previous = fields.map(field => ({field, had: Object.prototype.hasOwnProperty.call(progress, field), value: progress[field]}));
  for (const field of fields) progress[field] = worldId;
  let saved = false;
  try { saved = persist() === true; } catch { saved = false; }
  if (!saved) {
    for (const {field, had, value} of previous) {
      if (had) progress[field] = value;
      else delete progress[field];
    }
  }
  return saved;
}
