//export const ALLOWED_CATEGORIES = ['theory','values','team','events','artifacts', 'roles', 'empiricism'] as const
export const ALLOWED_CATEGORIES = ['theory', 'team','events'] as const

export type Category = (typeof ALLOWED_CATEGORIES)[number]

// Praktisk runtime-guard:
export const CATEGORY_SET = new Set<string>(ALLOWED_CATEGORIES as readonly string[])
export const isCategory = (x: string): x is Category => CATEGORY_SET.has(x)