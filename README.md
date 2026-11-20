# Markov Weather Predictor

Web app that predicts future weather using a **Markov chain**. Pick today's weather, edit the
transition matrix, and see the probability of each state after **1, 3, 5 and 10 steps (days)**
as a table and two charts. Built with **Spec-Driven Development (SDD)** using **OpenSpec**,
implemented with an AI agent (Claude Code), and covered by automated tests.

## The problem

Weather with 3 states: **Sunny**, **Cloudy**, **Rainy**. Markov property: tomorrow depends only
on today. Transition matrix `P` (row = today, column = tomorrow):

| From \ To  | Sunny | Cloudy | Rainy |
|------------|:-----:|:------:|:-----:|
| **Sunny**  | 0.7   | 0.2    | 0.1   |
| **Cloudy** | 0.3   | 0.4    | 0.3   |
| **Rainy**  | 0.2   | 0.3    | 0.5   |

## The math

- Distribution after one step: `π(k+1) = π(k) · P` (row vector times matrix).
- After n steps: `π(n) = π(0) · Pⁿ`. The app computes it by repeated products and tests that it
  equals `Pⁿ` (computed by exponentiation by squaring).
- Stationary (long-run) distribution `π = π P`, found by power iteration; periodic chains are
  reported as non-convergent instead of looping forever.
- Worked example, start Sunny: step 1 = [0.70, 0.20, 0.10], step 2 = [0.57, 0.25, 0.18],
  step 3 = [0.51, 0.268, 0.222] (asserted in the tests).
- Validation: at least 3 states, square matrix, entries in [0, 1], rows sum to 1 (tolerance 1e-6).

## Run it

Requires Node 20+.

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # unit + UI tests
npm run test:coverage  # coverage report
npm run build          # type-check + production build into dist/
npm run spec:validate  # validate OpenSpec specs/changes
```

`dist/` is a static site: host it on any static host (GitHub Pages, Netlify, Vercel).

## Project structure

```
src/markov/        Pure math core (no DOM): validation, step, n-step, matrix power, stationary
src/ui/chartData.ts  Pure builders for table rows and chart datasets
src/ui/charts.ts     Chart.js rendering (bar + line)
src/ui/app.ts        DOM, events, matrix editor
tests/               Vitest: markov, chartData, ui
openspec/            SDD artifacts (see below)
docs/                SDD workflow evidence
```

## SDD with OpenSpec

The system was specified **before** writing code (see the git history: the first commit is
`docs(openspec): ...`). The change lives in `openspec/changes/markov-weather-predictor/`:

| Artifact | Purpose |
|----------|---------|
| `proposal.md` | Why, what changes, scope and out-of-scope |
| `design.md` | Decisions and trade-offs (vanilla TS, Chart.js, pure core, power iteration) |
| `specs/markov-model/spec.md` | Requirements + scenarios for the math |
| `specs/web-visualization/spec.md` | Requirements + scenarios for the UI |
| `tasks.md` | Checklist mapping tasks to requirements and test files |

Each requirement scenario has at least one test. See [docs/traceability.md](docs/traceability.md).

OpenSpec is a dev dependency, run it with `npx openspec ...` (e.g. `npx openspec list`,
`npx openspec validate --all`, `npx openspec archive markov-weather-predictor`).

## Tests

49 automated tests with Vitest + jsdom:

- `tests/markov.test.ts`: validation, one step, n-step (hand-computed value), iteration vs matrix
  power, invalid input, stationary distribution (regular and periodic chains).
- `tests/chartData.test.ts`: horizons, dataset shapes, percentages.
- `tests/ui.test.ts`: table content, initial-state change, matrix edit, error `role="alert"`,
  reset, empty input, accessibility labels (Chart.js is replaced by a port stub in jsdom; real
  rendering was checked in headless Chrome).

## AI agent usage

Implemented with Claude Code following a spec-first, test-first loop: specs, then failing tests,
then implementation, then an independent review pass. The human sets the problem, reviews the
specs and decides trade-offs.

## Git workflow

Conventional commits (`docs(openspec)`, `feat(markov)`, `feat(ui)`, `docs`, `test`, ...), spec
commit first, then core, then UI, then docs.
