import { describe, it, expect } from 'vitest';
import {
  validateChain,
  step,
  distributionAfter,
  matrixPower,
  stationary,
  oneHot,
  type MarkovChain,
} from '../src/markov';
import { weatherChain } from '../src/markov/weather';

const TOL = 9;
const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);

describe('validateChain', () => {
  it('accepts the default weather chain', () => {
    expect(validateChain(weatherChain)).toEqual([]);
  });

  it('rejects a row that does not sum to 1 and names the row', () => {
    const bad: MarkovChain = {
      states: ['A', 'B', 'C'],
      matrix: [[0.5, 0.4, 0], [0.3, 0.4, 0.3], [0.2, 0.3, 0.5]],
    };
    const errors = validateChain(bad);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/row 1/i);
  });

  it('rejects fewer than 3 states', () => {
    const two: MarkovChain = { states: ['A', 'B'], matrix: [[0.5, 0.5], [0.5, 0.5]] };
    expect(validateChain(two).join(' ')).toMatch(/minimum 3 states/i);
  });

  it('rejects entries outside [0, 1] and names the cell', () => {
    const bad: MarkovChain = {
      states: ['A', 'B', 'C'],
      matrix: [[1.2, -0.2, 0], [0.3, 0.4, 0.3], [0.2, 0.3, 0.5]],
    };
    const errors = validateChain(bad).join(' ');
    expect(errors).toMatch(/cell \(1, 1\)/i);
    expect(errors).toMatch(/cell \(1, 2\)/i);
  });

  it('rejects a non-square matrix', () => {
    const bad: MarkovChain = { states: ['A', 'B', 'C'], matrix: [[1, 0, 0], [0, 1, 0]] };
    expect(validateChain(bad).join(' ')).toMatch(/square/i);
  });

  it('rejects NaN entries', () => {
    const bad: MarkovChain = {
      states: ['A', 'B', 'C'],
      matrix: [[NaN, 0.5, 0.5], [0.3, 0.4, 0.3], [0.2, 0.3, 0.5]],
    };
    expect(validateChain(bad).length).toBeGreaterThan(0);
  });

  it('tolerates tiny float error (0.333/0.333/0.334)', () => {
    const ok: MarkovChain = {
      states: ['A', 'B', 'C'],
      matrix: [[0.333, 0.333, 0.334], [0.3, 0.4, 0.3], [0.2, 0.3, 0.5]],
    };
    expect(validateChain(ok)).toEqual([]);
  });
});

describe('step', () => {
  it('starting Sunny equals the first matrix row', () => {
    const next = step([1, 0, 0], weatherChain.matrix);
    [0.7, 0.2, 0.1].forEach((x, i) => expect(next[i]).toBeCloseTo(x, TOL));
  });
});

describe('distributionAfter', () => {
  const start = oneHot(0, 3);

  it('n = 0 returns the initial distribution', () => {
    expect(distributionAfter(weatherChain, start, 0)).toEqual(start);
  });

  it('matches the hand-computed value for n = 3 starting Sunny', () => {
    const d = distributionAfter(weatherChain, start, 3);
    [0.51, 0.268, 0.222].forEach((x, i) => expect(d[i]).toBeCloseTo(x, TOL));
  });

  it.each([1, 3, 5, 10])('sums to 1 for n = %i', (n) => {
    for (let s = 0; s < 3; s++) {
      expect(sum(distributionAfter(weatherChain, oneHot(s, 3), n))).toBeCloseTo(1, TOL);
    }
  });

  it.each([1, 3, 5, 10])('vector iteration equals matrix power for n = %i', (n) => {
    const viaPower = matrixPower(weatherChain.matrix, n)[0];
    const viaSteps = distributionAfter(weatherChain, start, n);
    viaPower.forEach((x, i) => expect(viaSteps[i]).toBeCloseTo(x, TOL));
  });

  it('works with a mixed initial distribution', () => {
    const d = distributionAfter(weatherChain, [0.5, 0.5, 0], 1);
    expect(d[0]).toBeCloseTo(0.5 * 0.7 + 0.5 * 0.3, TOL);
  });

  it('rejects wrong length', () => {
    expect(() => distributionAfter(weatherChain, [1, 0], 1)).toThrow();
  });
  it('rejects negative entries', () => {
    expect(() => distributionAfter(weatherChain, [1.5, -0.5, 0], 1)).toThrow();
  });
  it('rejects a vector that does not sum to 1', () => {
    expect(() => distributionAfter(weatherChain, [0.5, 0.2, 0.1], 1)).toThrow();
  });
  it('rejects negative n', () => {
    expect(() => distributionAfter(weatherChain, start, -1)).toThrow();
  });
  it('rejects non-integer n', () => {
    expect(() => distributionAfter(weatherChain, start, 1.5)).toThrow();
  });
});

describe('matrixPower', () => {
  it('P^0 is the identity', () => {
    expect(matrixPower(weatherChain.matrix, 0)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  });
  it('every row of P^n sums to 1', () => {
    matrixPower(weatherChain.matrix, 10).forEach((row) => expect(sum(row)).toBeCloseTo(1, TOL));
  });
});

describe('stationary', () => {
  it('default chain converges to pi with pi P = pi', () => {
    const { distribution, converged } = stationary(weatherChain);
    expect(converged).toBe(true);
    expect(sum(distribution)).toBeCloseTo(1, TOL);
    const next = step(distribution, weatherChain.matrix);
    next.forEach((x, i) => expect(x).toBeCloseTo(distribution[i], TOL));
  });

  it('reports converged = false for a periodic 3-cycle', () => {
    const cycle: MarkovChain = {
      states: ['A', 'B', 'C'],
      matrix: [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    };
    expect(stationary(cycle, [1, 0, 0]).converged).toBe(false);
  });
});
