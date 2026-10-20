const memory = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return memory.size;
  },
  clear() {
    memory.clear();
  },
  getItem(key: string) {
    return memory.has(key) ? memory.get(key)! : null;
  },
  key(index: number) {
    return [...memory.keys()][index] ?? null;
  },
  removeItem(key: string) {
    memory.delete(key);
  },
  setItem(key: string, value: string) {
    memory.set(key, value);
  },
};

export function getSafeStorage(): Storage {
  try {
    const probe = "__kindloop_storage__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

export function readStoredItem(key: string): string | null {
  try {
    return getSafeStorage().getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredItem(key: string, value: string): void {
  try {
    getSafeStorage().setItem(key, value);
  } catch {
    // Private mode / in-app browsers can block storage.
  }
}
