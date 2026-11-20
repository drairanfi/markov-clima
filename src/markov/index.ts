/** Pure Markov chain engine. No DOM, no charting imports. */

export interface MarkovChain {
  states: string[];
  /** matrix[i][j] = P(next = j | now = i) */
  matrix: number[][];
}

export type Distribution = number[];

export const ROW_SUM_TOLERANCE = 1e-6;
export const HORIZONS = [1, 3, 5, 10] as const;

/** Returns a list of human-readable errors. Empty list means the chain is valid. */
export function validateChain(chain: MarkovChain): string[] {
  const errors: string[] = [];
  const n = chain.states.length;

  if (n < 3) errors.push(`Minimum 3 states required (got ${n}).`);
  if (chain.matrix.length !== n || chain.matrix.some((r) => r.length !== n)) {
    errors.push(`Matrix must be square with size ${n}.`);
    return errors;
  }

  chain.matrix.forEach((row, i) => {
    let valid = true;
    row.forEach((p, j) => {
      if (!Number.isFinite(p) || p < 0 || p > 1) {
        valid = false;
        errors.push(`Cell (${i + 1}, ${j + 1}) must be a number between 0 and 1.`);
      }
    });
    if (valid) {
      const total = row.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 1) > ROW_SUM_TOLERANCE) {
        errors.push(`Row ${i + 1} (${chain.states[i]}) sums to ${total.toFixed(4)}, expected 1.`);
      }
    }
  });
  return errors;
}

export function oneHot(index: number, size: number): Distribution {
  return Array.from({ length: size }, (_, i) => (i === index ? 1 : 0));
}

/** One transition: row vector x matrix. */
export function step(dist: Distribution, matrix: number[][]): Distribution {
  return matrix[0].map((_, j) => dist.reduce((acc, p, i) => acc + p * matrix[i][j], 0));
}

function assertDistribution(dist: Distribution, size: number): void {
  if (dist.length !== size) {
    throw new Error(`Initial distribution must have ${size} entries (got ${dist.length}).`);
  }
  if (dist.some((p) => !Number.isFinite(p) || p < 0)) {
    throw new Error('Initial distribution entries must be non-negative numbers.');
  }
  if (Math.abs(dist.reduce((a, b) => a + b, 0) - 1) > ROW_SUM_TOLERANCE) {
    throw new Error('Initial distribution must sum to 1.');
  }
}

function assertSteps(n: number): void {
  if (!Number.isInteger(n) || n < 0) throw new Error('Steps must be a non-negative integer.');
}

/** Distribution after n steps by repeated vector x matrix products. */
export function distributionAfter(chain: MarkovChain, initial: Distribution, n: number): Distribution {
  assertDistribution(initial, chain.states.length);
  assertSteps(n);
  let dist = initial;
  for (let k = 0; k < n; k++) dist = step(dist, chain.matrix);
  return dist;
}

function multiply(a: number[][], b: number[][]): number[][] {
  return a.map((row) => b[0].map((_, j) => row.reduce((acc, x, k) => acc + x * b[k][j], 0)));
}

/** P^n by exponentiation by squaring. */
export function matrixPower(matrix: number[][], n: number): number[][] {
  assertSteps(n);
  let result = matrix.map((_, i) => oneHot(i, matrix.length));
  let base = matrix;
  let exp = n;
  while (exp > 0) {
    if (exp & 1) result = multiply(result, base);
    base = multiply(base, base);
    exp >>= 1;
  }
  return result;
}

export interface StationaryResult {
  distribution: Distribution;
  converged: boolean;
  iterations: number;
}

/** Long-run distribution via power iteration. Periodic chains report converged = false. */
export function stationary(
  chain: MarkovChain,
  start?: Distribution,
  tolerance = 1e-12,
  maxIterations = 10_000,
): StationaryResult {
  const size = chain.states.length;
  let dist = start ?? Array.from({ length: size }, () => 1 / size);
  assertDistribution(dist, size);
  for (let it = 1; it <= maxIterations; it++) {
    const next = step(dist, chain.matrix);
    const delta = Math.max(...next.map((p, i) => Math.abs(p - dist[i])));
    dist = next;
    if (delta < tolerance) return { distribution: dist, converged: true, iterations: it };
  }
  return { distribution: dist, converged: false, iterations: maxIterations };
}
