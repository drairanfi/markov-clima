# Requirement traceability

| Spec | Requirement | Tests |
|------|-------------|-------|
| markov-model | Transition matrix validation | `markov.test.ts` > validateChain |
| markov-model | One-step transition | `markov.test.ts` > step |
| markov-model | N-step prediction (0, 1/3/5/10, known value, iteration = power) | `markov.test.ts` > distributionAfter, matrixPower |
| markov-model | Invalid prediction input | `markov.test.ts` > distributionAfter (reject cases) |
| markov-model | Stationary distribution | `markov.test.ts` > stationary |
| web-visualization | Initial state selection | `ui.test.ts` > initial state selection |
| web-visualization | Prediction table 1/3/5/10 | `ui.test.ts` > initial render; `chartData.test.ts` > predictionRows |
| web-visualization | Charts | `chartData.test.ts` > bar/line; `ui.test.ts` (2 canvases, data passed) |
| web-visualization | Editable matrix | `ui.test.ts` > matrix editing |
| web-visualization | Accessibility basics | `ui.test.ts` > initial render |
