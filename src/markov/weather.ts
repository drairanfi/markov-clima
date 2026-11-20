import type { MarkovChain } from './index';

/** Weather model: today's weather -> tomorrow's weather. */
export const weatherChain: MarkovChain = {
  states: ['Sunny', 'Cloudy', 'Rainy'],
  matrix: [
    [0.7, 0.2, 0.1],
    [0.3, 0.4, 0.3],
    [0.2, 0.3, 0.5],
  ],
};

export const cloneChain = (c: MarkovChain): MarkovChain => ({
  states: [...c.states],
  matrix: c.matrix.map((r) => [...r]),
});
