'use strict';

(() => {
  const SYNC = '_paradeSync';
  const pending = new Map();
  const storageKey = ({ classCode, grade, number }) => 'parade_2026_' + classCode + '_' + grade + '_' + number;

  function read(identity) {
    try { return JSON.parse(localStorage.getItem(storageKey(identity)) || 'null'); }
    catch { return null; }
  }

  function write(session) {
    try {
      localStorage.setItem(session.key, JSON.stringify({
        ...session.draft,
        [SYNC]: { version: session.version, dirty: session.dirty }
      }));
      session.local = true;
    } catch { session.local = false; }
  }

  function endpoint(identity, mode, version, url) {
    const query = new URLSearchParams();
    if (mode === 'create') {
      query.set('on_conflict', 'class_code,student_number,grade');
    } else {
      query.set('class_code', 'eq.' + identity.classCode);
      query.set('grade', 'eq.' + identity.grade);
      query.set('student_number', 'eq.' + identity.number);
    }
    if (mode === 'load') {
      query.set('select', 'parade,updated_at');
      query.set('limit', '1');
    }
    if (mode === 'update') query.set('updated_at', 'eq.' + version);
    return url + '/rest/v1/parade_projects?' + query;
  }

  function configHeaders(key, writeMode) {
    const headers = { apikey: key, Accept: 'application/json' };
    if (writeMode) {
      headers['Content-Type'] = 'application/json';
      headers.Prefer = writeMode === 'create' ? 'resolution=ignore-duplicates,return=representation' : 'return=representation';
    }
    return headers;
  }

  function createStore(url, key, sanitize) {
    async function load(identity) {
      const session = { identity, key: storageKey(identity), version: null, dirty: false, local: false, sequence: 0 };
      const current = pending.get(session.key);
      if (current) await current.catch(() => {});
      const cached = read(identity);
      const saved = cached && sanitize(cached,identity.grade);
      if (saved) {
        session.draft = saved;
        session.local = true;
        session.version = cached[SYNC]?.version ?? null;
        session.dirty = cached[SYNC]?.dirty ?? true;
      }
      try {
        const response = await fetch(endpoint(identity, 'load', null, url), {
          headers: configHeaders(key), signal: AbortSignal.timeout(6500)
        });
        if (!response.ok) throw new Error('Cloud load failed (' + response.status + ')');
        const [row] = await response.json();
        if (row) {
          const online = sanitize(row.parade,identity.grade);
          const matches = saved && JSON.stringify(saved) === JSON.stringify(online);
          if (!saved || !session.dirty || matches) {
            session.draft = online;
            session.version = row.updated_at;
            session.dirty = false;
          } else if (session.version !== row.updated_at) {
            // Retain the Chromebook draft and the newer online copy independently.
            session.conflict = true;
          }
        } else if (session.version) {
          session.conflict = true;
        }
        session.draft ??= sanitize(null,identity.grade);
        const message = session.conflict ? 'Your Chromebook has changes to keep. Ask your teacher before switching devices.'
          : session.dirty ? 'Your Chromebook parade was loaded.'
          : row ? 'Your parade was loaded.' : 'Your parade is ready to create.';
        write(session);
        return { session, message };
      } catch (error) {
        console.warn(error.message);
        session.draft ??= sanitize(null,identity.grade);
        return { session, message: 'Offline. Your work will save on this Chromebook.' };
      }
    }

    function change(session, draft) {
      session.draft = draft;
      session.sequence++;
      session.dirty = true;
      write(session);
    }

    function save(session) {
      if (!session.dirty) return Promise.resolve(session.version?'Your parade is saved online.':session.local?'Saved on this Chromebook.':'Nothing has been saved yet.');
      if (session.conflict) return Promise.resolve((session.local?'Saved on this Chromebook. Ask your teacher about the other copy.':'Saving is unavailable. Keep this page open and ask your teacher to help.'));
      const previous = pending.get(session.key) ?? Promise.resolve();
      const sequence = session.sequence;
      const draft = session.draft;
      const task = previous.catch(() => {}).then(async () => {
        if (session.conflict) return (session.local?'Saved on this Chromebook. Ask your teacher about the other copy.':'Saving is unavailable. Keep this page open and ask your teacher to help.');
        const { classCode, number, grade } = session.identity;
        const mode = session.version ? 'update' : 'create';
        const updated_at = new Date().toISOString();
        const fields = { parade: draft, updated_at };
        const body = mode === 'create' ? { ...fields, class_code: classCode, student_number: number, grade } : fields;
        try {
          const response = await fetch(endpoint(session.identity, mode, session.version, url), {
            method: mode === 'create' ? 'POST' : 'PATCH',
            headers: configHeaders(key, mode),
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(7000)
          });
          if (!response.ok) throw new Error('Cloud save failed (' + response.status + ')');
          const [saved] = await response.json();
          if (!saved?.updated_at) {
            session.conflict = true;
            return (session.local?'Saved on this Chromebook. Ask your teacher about the other copy.':'Saving is unavailable. Keep this page open and ask your teacher to help.');
          }
          session.version = saved.updated_at;
          if (sequence === session.sequence) session.dirty = false;
          write(session);
          return 'Your parade is saved online.';
        } catch (error) {
          console.warn(error.message);
          return session.local ? 'Saved on this Chromebook. Online saving is unavailable.' : 'Saving is unavailable. Ask your teacher to help.';
        }
      });
      pending.set(session.key, task);
      task.finally(() => {
        if (pending.get(session.key) === task) pending.delete(session.key);
      });
      return task;
    }

    return { load, change, save, write };
  }

  window.createParadeStore = createStore;
})();
