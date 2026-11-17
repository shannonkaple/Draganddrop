// A storage write is not successful until the browser returns the exact bytes.
// Some private/managed browser storage implementations silently ignore writes.
export function writeVerifiedStudentRecord(storage, key, record) {
  if (!storage || typeof key !== 'string' || !key) throw new Error('Student storage unavailable');
  const serialized = JSON.stringify(record);
  if (typeof serialized !== 'string') throw new Error('Student record cannot be serialized');
  storage.setItem(key, serialized);
  if (storage.getItem(key) !== serialized) throw new Error('Student progress was not persisted');
  return true;
}
