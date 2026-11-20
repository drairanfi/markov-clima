## Why

The course requires a web application that implements Markov chains to predict future
states from a transition matrix, specified with SDD/OpenSpec before coding.

## What Changes

- Add a pure Markov engine: matrix validation, vector x matrix step, n-step distribution,
  n-step transition matrix, stationary distribution.
- Model a weather problem with 3 states (Sunny, Cloudy, Rainy) and a default transition matrix.
- Add a web UI: choose initial state, see predictions for 1, 3, 5 and 10 steps, plus charts.
- Allow editing the transition matrix with validation (rows must sum to 1).
- Add automated tests (unit + UI) and documentation.

## Capabilities

### New Capabilities
- `markov-model`: matrix validation, n-step prediction, stationary distribution.
- `web-visualization`: inputs, results table, charts, matrix editor.

### Modified Capabilities
None.

## Impact

New project. No external services. Runs fully in the browser (static site).

## Out of Scope

Hidden Markov models, parameter estimation from data, persistence/backend.
