import type { MarkovChain } from './index';

/** Modelo del clima: clima de hoy -> clima de mañana. */
export const weatherChain: MarkovChain = {
  states: ['Soleado', 'Nublado', 'Lluvioso'],
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
