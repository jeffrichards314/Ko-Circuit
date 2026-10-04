// Scouting reports (knowledge spec K5), saved to localStorage only (`kocircuit.scouting`,
// never in a password): fighter id -> the entries revealed so far ('x:<exploit id>',
// 'a:<anti-strategy id>'). An entry is revealed the first time the player triggers the
// exploit, or the anti-strategy fires on them, in any mode but the dev tools.
//
// Reward (the scouting side of §16): a circuit whose every fighter is fully scouted
// unlocks EXPLOIT VIEW for that circuit in Practice (his exploit windows flash green).
import { load, save } from './storage.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS } from '../../data/circuits.js';
import { scoutEntries } from '../fight/knowledge.js';

export function loadScouting() { return load('scouting', null) || {}; }
export const saveScouting = (S) => save('scouting', S);

// The Fight's opts.scouting: add() returns true only the first time (and saves).
export function scoutStore(S) {
  return {
    has: (id, key) => !!(S[id] && S[id].includes(key)),
    add(id, key) {
      const L = (S[id] ||= []);
      if (L.includes(key)) return false;
      L.push(key);
      saveScouting(S);
      return true;
    },
  };
}

// { got, total } for a fighter. A Title Defense remix has a report of its own (its exploits and anti-strategies are new): pass the
// remixed fighter as `d` and it is kept under his `scoutId` ("gus.td").
export function scoutProgress(S, id, d0 = null) {
  const d = d0 || FIGHTERS[id];
  if (!d) return { got: 0, total: 0 };
  const keys = scoutEntries(d).map((e) => e.key), have = S[d.scoutId || id] || [];
  return { got: keys.filter((k) => have.includes(k)).length, total: keys.length };
}
export const isScouted = (S, id, key) => !!(S[id] && S[id].includes(key));

// Every fighter in the circuit who has a report is fully scouted (and there is one)
export function circuitScouted(S, circuit) {
  const C = CIRCUITS[circuit];
  if (!C) return false;
  const withReport = C.fighters.filter((id) => scoutProgress(S, id).total > 0);
  return withReport.length > 0 && withReport.every((id) => { const p = scoutProgress(S, id); return p.got >= p.total; });
}
// The circuits with a scouting reward to earn (any fighter with a report)
export const SCOUT_CIRCUITS = Object.keys(CIRCUITS).filter((c) => !c.startsWith('rival') && CIRCUITS[c].fighters.some((id) => FIGHTERS[id] && scoutEntries(FIGHTERS[id]).length));
