import { ROW_SUM_TOLERANCE, oneHot, stationary, validateChain, type MarkovChain } from '../markov';
import { cloneChain, weatherChain } from '../markov/weather';
import { barChartData, formatPercent, lineChartData, predictionRows, type BarData, type LineData } from './chartData';

/** Port so tests can run without a real canvas. */
export interface ChartsPort {
  update(bar: BarData, line: LineData): void;
  clear(): void;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function mountApp(root: HTMLElement, charts?: ChartsPort | ((bar: HTMLCanvasElement, line: HTMLCanvasElement) => ChartsPort)): void {
  const chain: MarkovChain = cloneChain(weatherChain);
  let initialIndex = 0;
  const n = chain.states.length;

  root.innerHTML = `
    <header>
      <h1>Weather Forecast with Markov Chains</h1>
      <p>Tomorrow's weather depends only on today's. Edit the transition matrix and see how probabilities evolve.</p>
    </header>
    <section aria-labelledby="h-setup">
      <h2 id="h-setup">1. Today's weather</h2>
      <label for="initial-state">Initial state</label>
      <select id="initial-state">${chain.states.map((s, i) => `<option value="${i}">${esc(s)}</option>`).join('')}</select>
    </section>
    <section aria-labelledby="h-matrix">
      <h2 id="h-matrix">2. Transition matrix</h2>
      <p class="hint">Row = today, column = tomorrow. Each row must sum to 1.</p>
      <table id="matrix">
        <thead><tr><th scope="col">From \\ To</th>${chain.states.map((s) => `<th scope="col">${esc(s)}</th>`).join('')}<th scope="col">Row sum</th></tr></thead>
        <tbody>${chain.states
          .map(
            (from, i) => `<tr><th scope="row">${esc(from)}</th>${chain.states
              .map(
                (to, j) => `<td><input type="number" step="0.01" min="0" max="1" data-row="${i}" data-col="${j}" aria-label="Probability from ${esc(from)} to ${esc(to)}" /></td>`,
              )
              .join('')}<td data-sum="${i}" class="sum"></td></tr>`,
          )
          .join('')}</tbody>
      </table>
      <button id="reset" type="button">Reset matrix</button>
      <div id="errors" role="alert"></div>
    </section>
    <section aria-labelledby="h-results">
      <h2 id="h-results">3. Predictions</h2>
      <table id="results">
        <thead><tr><th scope="col">Steps</th>${chain.states.map((s) => `<th scope="col">${esc(s)}</th>`).join('')}</tr></thead>
        <tbody></tbody>
      </table>
      <p id="stationary"></p>
    </section>
    <section aria-labelledby="h-charts">
      <h2 id="h-charts">4. Charts</h2>
      <div class="charts">
        <figure><canvas id="bar-chart" role="img" aria-label="Bar chart of probabilities after 1, 3, 5 and 10 steps"></canvas></figure>
        <figure><canvas id="line-chart" role="img" aria-label="Line chart of probabilities from step 0 to 10"></canvas></figure>
      </div>
    </section>`;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const barCanvas = q<HTMLCanvasElement>('#bar-chart');
  const lineCanvas = q<HTMLCanvasElement>('#line-chart');
  const port: ChartsPort | undefined = typeof charts === 'function' ? charts(barCanvas, lineCanvas) : charts;
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[data-row]')];
  const errorsEl = q<HTMLDivElement>('#errors');
  const tbody = q<HTMLTableSectionElement>('#results tbody');
  const stationaryEl = q<HTMLParagraphElement>('#stationary');
  const select = q<HTMLSelectElement>('#initial-state');

  const fillInputs = () => inputs.forEach((el) => (el.value = String(chain.matrix[+el.dataset.row!][+el.dataset.col!])));

  /** Reads inputs into the chain. Empty or non-numeric input becomes NaN so validation rejects it. */
  const readInputs = () =>
    inputs.forEach((el) => {
      chain.matrix[+el.dataset.row!][+el.dataset.col!] = el.value.trim() === '' ? NaN : Number(el.value);
    });

  function refresh(): void {
    readInputs();
    const errors = validateChain(chain);

    chain.matrix.forEach((row, i) => {
      const cellEl = q<HTMLElement>(`[data-sum="${i}"]`);
      const total = row.reduce((a, b) => a + b, 0);
      cellEl.textContent = Number.isFinite(total) ? total.toFixed(3) : '—';
      cellEl.classList.toggle('bad', !Number.isFinite(total) || Math.abs(total - 1) > ROW_SUM_TOLERANCE);
    });

    errorsEl.innerHTML = errors.map((e) => `<p>${esc(e)}</p>`).join('');
    if (errors.length > 0) {
      tbody.innerHTML = '';
      stationaryEl.textContent = '';
      port?.clear();
      return;
    }

    const initial = oneHot(initialIndex, n);
    tbody.innerHTML = predictionRows(chain, initial)
      .map(
        (r) => `<tr><th scope="row">${r.steps}</th>${r.distribution.map((p) => `<td class="prob">${formatPercent(p)}</td>`).join('')}</tr>`,
      )
      .join('');

    const st = stationary(chain);
    stationaryEl.textContent = st.converged
      ? `Long-run distribution: ${chain.states.map((s, i) => `${s} ${formatPercent(st.distribution[i])}`).join(', ')}.`
      : 'This chain does not converge to a single long-run distribution (it is periodic).';

    port?.update(barChartData(chain, initial), lineChartData(chain, initial));
  }

  select.addEventListener('change', () => {
    initialIndex = Number(select.value);
    refresh();
  });
  inputs.forEach((el) => el.addEventListener('input', refresh));
  q<HTMLButtonElement>('#reset').addEventListener('click', () => {
    chain.matrix = cloneChain(weatherChain).matrix;
    fillInputs();
    refresh();
  });

  fillInputs();
  refresh();
}
