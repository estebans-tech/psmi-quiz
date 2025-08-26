declare module 'nitro:assets' {
  export function readAsset(path: string): Promise<string | Buffer | null>
}

declare module 'nitro:storage' {
  // Minimal typing to satisfy TS in server context
  export function useStorage(name?: string): {
    getItem<T = unknown>(key: string): Promise<T | null>
    setItem<T = unknown>(key: string, value: T): Promise<void>
    hasItem(key: string): Promise<boolean>
    removeItem(key: string): Promise<void>
    clear(): Promise<void>
  }
}
