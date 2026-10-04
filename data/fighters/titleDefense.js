// Title Defense (§6): five divisions (data/divisions.js). The champions and bosses come back
// remixed, easiest to hardest in story order, each with one attack of his own that only
// exists here (`exclusive`, below).
//
// A remix is the `titleDefense` block in the champion's own data file:
//   nickname, quote, lines          the new intro card / results lines
//   tell: 0.8                       every windup (the tell) scales by this; counter,
//                                   star and perfect-hit windows scale with it
//   keep: ['moveId']                moves left at their own speed
//   costume: { A: {...}, B: {...} } palette overrides for an alternate costume
//                                   (registered as the palette '<id>.td'); new costume
//                                   pieces live in the sprite layers' `remix` block
//                                   (data/sprites/remix.js)
//   stats: { ... }                  merged over his stats
//   moves: { id: {...} }            1-2 new moves, written at his normal speed
//                                   (they're scaled like the rest)
//   patterns: [ ... ]               new patterns, tried before his old ones (on a
//                                   fixed-loop circuit that means they take over
//                                   wherever their `when` matches)
//   exclusive: ({ hit, fin, call }) => spec   his one Title Defense-only super (data/fighters/remixes/exclusive.js)
//   exploits / antiStrategies / scriptedMoments   the remix's own knowledge layer (K3/K4): they REPLACE the original fight's, so the
//                                   remix is a new puzzle, not a faster one (data/fighters/remixes/*.js, written with remixes/kit.js).
//                                   His scouting report is kept apart from the original's (`scoutId` "<id>.td").
//   stateTriggers: [ ... ]          replaces his state triggers (kept when absent)
// Recoveries (the punish windows) and `call` moves (shouts, countdowns, spins)
// keep their timing: a remix is faster to read, not harder to punish.
import { FIGHTERS, onRetune } from './index.js';
import { scaleMove, TWEAKS } from '../difficulty.js';
import { stripSteps, standInOf, addSuper, supersOf, chainsOf } from './super.js';
import { CIRCUITS } from '../circuits.js';
import { DIVISIONS, DIVISION_NAMES } from '../divisions.js';
import { PALETTES, swapPalette, ensureRemixPalette } from '../palette.js';
import { makePalette } from '../../src/engine/palette.js';
import { FIGHTER_LAYERS } from '../sprites/index.js';
import { finishKnowledge } from './remixes/kit.js';
import { quickestPunch } from '../../src/fight/opponentAI.js';
import { buildExclusive, helpers as exclusiveHelpers } from './remixes/exclusive.js';

// The five defenses (spec §6), one per division (data/divisions.js). Classic: the 12 circuit champions, Jax, the first ZERO. Pantheon: the
// seven champions of the climb, Barney Ascended, Halcyon. Underworld: the six champions below, Vorgath. Void: the twelve Hollowed, Dash
// Unbound and ZERO's true form (all of them fought as bosses here). Combined: every one of them, in story order.
export const CLASSIC_DEFENSE = ['gus', 'brody', 'mcbride', 'midnight', 'rex', 'baron', 'maestro', 'avalanche', 'mirror', 'karver', 'warden', 'eclipse', 'jax', 'zero'];
export const PANTHEON_DEFENSE = ['aurora', 'cirrus', 'oldguard', 'nebula', 'hale', 'prism', 'rho', 'barney2', 'halcyon'];
export const UNDERWORLD_DEFENSE = ['moros', 'soot', 'jailer', 'fkarver', 'crucible', 'herald', 'vorgath'];
export const HOLLOWED = ['dodgeShard', 'blockShard', 'duckShard', 'counterShard', 'sightShard', 'soundShard', 'rhythmShard', 'memoryShard', 'echoShard', 'chaosShard', 'timeShard', 'willShard'];
export const VOID_DEFENSE = [...HOLLOWED, 'dash9', 'zeroTrue'];
export const COMBINED_DEFENSE = [...CLASSIC_DEFENSE, ...PANTHEON_DEFENSE, ...UNDERWORLD_DEFENSE, ...VOID_DEFENSE];
export const TITLE_DEFENSE = CLASSIC_DEFENSE; // (the tools' name for the first list)
export const TD_LISTS = { classic: CLASSIC_DEFENSE, pantheon: PANTHEON_DEFENSE, underworld: UNDERWORLD_DEFENSE, void: VOID_DEFENSE, combined: COMBINED_DEFENSE };
export const TD_NAMES = DIVISION_NAMES;
// the division a champion's remix belongs to (never Combined)
export const tdDivisionOf = (id) => DIVISIONS.find((d) => d !== 'combined' && TD_LISTS[d].includes(id)) || null;

// A windup scaled by k, its windows scaled with it. A perfect-hit window never
// moves earlier than JAB_IMPACT + 1 (you have to be able to see the glint and
// press), unless it already started earlier (Jax's storm uppercut).
function quicken(m, k, minW) {
  if (m.call || k >= 1) return m;
  const w0 = m.windupFrames;
  const w = Math.max(Math.min(w0, minW), Math.round(w0 * k));
  if (w >= w0) return m;
  const r = w / w0;
  const sc = (win) => {
    if (!win) return win;
    const lo = Math.max(Math.min(win[0], 2), Math.round(win[0] * r));
    return [lo, Math.max(lo, Math.min(w - 1, Math.round(win[1] * r)))];
  };
  const cw = sc(m.counterWindow);
  let kd = m.kdWindow;
  if (kd && m.goldenHit) {
    // a super's golden moment keeps its width and stays inside the quicker windup (it has nothing to do with the counter window)
    const len = Math.min(kd[1] - kd[0], w - 1);
    const a = Math.max(0, Math.min(w - 1 - len, Math.round(kd[0] * r)));
    kd = [a, a + len];
  } else if (kd) {
    const len = kd[1] - kd[0];
    const lo = Math.max(Math.min(kd[0], 5), Math.round(kd[0] * r));
    kd = [lo, Math.min(w - 1, lo + len)];
    if (cw) { kd[0] = Math.max(kd[0], cw[0]); kd[1] = Math.min(kd[1], cw[1]); }
    if (kd[1] < kd[0]) kd = m.kdWindow; // (never shrink one away: the perfect-hit rule)
  }
  const A = m.animation;
  return {
    ...m, windupFrames: w, counterWindow: cw, starWindow: sc(m.starWindow), kdWindow: kd,
    animation: { ...A, windupRate: A.windupRate && Math.max(2, Math.round(A.windupRate * r)), windupHold: A.windupHold && Math.round(A.windupHold * r) },
  };
}

const cache = {};
// a retune (the fight lab's difficulty sliders) rebuilds the remixes from the new numbers
onRetune(() => { for (const k of Object.keys(cache)) delete cache[k]; });
export function remixed(id) {
  if (cache[id]) return cache[id];
  const d = FIGHTERS[id], T = d && d.titleDefense;
  if (!T) return d;
  const c = CIRCUITS[d.circuit];
  // (a windup never drops below 3 frames, and a circuit whose tells are 4 or more keeps every windup at 4 or more: a 3-frame tell after a 4-frame
  // circuit is unanswerable for a player who is still in his own jab, which the perfect-play bot's sloppy pass proves)
  const minW = Math.max(c.tellWindow >= 4 ? 4 : 3, Math.round(c.tellWindow * 0.6));
  const keep = new Set(T.keep || []);
  const moves = {};
  // (his remix's new moves are authored at his authored timings: they go on the curve with the same factor as the rest, data/difficulty.js)
  const k0 = (d.difficulty && d.difficulty.k) || 1, newMoves = Object.fromEntries(Object.entries(T.moves || {}).map(([k, m]) => [k, scaleMove(m, k0, d.difficulty ? d.difficulty.starW : 1)]));
  for (const [k, m0] of Object.entries({ ...d.moves, ...newMoves })) {
    // a remix's new moves keep no perfect hit of their own: the golden chance stays on the super
    let m = m0;
    if (newMoves[k] && m.kdWindow && !(d.super && k === d.super.move)) { const { kdWindow, ...rest } = m; m = rest; }
    moves[k] = keep.has(k) ? m : quicken(m, T.tell ?? 0.8, minW);
  }
  // THE EXCLUSIVE ATTACK (spec §6): one more super that only exists in Title Defense (data/fighters/remixes/exclusive.js). Its moves are authored
  // at his normal speed and go through the same curve as his other new moves (the golden window as wide as his other golden moments), are
  // armed as a super (armor from the step back, one golden moment, a knockdown), and are made as quick as the rest of the remix.
  let superList = supersOf(d);
  // (its blows are made from his own, the remix's new ones too: they are read before the remix makes them quicker, the exclusive gets quickened with them)
  const dSrc = { ...d, moves: { ...d.moves, ...newMoves } };
  const E = typeof T.exclusive === 'function' ? buildExclusive(dSrc, T.exclusive(exclusiveHelpers(dSrc))) : T.exclusive;
  if (E) {
    const goldW = d.difficulty ? d.difficulty.goldW : 8, starW = d.difficulty ? d.difficulty.starW : 1;
    const authored = Object.fromEntries(Object.entries(E.moves).map(([key, m]) => {
      const o = scaleMove(m, 1, starW, null, goldW);
      // (the golden frames are authored as a start: they get the width of his other golden moments)
      if (o.kdWindow) o.kdWindow = [o.kdWindow[0], Math.min(o.windupFrames - 1, o.kdWindow[0] + goldW - 1)];
      if (o.recoveryKd) o.recoveryKd = [o.recoveryKd[0], o.recoveryKd[0] + goldW - 1];
      return [key, o];
    }));
    const own = supersOf(d).find((S) => !S.inline) || d.super || {};
    const times = E.super.times || T.supersPerRound || own.times || [1, 2];
    const S0 = { ...E.super, times, ...(E.super.window && ['taunt', 'advance', 'recovery'].includes(E.super.golden) ? { window: [E.super.window[0], E.super.window[0] + goldW - 1] } : {}) };
    const withX = addSuper({ ...d, moves, superList }, S0, authored);
    const X = withX.superList[withX.superList.length - 1];
    for (const chain of chainsOf(X)) for (const id of [...chain, chain[0] + '*']) withX.moves[id] = keep.has(id) ? withX.moves[id] : quicken(withX.moves[id], T.tell ?? 0.8, minW);
    Object.assign(moves, withX.moves);
    superList = withX.superList;
  }
  // the costume: a palette swap, plus (when his sprite layers have a `remix`
  // block, data/sprites/remix.js) new pieces in `<id>.td` layers with extra colours
  let palette = d.palette, spriteLayers = d.spriteLayers;
  const L = T.costume === 'shift' ? null : FIGHTER_LAYERS[d.spriteLayers + '.td']; // (a recoloured remix never wears the classic champion's extra costume pieces: Fallen Karver shares King Karver's layers)
  const extra = (L && L.remix.colors) || {};
  if (T.costume === 'shift') palette = ensureRemixPalette(d.palette, T.costumeDeg ?? null); // (a fighter with no costume of his own: his colours turned)
  else if (T.costume || L) {
    palette = `${d.palette}.td`;
    const base = PALETTES[d.palette], C = T.costume || {};
    const pal = (p, sw, ex, name) => {
      const s = sw ? swapPalette(name, p, sw) : p;
      return ex ? makePalette(name, { ...s.spec, ...ex }) : s;
    };
    PALETTES[palette] = { A: pal(base.A, C.A, extra.A, palette), B: base.B && pal(base.B, C.B, extra.B, palette + 'B') };
  }
  if (L) spriteLayers = d.spriteLayers + '.td';
  // the remix's own knowledge layer: the original fight's exploits, anti-strategies and moments are replaced, and the trainer stops
  // describing exploits that are gone (his corner hints are the remix's own: data/hints/remixes.js)
  const K = T.exploits || T.antiStrategies || T.scriptedMoments ? finishKnowledge(T, moves) : null;
  cache[id] = {
    ...d,
    ...(K ? { exploits: K.exploits, antiStrategies: K.antiStrategies, scriptedMoments: K.scriptedMoments, scoutId: `${id}.td` } : {}),
    ...(T.stateTriggers ? { stateTriggers: T.stateTriggers } : {}),
    remix: true,
    // (the Hollowed fight as bosses here: boss knowledge, boss supers a round; their golden moments stay knockdowns: they have no phases for a stun to protect)
    ...(T.boss ? { tdBoss: true } : {}),
    // (his guard counter is the original fight's: a new or quickened move must not become the answer to a masher's jabs)
    guardCounter: d.guardCounter !== undefined ? d.guardCounter : quickestPunch(d.moves),
    nickname: T.nickname || d.nickname,
    card: { ...d.card, quote: T.quote || d.card.quote, record: T.record || d.card.record },
    lines: { ...(d.lines || {}), ...(T.lines || {}) },
    palette, spriteLayers,
    stats: { ...d.stats, ...(T.stats || {}), ...(TWEAKS[id] && TWEAKS[id].tdHealth ? { health: Math.round(d.stats.health * TWEAKS[id].tdHealth) } : {}) }, // (TWEAKS tdHealth: the defense's own health factor, data/difficulty.js)
    moves, superList,
    patterns: [...(T.patterns || []).map((p) => ({ ...p, steps: stripSteps(p.steps, d.super, d.super && standInOf(d, d.super)) })), ...d.patterns],
  };
  return cache[id];
}
