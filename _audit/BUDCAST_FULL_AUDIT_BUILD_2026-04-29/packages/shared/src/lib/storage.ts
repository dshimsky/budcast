type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memory = new Map<string, string>();

const memoryStorage: AsyncStorageLike = {
  getItem: async (key) => memory.get(key) ?? null,
  setItem: async (key, value) => {
    memory.set(key, value);
  },
  removeItem: async (key) => {
    memory.delete(key);
  }
};

function isReactNativeRuntime() {
  return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}

export function getAsyncStorage(): AsyncStorageLike {
  if (typeof window !== "undefined" && !isReactNativeRuntime() && window.localStorage) {
    return {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key) => {
        window.localStorage.removeItem(key);
      }
    };
  }

  if (isReactNativeRuntime()) {
    try {
      return require("@react-native-async-storage/async-storage").default as AsyncStorageLike;
    } catch {
      return memoryStorage;
    }
  }

  return memoryStorage;
}

export function getSyncStorage() {
  if (typeof window !== "undefined" && !isReactNativeRuntime() && window.localStorage) {
    return window.localStorage;
  }

  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    }
  };
}
