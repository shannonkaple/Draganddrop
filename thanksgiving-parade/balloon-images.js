'use strict';

(() => {
  let connection;
  const imageKey = (student, design) => student + '/' + design.id;

  function database() {
    if (!connection) connection = new Promise((resolve, reject) => {
      const request = indexedDB.open('parade-balloon-images', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('images');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Balloon image storage is busy'));
    });
    return connection;
  }

  function recipeSignature(design) {
    return JSON.stringify([design.baseId, Object.entries(design.options).sort()]);
  }

  async function put(student, design, url) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite');
      transaction.objectStore('images').put({ recipe: recipeSignature(design), url }, imageKey(student, design));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  async function get(student, design) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const request = db.transaction('images').objectStore('images').get(imageKey(student, design));
      request.onsuccess = () => {
        const saved = request.result;
        resolve(saved?.recipe === recipeSignature(design) ? saved.url : '');
      };
      request.onerror = () => reject(request.error);
    });
  }

  async function remove(student, design) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite');
      transaction.objectStore('images').delete(imageKey(student, design));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  window.PARADE_IMAGES = { put, get, remove };
})();
