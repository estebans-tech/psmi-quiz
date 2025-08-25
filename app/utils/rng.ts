/**
 * Deterministic PRNG (Pseudo-Random Number Generator) för shuffling.
 * Implementation: mulberry32 (public domain). ENDA SYFTET: reproducibla tal i [0,1).
 * ❗ Inte kryptografiskt säker.
 *
 * VARFÖR PRNG? — För tester vill vi kunna “seeda” shufflingen och få samma ordning varje gång.
 *
 * OPERATOR-CHEATSHEET:
 *   ^    = bitvis XOR (ex: a ^ b)
 *   ^=   = “XOR-assign” (ex: a ^= b  =>  a = a ^ b)
 *   >>>  = zero-fill right shift (skjuter höger och fyller med 0; håller värdet osignerat 32-bit)
 *   Math.imul(a,b) = 32-bitars heltalsmultiplikation med overflow (precis som i C),
 *                    till skillnad från a*b som är 64-bitars flyttal i JS.
 *
 * KONSTANTER:
 *   0x6D2B79F5 = 1831565813 (hex). En “stor udda bump” som rör internt state framåt varje steg.
 */
export function mulberry32(seedInput: number | string): () => number {
  // Normalisera seed till osignerad 32-bit int
  let seed = (typeof seedInput === 'string'
    ? Number.parseInt(seedInput, 10)
    : seedInput) >>> 0;
  if (!Number.isFinite(seed)) seed = 0;

  return function next(): number {
    // 1) Flytta state framåt med en stor udda konstant
    seed = (seed + 0x6D2B79F5) >>> 0;
    let t = seed;

    // 2) Blanda bitar: XOR med skiftning, multiplicera med udda tal (t|1)
    t = Math.imul(t ^ (t >>> 15), (t | 1)) >>> 0;

    // 3) Mer blandning: XOR med (t + imul(...)) och en annan skiftning/udda faktor (|61)
    t ^= t + Math.imul(t ^ (t >>> 7), (t | 61));
    t >>>= 0; // håll osignerad 32-bit

    // 4) Sista “temperering” och normalisering till [0, 1)
    //    XOR med en sista skiftning, kasta till osignerad, dela med 2^32 (=4294967296)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher–Yates shuffle. Returnerar en NY array. Skicka in egen RNG för determinism i tester.
 */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i]!, a[j]!] = [a[j]!, a[i]!];
  }
  return a;
}
