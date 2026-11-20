import { describe, it, expect } from 'vitest';
import { stationaryDatasets, barChartData, lineChartData, predictionRows, formatPercent } from '../src/ui/chartData';
import { weatherChain } from '../src/markov/weather';

describe('predictionRows', () => {
  it('returns one row per horizon 1, 3, 5, 10 in order', () => {
    const rows = predictionRows(weatherChain, [1, 0, 0]);
    expect(rows.map((r) => r.steps)).toEqual([1, 3, 5, 10]);
  });
  it('each row sums to 1', () => {
    predictionRows(weatherChain, [0, 0, 1]).forEach((r) =>
      expect(r.distribution.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9),
    );
  });
});

describe('barChartData', () => {
  it('has a label per horizon and a dataset per state (percentages)', () => {
    const d = barChartData(weatherChain, [1, 0, 0]);
    expect(d.labels).toEqual(['1 step', '3 steps', '5 steps', '10 steps']);
    expect(d.datasets.map((s) => s.label)).toEqual(['Sunny', 'Cloudy', 'Rainy']);
    expect(d.datasets[0].data[0]).toBeCloseTo(70, 9); // Sunny after 1 step
    expect(d.datasets[0].data[1]).toBeCloseTo(51, 9); // Sunny after 3 steps
  });
});

describe('lineChartData', () => {
  it('has 11 labels (0..10) and one dataset per state', () => {
    const d = lineChartData(weatherChain, [1, 0, 0]);
    expect(d.labels).toHaveLength(11);
    expect(d.labels[0]).toBe(0);
    expect(d.labels[10]).toBe(10);
    expect(d.datasets).toHaveLength(3);
    expect(d.datasets[0].data[0]).toBeCloseTo(100, 9);
  });
  it('includes the stationary distribution in percent', () => {
    const d = lineChartData(weatherChain, [1, 0, 0]);
    expect(d.converged).toBe(true);
    expect(d.stationary.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 6);
  });
});

describe('formatPercent', () => {
  it('formats with 2 decimals', () => {
    expect(formatPercent(0.268)).toBe('26.80%');
    expect(formatPercent(1)).toBe('100.00%');
  });
});

describe('stationaryDatasets', () => {
  it('returns one dashed-series per state when converged', () => {
    const sets = stationaryDatasets(lineChartData(weatherChain, [1, 0, 0]));
    expect(sets).toHaveLength(3);
    expect(sets[0].data).toHaveLength(11);
    expect(sets[0].label).toBe('Long run: Sunny');
  });
  it('is empty when not converged', () => {
    const cycle = { states: ['A', 'B', 'C'], matrix: [[0, 1, 0], [0, 0, 1], [1, 0, 0]] };
    const l = lineChartData(cycle, [1, 0, 0]);
    expect(l.converged).toBe(false);
    expect(stationaryDatasets(l)).toEqual([]);
  });
  it('depends on the initial state for a reducible chain (identity)', () => {
    const id = { states: ['A', 'B', 'C'], matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };
    expect(lineChartData(id, [0, 1, 0]).stationary[1]).toBeCloseTo(100, 6);
  });
});
