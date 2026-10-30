// Apply a MY STUFF scene change only when the entire student record verifies.
// Rejected or throwing change functions can mutate nested fields before they
// fail; restore those fields just as we do after a rejected storage write.
const copy = value => value === undefined ? undefined : structuredClone(value);

export function commitSceneChange({progress,change,fields,persist,onRollback}) {
  if (!progress || typeof change !== 'function' || !Array.isArray(fields) ||
      typeof persist !== 'function') return false;
  const before = fields.map(field => ({
    field,
    existed: Object.prototype.hasOwnProperty.call(progress,field),
    value: copy(progress[field])
  }));
  let committed = false;
  try {
    if (change() === false) return false;
    committed = persist() === true;
    return committed;
  } catch {
    return false;
  } finally {
    if (!committed) {
      for (const {field,existed,value} of before) {
        if (existed) progress[field] = copy(value);
        else delete progress[field];
      }
      onRollback?.();
    }
  }
}
