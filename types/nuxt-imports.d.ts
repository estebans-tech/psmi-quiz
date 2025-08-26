declare module '#imports' {
    export function useStorage(ns?: string): {
      getItem<T = any>(key: string): Promise<T | undefined | null>
    }
  }