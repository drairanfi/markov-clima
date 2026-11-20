## Context

Static single-page app, no backend. Predictions are cheap (3x3 matrices), so everything
runs client-side on every input change.

## Goals / Non-Goals

**Goals:** correct math, testable core, clear charts, simple deploy (static files).
**Non-Goals:** server, auth, persistence, estimating matrices from data.

## Decisions

1. **Vanilla TypeScript + Vite** instead of a framework: the app has one screen; fewer
   moving parts, faster tests. Trade-off: manual DOM wiring.
2. **Chart.js** for charts: small, canvas-based, good defaults. Trade-off: canvas is
   harder to assert in tests, so chart data is built by pure functions (`src/ui/chartData.ts`)
   and tested separately from rendering.
3. **Pure core in `src/markov/`**: `validate`, `step`, `distributionAfter`, `matrixPower`,
   `stationary`. No DOM imports, so it is testable in plain Node.
4. **Two equivalent ways to predict n steps** (vector iteration and matrix power);
   tests assert they agree, which cross-checks the implementation.
5. **Stationary distribution via power iteration** with tolerance 1e-12 and an iteration
   cap; chosen over eigen-decomposition to avoid a linear-algebra dependency. Valid for
   regular chains; the cap guards against periodic ones.
6. **Float tolerance**: row sums accepted within 1e-6 so users can type 0.333/0.333/0.334.

## Data Model

```
MarkovChain { states: string[]; matrix: number[][] }   // matrix[i][j] = P(next=j | now=i)
Distribution = number[]                                  // sums to 1
```

## Risks / Trade-offs

- Periodic chains do not converge: `stationary` returns `converged: false`.
- Canvas rendering is not covered by unit tests; covered by data-builder tests + UI smoke test.
