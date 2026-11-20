import { Chart, BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
import type { BarData, LineData } from './chartData';
import type { ChartsPort } from './app';

Chart.register(BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

const COLORS = ['#f59e0b', '#64748b', '#2563eb', '#10b981', '#ec4899', '#8b5cf6'];

const yScale = { min: 0, max: 100, title: { display: true, text: 'Probability (%)' } };

export function createCharts(barCanvas: HTMLCanvasElement, lineCanvas: HTMLCanvasElement): ChartsPort {
  let bar: Chart | undefined;
  let line: Chart | undefined;

  return {
    update(b: BarData, l: LineData) {
      bar?.destroy();
      line?.destroy();
      bar = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: b.labels,
          datasets: b.datasets.map((s, i) => ({ label: s.label, data: s.data, backgroundColor: COLORS[i % COLORS.length] })),
        },
        options: { responsive: true, scales: { y: yScale }, plugins: { title: { display: false } } },
      });
      const stationaryLines = l.converged
        ? l.datasets.map((s, i) => ({
            label: `Long run: ${s.label}`,
            data: l.labels.map(() => l.stationary[i]),
            borderColor: COLORS[i % COLORS.length],
            borderDash: [6, 4],
            borderWidth: 1,
            pointRadius: 0,
          }))
        : [];
      line = new Chart(lineCanvas, {
        type: 'line',
        data: {
          labels: l.labels,
          datasets: [
            ...l.datasets.map((s, i) => ({
              label: s.label,
              data: s.data,
              borderColor: COLORS[i % COLORS.length],
              backgroundColor: COLORS[i % COLORS.length],
              tension: 0.2,
            })),
            ...stationaryLines,
          ],
        },
        options: {
          responsive: true,
          scales: { y: yScale, x: { title: { display: true, text: 'Steps (days)' } } },
        },
      });
    },
    clear() {
      bar?.destroy();
      line?.destroy();
      bar = line = undefined;
    },
  };
}
