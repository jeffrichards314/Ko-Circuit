// The cornerman's memory (localStorage only, `kocircuit.corner`; never in a password): per opponent (his scouting id, so a
// Title Defense remix has its own), how many times he has beaten you and the last hints you heard against him. The corner
// reads it to make his hints a little clearer after each loss (spec §4 "Between rounds") and to not repeat himself.
import { load, save } from './storage.js';

export function loadCornerLog() { return load('corner', null) || {}; }
export const saveCornerLog = (C) => save('corner', C);
const MAX_LAST = 4;

// The Fight's opts.corner: losses (read), lost() (after a loss), heard() (a hint was given), recent() (the last ones given)
export function cornerStore(C = loadCornerLog()) {
  const row = (id) => (C[id] ||= { losses: 0, last: [] });
  return {
    losses: (id) => (C[id] ? C[id].losses : 0),
    lost(id) { row(id).losses++; saveCornerLog(C); },
    heard(id, key) { const R = row(id); R.last = [...R.last.filter((k) => k !== key), key].slice(-MAX_LAST); saveCornerLog(C); },
    recent: (id) => (C[id] ? C[id].last : []),
  };
}
// a store that keeps nothing (the dev tools)
