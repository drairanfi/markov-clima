## 1. Project setup
- [x] 1.1 Vite + TypeScript + Vitest + Chart.js; npm scripts (dev, build, test, test:coverage)

## 2. Markov core (spec: markov-model) — tests in `tests/markov.test.ts`
- [ ] 2.1 `validateChain` (min 3 states, square, range, row sums)
- [ ] 2.2 `step` and `distributionAfter` (n >= 0, input validation)
- [ ] 2.3 `matrixPower` and agreement test with iteration for n = 1, 3, 5, 10
- [ ] 2.4 `stationary` with convergence flag (regular and periodic chains)
- [ ] 2.5 Default weather chain + known-value test (n = 3 -> [0.51, 0.268, 0.222])

## 3. Web UI (spec: web-visualization) — tests in `tests/chartData.test.ts`, `tests/ui.test.ts`
- [ ] 3.1 Pure chart data builders (bar for 1/3/5/10, line for 0..10, stationary)
- [ ] 3.2 Page layout, initial-state select, results table
- [ ] 3.3 Chart.js rendering (bar + line)
- [ ] 3.4 Editable matrix with row sums, validation errors (role="alert"), reset button
- [ ] 3.5 Accessibility labels

## 4. Documentation and delivery
- [ ] 4.1 README (problem, model, how to run/test, OpenSpec workflow, structure)
- [ ] 4.2 `openspec validate` passes; archive change after verification
- [ ] 4.3 Git history with conventional commits; push to GitHub
