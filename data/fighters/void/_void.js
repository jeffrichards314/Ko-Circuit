// Builders for the Hollowed (Phase E, spec §18 A6): the Void's 3-frame tells, and long fixed patterns (30+ moves).
//   vm(kind, o)          an ordinary punch at the Void's tell (jabs, hooks and body blows 3f; the uppercut, sweep and haymaker keep the kit's own)
//   only(list, m)        restrict a move to some defenses (the shards test one skill each)
//   longSteps({...})     a deterministic long pattern from a seed: which moves, in which gaps, with an opening every so often
import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

export { superMove, stats, anims, steps };
export const W = 3;

export function vm(kind, o = {}) {
  const m = mv(kind, W, o);
  if (['hook', 'hookL', 'body', 'bodyR'].includes(kind) && o.windupFrames === undefined) {
    m.windupFrames = W;
    if (o.counterWindow === undefined) m.counterWindow = [2, 2];
    if (o.starWindow === undefined) m.starWindow = null;
  }
  return m;
}
// the defenses a move may be avoided with (a shard's own skill test)
export const only = (list, m) => ({ ...m, avoidBy: list });

// A small seeded generator so a pattern is the same every run (and every fight: the Memory Shard's whole point).
export const rng = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// longSteps({ seed, moves: [ids] or [[id, weight]], count, gaps: [lo, hi], rest: { every, steps: [...] }, first, after: (prev, next) => min gap })
// Returns a step list of `count` moves; after every `every` moves the `rest` steps (an opening, a breather) go in.
export function longSteps({ seed, moves, count = 32, gaps = [14, 30], rest = null, first = 30, after = null, last = 40 }) {
  const R = rng(seed);
  const pool = moves.map((m) => (Array.isArray(m) ? m : [m, 1]));
  const total = pool.reduce((a, [, w]) => a + w, 0);
  const pick = () => { let r = R() * total; for (const [id, w] of pool) { r -= w; if (r <= 0) return id; } return pool[0][0]; };
  const out = [{ idle: first }];
  let prev = null;
  for (let i = 0; i < count; i++) {
    let id = pick();
    if (id === prev && R() < 0.5) id = pick();
    const gap = Math.round(gaps[0] + R() * (gaps[1] - gaps[0]));
    if (prev !== null) out.push({ idle: Math.max(gap, after ? after(prev, id) : 0) });
    out.push({ move: id });
    prev = id;
    if (rest && (i + 1) % rest.every === 0 && i + 1 < count) out.push(...rest.steps.map((s) => ({ ...s })));
  }
  out.push({ idle: last });
  if (rest && rest.end) out.push(...rest.end.map((s) => ({ ...s })));
  return out;
}
