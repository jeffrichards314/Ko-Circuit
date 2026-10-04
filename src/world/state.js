// What the career and the records say about the world (spec §19 G4, G11): the conditions that data/world/ names, and the map's own memory.
//   cond(name, g)        is a named condition true for this game? ('cleared:rookie', 'carnivalUnlocked', 'unlock:jax', 'fallen', ...)
//   nodeState(g, id)     a place's marker state: 'cleared' | 'current' | 'open' | 'locked'
//   loadWorld / saveWorld  the map's memory in localStorage (`kocircuit.world`): where you stand, what has already been revealed
import { load, save } from '../save/storage.js';
import { NODES, ZONE_OPEN } from '../../data/world/index.js';
import { CIRCUITS } from '../../data/circuits.js';
import { circuitStatus, hasFallen, voidReached, rivalWon } from '../save/career.js';
import { pantheonGate } from '../save/unlocks.js';

export function cond(name, g) {
  const c = g.career, f = (c && c.flags) || {};
  if (!name || name === 'always') return true;
  if (!c) return false;
  const [k, arg] = name.split(':');
  switch (k) {
    case 'cleared': return circuitStatus(c, arg) === 'cleared';
    case 'rivalWon': return rivalWon(c, arg);
    case 'unlock': return !!(g.records && g.records.unlocks[arg]);
    case 'carnivalUnlocked': return !!f.carnivalUnlocked;
    case 'undergroundUnlocked': return !!f.undergroundUnlocked;
    case 'nightmareUnlocked': return !!f.jaxBeaten;
    case 'zeroUnlocked': return !!(f.zeroBeaten || (f.nightmareCleared && f.undergroundCleared));
    case 'zeroBeaten': return !!f.zeroBeaten;
    case 'skyOpen': return !!f.pantheonOpen; // (the Pantheon stays open after The Fall: the crossroads offers it and the Underworld both)
    case 'fallen': return hasFallen(c);
    case 'voidReached': return voidReached(c);
    case 'visited': return !!(loadWorld().visited || {})[arg]; // (a world you have been to: the map remembers)
    default: return false;
  }
}

// A marker's state on the map. Circuits and Dash's fights use the career; the modes open with the records; the gates follow their realm.
export function nodeState(g, id) {
  const c = g.career, n = NODES[id];
  if (!c || !n) return 'locked';
  if (n.kind === 'circuit' || n.kind === 'rival') return circuitStatus(c, id);
  if (n.kind === 'mode' || n.kind === 'portal' || n.kind === 'blimp') return cond(n.needs, g) ? 'open' : 'locked';
  if (id === 'skygate') {
    if (!c.flags.zeroBeaten) return 'locked';
    return pantheonGate(g.medals || { got: {} }, c).open ? (c.flags.pantheonOpen ? 'cleared' : 'open') : 'locked';
  }
  return 'open';
}

// can a map be travelled to now?
export const zoneOpen = (g, z) => cond(ZONE_OPEN[z], g);
export const inRect = (c, r, [c0, r0, c1, r1]) => c >= c0 && c <= c1 && r >= r0 && r <= r1;

// how far along a map's clouds are: the index into its fog rows for a career (main: circuits cleared, never going back, `maxMain` is
// the furthest remembered; the Ascension's maps: the circuit reached)
export function fogIndex(W, g, maxMain) {
  const F = W.fog; if (!F) return -1;
  const c = g.career || {};
  const i = F.by === 'main' ? Math.max(maxMain || 0, c.main || 0) : (c.asc || 0) - (F.from || 0);
  return Math.min(F.rows.length - 1, Math.max(0, i));
}
// the fog line in pixels for an index (a row, or for a map that goes east a column)
export const fogLine = (W, i) => (W.fog && i >= 0 ? W.fog.rows[Math.min(W.fog.rows.length - 1, i)] * 16 : null);

// ---- the map's memory
export const loadWorld = () => {
  const w = load('world', null) || {};
  return { pos: w.pos || null, seen: w.seen || null, maxMain: w.maxMain || 0, sig: w.sig || null, interior: w.interior || null, travel: w.travel || {}, fogI: w.fogI || {}, visited: w.visited || {} };
};
export const saveWorld = (w) => save('world', w);
