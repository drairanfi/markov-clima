import { HORIZONS, distributionAfter, stationary, type Distribution, type MarkovChain } from '../markov';

export interface PredictionRow {
  steps: number;
  distribution: Distribution;
}
export interface Series {
  label: string;
  data: number[];
}
export interface BarData {
  labels: string[];
  datasets: Series[];
}
export interface LineData {
  labels: number[];
  datasets: Series[];
  stationary: number[];
  converged: boolean;
}

const pct = (d: Distribution) => d.map((p) => p * 100);

export function predictionRows(chain: MarkovChain, initial: Distribution): PredictionRow[] {
  return HORIZONS.map((steps) => ({ steps, distribution: distributionAfter(chain, initial, steps) }));
}

export function formatPercent(p: number): string {
  return `${(p * 100).toFixed(2)}%`;
}

/** Grouped bars: x = horizon, one series per state (values in percent). */
export function barChartData(chain: MarkovChain, initial: Distribution): BarData {
  const rows = predictionRows(chain, initial);
  return {
    labels: rows.map((r) => `${r.steps} ${r.steps === 1 ? 'paso' : 'pasos'}`),
    datasets: chain.states.map((label, i) => ({ label, data: rows.map((r) => r.distribution[i] * 100) })),
  };
}

/** Lines: x = steps 0..maxSteps, one series per state (values in percent). */
export function lineChartData(chain: MarkovChain, initial: Distribution, maxSteps = 10): LineData {
  const labels = Array.from({ length: maxSteps + 1 }, (_, k) => k);
  const byStep = labels.map((k) => pct(distributionAfter(chain, initial, k)));
  const st = stationary(chain, initial);
  return {
    labels,
    datasets: chain.states.map((label, i) => ({ label, data: byStep.map((d) => d[i]) })),
    stationary: pct(st.distribution),
    converged: st.converged,
  };
}

/** Dashed horizontal "long run" series; empty when the chain did not converge. */
export function stationaryDatasets(l: LineData): Series[] {
  if (!l.converged) return [];
  return l.datasets.map((s, i) => ({
    label: `Largo plazo: ${s.label}`,
    data: l.labels.map(() => l.stationary[i]),
  }));
}
