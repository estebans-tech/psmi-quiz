declare module 'nitro:assets' {
  export function readAsset(path: string): Promise<string | Buffer | null>
}
