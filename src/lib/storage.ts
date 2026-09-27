// Storage & Server Sync Helper
// Syncs settings with server disk file (src/data/user_settings.json) + IndexedDB fallback

const DB_NAME = "TonyCenterDB";
const STORE_NAME = "app_settings";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB not supported");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fetch settings from Server Disk API (/api/settings) with IndexedDB fallback
export async function getStoredItem<T>(key: string, fallbackValue: T): Promise<T> {
  try {
    // 1. Try fetching from server API disk file first
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const serverData = await res.json();
      if (key === "tonycenter_bento_cards" && serverData.bentoCards?.length > 0) {
        return serverData.bentoCards as T;
      }
      if (key === "tonycenter_categories" && serverData.categories?.length > 0) {
        return serverData.categories as T;
      }
    }
  } catch (err) {
    console.warn("Server disk fetch warning:", err);
  }

  // 2. Fallback to IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result !== undefined) {
          resolve(request.result as T);
        } else {
          try {
            const local = localStorage.getItem(key);
            if (local) resolve(JSON.parse(local));
            else resolve(fallbackValue);
          } catch {
            resolve(fallbackValue);
          }
        }
      };

      request.onerror = () => resolve(fallbackValue);
    });
  } catch {
    return fallbackValue;
  }
}

// Save settings to IndexedDB + LocalStorage
export async function setStoredItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (err) {
    console.warn("IndexedDB save warning:", err);
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignored
  }
}

// Save & Sync all settings permanently to physical file on local server disk!
export async function saveAllSettingsToDisk(bentoCards: any[], categories: any[]): Promise<boolean> {
  try {
    await setStoredItem("tonycenter_bento_cards", bentoCards);
    await setStoredItem("tonycenter_categories", categories);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bentoCards, categories }),
    });

    return res.ok;
  } catch (err) {
    console.error("Save to disk error:", err);
    return false;
  }
}

export async function removeStoredItem(key: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(key);
  } catch (err) {
    console.warn("IndexedDB delete warning:", err);
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignored
  }
}

// In-browser image compressor
export function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject("Image load error");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject("File read error");
    reader.readAsDataURL(file);
  });
}
