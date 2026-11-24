import { TrainingSchoolId } from '../data/exerciseVideos';

const DB_NAME = 'apex_offline_videos_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
export const VIDEO_CACHE_NAME = 'apex-exercise-videos-v1';

export interface StoredLocalVideo {
  key: string;
  exerciseId: string;
  school: TrainingSchoolId;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  savedAt: string;
  blob: Blob;
}

function makeKey(exerciseId: string, school: TrainingSchoolId): string {
  return `${exerciseId}::${school}`;
}

function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

export async function saveLocalExerciseVideo(
  exerciseId: string,
  school: TrainingSchoolId,
  file: File
): Promise<StoredLocalVideo> {
  const db = await openVideoDB();
  const record: StoredLocalVideo = {
    key: makeKey(exerciseId, school),
    exerciseId,
    school,
    fileName: file.name || `${exerciseId}-${school}.mp4`,
    mimeType: file.type || 'video/mp4',
    sizeBytes: file.size,
    savedAt: new Date().toISOString(),
    blob: file,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to save video'));
  });
  return record;
}

export async function getLocalExerciseVideo(
  exerciseId: string,
  school: TrainingSchoolId
): Promise<StoredLocalVideo | null> {
  try {
    const db = await openVideoDB();
    const exact = await new Promise<StoredLocalVideo | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(makeKey(exerciseId, school));
      req.onsuccess = () => resolve(req.result as StoredLocalVideo | undefined);
      req.onerror = () => reject(req.error);
    });
    if (exact) return exact;

    if (school !== 'general') {
      const fallback = await new Promise<StoredLocalVideo | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(makeKey(exerciseId, 'general'));
        req.onsuccess = () => resolve(req.result as StoredLocalVideo | undefined);
        req.onerror = () => reject(req.error);
      });
      if (fallback) return fallback;
    }
    return null;
  } catch {
    return null;
  }
}

export async function deleteLocalExerciseVideo(
  exerciseId: string,
  school: TrainingSchoolId
): Promise<void> {
  try {
    const db = await openVideoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(makeKey(exerciseId, school));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export async function isVideoCachedOffline(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false;
  try {
    const directMatch = await caches.match(url, { ignoreSearch: true });
    if (directMatch) return true;
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const cached = await cache.match(url, { ignoreSearch: true });
    return Boolean(cached);
  } catch {
    return false;
  }
}

export async function ensureVideoCachedOffline(url: string): Promise<boolean> {
  if (typeof caches === 'undefined') return false;
  try {
    const already = await isVideoCachedOffline(url);
    if (already) return true;
    const res = await fetch(url);
    if (!res.ok) return false;
    const cache = await caches.open(VIDEO_CACHE_NAME);
    await cache.put(url, res.clone());
    return true;
  } catch {
    return false;
  }
}

export async function resolveOfflineVideoSrc(url: string): Promise<string> {
  if (typeof caches === 'undefined') return url;
  try {
    const match = await caches.match(url, { ignoreSearch: true });
    if (match) {
      const blob = await match.blob();
      return URL.createObjectURL(blob);
    }
  } catch {
    // fallback to original url
  }
  return url;
}

export async function getLocalVideosSummary(): Promise<{ count: number; totalBytes: number }> {
  try {
    const db = await openVideoDB();
    return await new Promise<{ count: number; totalBytes: number }>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const items = (req.result as StoredLocalVideo[]) || [];
        const totalBytes = items.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
        resolve({ count: items.length, totalBytes });
      };
      req.onerror = () => resolve({ count: 0, totalBytes: 0 });
    });
  } catch {
    return { count: 0, totalBytes: 0 };
  }
}

export async function triggerVideoDownload(srcOrBlobUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(srcOrBlobUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    const a = document.createElement('a');
    a.href = srcOrBlobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
