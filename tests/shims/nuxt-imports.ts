import { vi } from 'vitest'

// En delad mock som alla tester kan styra
export const mockGetItem = vi.fn<(key: string) => Promise<any>>()

export function useStorage(_ns?: string) {
  return {
    getItem: (key: string) => mockGetItem(key)
  }
}
