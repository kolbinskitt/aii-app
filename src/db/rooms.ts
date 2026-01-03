const DB_NAME = 'aii-db';
const STORE = 'rooms';
const VERSION = 1;

/* =========================
   Typy
========================= */

export type Room = {
  id: string;
  name?: string;
  slug: string;
  createdAt: number;
};

type CreateRoomInput = {
  id: string;
  name?: string;
  slug: string;
};

/* =========================
   IndexedDB helpers
========================= */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* =========================
   API
========================= */

export async function createRoom({
  id,
  name,
  slug,
}: CreateRoomInput): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);

  store.put({
    id,
    name,
    slug,
    createdAt: Date.now(),
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRoomById(id: string): Promise<Room | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);

  return new Promise((resolve, reject) => {
    const request = store.openCursor();

    request.onerror = () => reject(request.error);

    request.onsuccess = event => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
        .result;

      if (!cursor) {
        resolve(null);
        return;
      }

      const room = cursor.value as Room;

      if (room.id === id) {
        resolve(room);
      } else {
        cursor.continue();
      }
    };
  });
}

export async function getAllRooms(): Promise<Room[]> {
  const db = await openDB();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);

  return new Promise((resolve, reject) => {
    const rooms: Room[] = [];
    const request = store.openCursor();

    request.onerror = () => reject(request.error);

    request.onsuccess = event => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
        .result;

      if (!cursor) {
        resolve(rooms);
        return;
      }

      rooms.push(cursor.value as Room);
      cursor.continue();
    };
  });
}
