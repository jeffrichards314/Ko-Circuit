// Dash Maddox's file on you (knowledge spec K3, the Dash rows of K6): after every fight
// against him (any of his four versions, any mode but the dev tools) the strategy you
// leaned on most is saved to localStorage (`kocircuit.rivalrecord`, never in a password),
// and the next Dash opens with the answer to it (the `grudge` anti-strategy).
//   { key: 'turtle' | 'jab' | ..., score, fight: 'dash2' }   (key 'none': nothing stood out)
import { load, save } from './storage.js';

export const loadRivalRecord = () => load('rivalrecord', null);

// The Fight's opts.rivalRecord: get() the last record (the fight reads it once, at its
// start), put() the one this fight just made (the fight calls it when it ends).
export function rivalStore() {
  return {
    get: () => loadRivalRecord(),
    put: (rec) => save('rivalrecord', rec),
  };
}
