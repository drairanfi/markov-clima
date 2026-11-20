import { describe, it, expect, beforeEach } from 'vitest';
import { mountApp, type ChartsPort } from '../src/ui/app';
import type { BarData, LineData } from '../src/ui/chartData';

let root: HTMLElement;
let bar: BarData | undefined;
let line: LineData | undefined;
let cleared = 0;

const charts: ChartsPort = {
  update(b, l) { bar = b; line = l; },
  clear() { cleared++; },
};

const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
const cell = (i: number, j: number) => $<HTMLInputElement>(`input[data-row="${i}"][data-col="${j}"]`);
const type = (el: HTMLInputElement, v: string) => {
  el.value = v;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
  bar = line = undefined;
  cleared = 0;
  mountApp(root, charts);
});

describe('initial render', () => {
  it('shows a table with 4 rows and 3 state columns, rows summing to 100%', () => {
    const rows = root.querySelectorAll('#results tbody tr');
    expect(rows).toHaveLength(4);
    rows.forEach((tr) => {
      expect(tr.querySelectorAll('td.prob')).toHaveLength(3);
      const total = [...tr.querySelectorAll('td.prob')].reduce((a, td) => a + parseFloat(td.textContent!), 0);
      expect(total).toBeCloseTo(100, 1);
    });
  });
  it('has two chart canvases and passes data to the charts', () => {
    expect(root.querySelectorAll('canvas')).toHaveLength(2);
    expect(bar?.datasets).toHaveLength(3);
    expect(line?.labels).toHaveLength(11);
  });
  it('labels the select and every matrix input, errors use role=alert', () => {
    expect($<HTMLSelectElement>('#initial-state').labels?.length).toBeGreaterThan(0);
    root.querySelectorAll<HTMLInputElement>('input[data-row]').forEach((i) => {
      expect(i.getAttribute('aria-label')).toBeTruthy();
    });
    expect($('#errors').getAttribute('role')).toBe('alert');
  });
});

describe('initial state selection', () => {
  it('Rainy gives 50% Rainy after one step', () => {
    const sel = $<HTMLSelectElement>('#initial-state');
    sel.value = '2';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    const first = root.querySelector('#results tbody tr')!;
    expect(first.querySelectorAll('td.prob')[2].textContent).toBe('50.00%');
    expect(bar?.datasets[2].data[0]).toBeCloseTo(50, 9);
  });
});

describe('matrix editing', () => {
  it('invalid row shows an error, flags the row sum and clears results', () => {
    type(cell(0, 0), '0.9');
    expect($('#errors').textContent).toMatch(/row 1/i);
    expect($('[data-sum="0"]').classList.contains('bad')).toBe(true);
    expect(root.querySelectorAll('#results tbody tr')).toHaveLength(0);
    expect(cleared).toBeGreaterThan(0);
  });
  it('a valid edit recomputes predictions', () => {
    type(cell(0, 0), '0.8');
    type(cell(0, 1), '0.1');
    expect($('#errors').textContent).toBe('');
    const first = root.querySelector('#results tbody tr')!;
    expect(first.querySelectorAll('td.prob')[0].textContent).toBe('80.00%');
  });
  it('Reset restores the default matrix and removes the error', () => {
    type(cell(0, 0), '0.9');
    $<HTMLButtonElement>('#reset').click();
    expect($('#errors').textContent).toBe('');
    expect(cell(0, 0).value).toBe('0.7');
    expect(root.querySelectorAll('#results tbody tr')).toHaveLength(4);
  });
  it('treats an empty input as invalid, not as 0', () => {
    type(cell(1, 1), '');
    expect($('#errors').textContent).not.toBe('');
  });
});

describe('stationary distribution', () => {
  it('is displayed when valid', () => {
    expect($('#stationary').textContent).toMatch(/Sunny/);
  });
});
