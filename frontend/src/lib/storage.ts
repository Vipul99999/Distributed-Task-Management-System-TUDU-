// Safe localStorage wrapper
export const storage = {
  set: (key: string, value: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  },

  remove: (key: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(key);
  },
};
