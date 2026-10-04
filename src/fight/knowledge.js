// The knowledge layer (knowledge spec K1-K7): what a fighter does that a player
// can learn. Every opponent's data file may carry:
//
//   exploits[]        hidden ways to make the fight easier (a trigger and an effect)
//   antiStrategies[]  what he does to shut down a playstyle (watches the behavior tracker)
//   scriptedMoments[] set events by clock or health, the same every fight
//   stateTriggers[]   his behavior changing with the fight (a hit streak, a knockdown)
//   (moves: unblockable / undodgeable / wrongDefensePenalty / defenseCost: see the Fight)
//
// The OpponentAI builds one Knowledge per fight (only for a fighter that has any of
// the above) and calls into it at its step boundaries, moves, punches and hooks.
// Everything here is data-driven; the vocabulary:
//
// EXPLOITS  { id, type, name, trigger, effect, hint: { kind, text }, scout, limit }
//   type     one of EXPLOIT_TYPES (K3's table)
//   trigger  { on: 'punch' (default) | 'resolved' | 'getUp' | 'passive', ... }
//     punch:    state ('windup' | 'open' | ... or a list: his state before the punch),
//               move (id or list), frames [a, b] (moveT in a move, t in anything else),
//               open (the open step's id or anim), side 'L'|'R', height 'high'|'low',
//               star (true/false), counter: true (only a counter in his tell), lands: true
//               (only a punch that would land anyway), after 'dodged'|'ducked' (his move's
//               result, in its recovery), health [a, b], flag / notFlag (a switch set by
//               another exploit), since: { event, frames: [a, b] } (frames after a
//               Fight.event), test (a named predicate in TESTS), count (fires on the nth match),
//               first: true (the first hit of an open step), clean: n (no other punch in
//               the last n frames: a precise shot, never a masher's lucky one)
//     resolved: his punch just met the player: move, result ('dodged' | 'ducked' |
//               'blocked' | 'hit'), dir ('L' | 'R': the side the player slipped to), health
//     getUp:    he just got up off the canvas
//     passive:  frames: the player hasn't thrown a punch in this long (he's in his stance)
//     blockStreak: n: the player has blocked n times in a row (nothing else in between)
//   ...and on a punch trigger, mark: { name, frames: [a, b] } (frames after a state trigger's
//   `mark`: Dash's trash talk after he lands a hit)
//   effect   what happens: open: { frames, anim, comboLimit, star } (a free-hit window;
//            the triggering hit counts as its first), stun: frames + hits (a counter-style
//            stun with that many hits), knockdown: true, star: true, cancel: n (skip his
//            next n pattern steps), extendOpen: n + max (a longer open step), flag: name
//            (+ until: 'round'), mod: { key: add } (numbers on his modifier state), say,
//            sfx, script: [steps] (thrown next), tag: true (the other twin tags in),
//            wheel: slice set (the prize wheel)
//   limit    most times per fight (default: no limit)
//
// ANTI-STRATEGIES { id, type, name, scout, mild, override, ...params } (type: ANTI_TYPES;
//   each type's handler below reads its own params)
//
// SCRIPTED MOMENTS { id, name, when: { left: s } (game-clock seconds left, every round; with
//   round: n, only that round) | { health: h } (once, the first time he's below it), steps:
//   [...] (queued ahead of his pattern), patterns: 'set' (from now on only his patterns with
//   `script: 'set'`), say, mod, flag (a fight-long switch the moment it runs) }
//
// STATE TRIGGERS { id, on: 'hitStreak' (n) | 'knockdown' | 'playerDown' | 'landed' (one of his
//   punches just landed on the player), do: { enrage: frames, speed, recovery } | { steps } |
//   { patterns } | { mark: name }, say, once: 'round' | 'fight', cooldown: frames }
//
// The cornerman's hints about each exploit live in data/hints/ (src/fight/cornerman.js); a `hint.hidden` exploit is still
// hinted at there, but only its scouting report says what it is.
//
// Scouting (K5): the first time an exploit fires, or an anti-strategy fires on the player,
// its entry is revealed (Fight opts.scouting) and "SCOUTED!" pops up.

import { PT } from './player.js';
import { supersOf, superKey, superIds, goldenScout } from '../../data/fighters/super.js';
import { PUNCH_DAMAGE } from './scoring.js';
import { EARLY_LEAD, isEarly } from './behavior.js';
import { drawTextBig, drawText, textWidth } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { panel } from './hud.js';

export const EXPLOIT_TYPES = ['instantKd', 'patternBreak', 'starTrigger', 'stunTrigger', 'guardBreak', 'bait', 'tauntWindow', 'quirk', 'environment'];
export const ANTI_TYPES = ['jabSpam', 'turtling', 'earlyDodge', 'dodgeBias', 'starHoard', 'zoneBias', 'passivity', 'rushing', 'comboRepeat', 'getUpMash', 'grudge', 'adapt'];
export const HINT_KINDS = ['trainer', 'visual', 'audio', 'quote'];
export const hasKnowledge = (d) => !!(supersOf(d).length || (d.exploits && d.exploits.length) || (d.antiStrategies && d.antiStrategies.length) || (d.scriptedMoments && d.scriptedMoments.length) || (d.stateTriggers && d.stateTriggers.length));
// The entries a scouting report lists (K5): his supers' golden moments, exploits, then anti-strategies.
export const scoutEntries = (d) => [
  ...supersOf(d).map((S) => ({ key: 's:' + superKey(S), kind: 'golden', e: { id: superKey(S), name: superName(S, d), scout: goldenScout(S, d) } })),
  ...(d.phases || []).map((P, i) => ({ key: 'p:' + (i + 1), kind: 'phase', e: { id: 'phase' + (i + 1), name: P.name, scout: P.scout } })),
  ...(d.exploits || []).map((x) => ({ key: 'x:' + x.id, kind: 'exploit', e: x })), ...(d.antiStrategies || []).map((a) => ({ key: 'a:' + a.id, kind: 'anti', e: a }))];
export const superName = (S, d) => S.name || ((d.moves[superIds(S)[0]] || {}).name || 'SUPER').replace(/ \(\d\)$/, '');

const OPENING = new Set(['counter', 'punish', 'taunt', 'open', 'more']);
const QUEUE_STATES = ['idle', 'block']; // (never mid-super: taunts only come before a super)
const RUSH_STATES = ['idle', 'block', 'windup', 'vanish', 'evade'];
const asList = (v) => (v == null ? null : Array.isArray(v) ? v : [v]);
const inRange = (v, w) => !w || (v >= w[0] && v <= w[1]);

// Gimmick-specific checks exploits can name (trigger.test)
const TESTS = {
  // Pidge: the punch lands on the down-bob (the beat), read off the onBeat clock
  bobDown(k) {
    const B = k.ai.mods.beat;
    if (!B) return false;
    const x = k.f.clock / B.fpb; // (Pidge's bob runs on the frame clock)
    return x - Math.floor(x) < 0.25;
  },
  // DJ Drop: a counter on the beat his cue sound drops on (within 3 frames)
  onCue(k) {
    const m = k.ai.move;
    return !!(m && m.cueFrame !== undefined && Math.abs(k.ai.moveT - m.cueFrame) <= 3);
  },
  // Gambini: the glove on the side he's coming back in from, as he slides back in
  tpSide(k, p) {
    const ai = k.ai;
    return (p.side === 'R' ? 1 : -1) === ai.mods.tpSide;
  },
  // Bolt: a punch while he's still crackling (the flash came, his shoulder hasn't dropped yet)
  crackling(k) { const m = k.ai.move; return !!(k.ai.state === 'windup' && m && m.bolt && k.ai.moveT < (m.boltHold || 0)); },
  // Strongman: a counter into the punch his flex powered up
  charged(k) { return !!(k.ai.move && k.ai.move.charged); },
  // The Ascension (spec §18): gimmick-specific checks
  // Brother Ember: the ring is blazing (his lantern's LIGHT at its highest)
  lightFull(k) { return (k.ai.mods.light || 0) >= 0.9; },
  // Oro: his shield is down
  shieldDown(k) { return k.ai.mods.shield === false; },
  // Cirrus Crown: the lightning round's flash is on (only then is he lit)
  stormFlash(k) { return (k.ai.mods.flashT || 0) > 0; },
  // Phase B (spec §18): gimmick-specific checks
  // Orbit: both orbs stand on one line (twice a lap: his front is bare)
  aligned(k) { const M = k.ai.mods, m = k.ai.modifiers.find((x) => x.cfg.type === 'orbit'); return !!m && ((M.ph % m.cfg.period) < 6 || Math.abs((M.ph % m.cfg.period) - m.cfg.period / 2) < 6); },
  // Spark: he's crackling (charged)
  sparkCharged(k) { return (k.ai.mods.charged || 0) > 0; },
  // The Doubt: the word in his speech box is a lie
  lying(k) { return !!k.ai.mods.lie && k.ai.state === 'windup'; },
  // Halcyon: which form he's in (one per round)
  noonForm(k) { return (k.f.formOverride || k.f.stage || k.f.round) === 2; },
  duskForm(k) { return (k.f.formOverride || k.f.stage || k.f.round) === 3; },
  // Hale: the fists are white-hot
  whiteHot(k) { return (k.ai.mods.stage || 0) >= 3; },
  // Phase C (spec §18): the Underworld
  // Queen Soot: a wall of fire is burning
  wallUp(k) { return !!k.ai.mods.wall; },
  // Rattle, Lament: the tell he's making is a fake
  fakeTell(k) { return !!(k.ai.move && k.ai.move.fake); },
  // Phase E (spec §18): the Void
  // Memory Shard: the long pause after the 30th move of his sequence
  midPause(k) { const ai = k.ai; return !!ai.steps && !!ai.pattern && ai.steps.slice(0, ai.stepIdx).filter((s) => s.move).length === 30 && ai.wait > 20; },
  // Phase D (spec §18): the lower Underworld
  // Crucible: he is overheating (the whiteout)
  overheating(k) { return (k.ai.mods.hotT || 0) > 0; },
  // Grasp: a hand is rising (the canvas is cracking under a spot)
  handUp(k) { return (k.ai.mods.strikes || []).some((s) => s.state === 'tell'); },
};

// ---------------------------------------------------------------------------
// Anti-strategy handlers, one per type (params come from the data entry `a`).
// Each may define: update, punch (before his modifiers: return a replacement result),
// postPunch (after), modifyMove, moveStart, moveResolved, feintEnd, nextStep,
// roundStart, playerUp, on (a Fight.event), active (for the lab readout).
const ANTI = {
  // Jab spam: the Nth punch in a row that isn't part of an opening gets parried and answered.
  jabSpam: {
    punch(k, a, st, p, r) {
      if (p.star || (r.result === 'hit' && OPENING.has(r.chain)) || r.knockdown || k.ai.punch.stunned) return null;
      const B = k.f.behavior, n = (B.t - B.jab.at <= (a.gap || 40) ? B.jab.n : 0) + 1;
      if (n < (a.streak || 3) && !k.forcedAnti(a)) return null;
      k.fire(a, a.say || 'PARRIED!');
      k.f.sfx('parry');
      if (!k.pending) k.queue(asList(a.counter), a.delay || 0);
      return { result: 'blocked', parried: true, anti: a.id };
    },
    active(k, a) { return k.f.behavior.jab.n + 1 >= (a.streak || 3); },
  },

  // Turtling: blocking too much of the recent past. Responses: 'unblockable' (listed
  // moves lose the block), 'move' (he throws a guard-breaker), 'drain' (hearts drip while you block).
  turtling: {
    isOn(k, a, st) { return k.forcedAnti(a) || k.f.behavior.blockShare(a.span || 480) >= (a.share || 0.4); },
    update(k, a, st) {
      st.on = this.isOn(k, a, st);
      if (a.response === 'drain' && st.on && k.f.player.state === 'block' && k.f.phase === 'fight' && k.f.clock % (a.every || 40) === 0) {
        k.f.loseHearts(1); if (!st.fired) { st.fired = true; k.fire(a, a.say); }
      }
    },
    nextStep(k, a, st) {
      if (a.response !== 'move' || !st.on || k.f.clock < (st.next || 0)) return null;
      st.next = k.f.clock + (a.cooldown || 600);
      k.fire(a, a.say);
      return { move: a.move };
    },
    modifyMove(k, a, st, m) {
      if (a.response !== 'unblockable' || !st.on || !(a.moves || []).includes(m.id) || !m.avoidBy.includes('block') || m.avoidBy.length < 2) return m;
      return { ...m, avoidBy: m.avoidBy.filter((x) => x !== 'block'), unblockable: true, cue: a.cue || 'NO BLOCK!', antiId: a.id };
    },
    moveStart(k, a, st, m) { if (m.antiId === a.id) k.fire(a, a.say); },
    active(k, a, st) { return !!st.on; },
  },

  // Early dodging: 'hold' (the listed punch waits so it lands as the dodge runs out;
  // `dark`: only while the lights are out) or 'convert' (a listed feint turns into `into`).
  earlyDodge: {
    update(k, a, st) {
      const f = k.f, P = f.player, ai = k.ai;
      if (f.phase !== 'fight') return;
      if (a.dark && !(ai.mods.dark > 0)) return;
      if (P.state === 'dodge' && P.t === 0 && ((k.forcedAnti(a) && !a.hidden) || isEarly(ai, a.lead || EARLY_LEAD))) {
        st.dodgeAt = f.clock;
        if (a.response === 'convert' && ai.state === 'windup' && (a.moves || []).includes(ai.moveId)) st.convert = ai.move;
      }
      if (a.response !== 'hold' || P.state !== 'dodge' || P.dodgeSuccess || st.dodgeAt == null || f.clock - st.dodgeAt > PT.DODGE_TOTAL) return;
      if (ai.state !== 'windup' || !(a.moves || []).includes(ai.moveId) || st.held === ai.move) return;
      const m = ai.move, impact = P.t + (m.windupFrames - ai.moveT) - 1; // the dodge's own frame it lands on (this tick's moveT++ is still to come)
      if (impact > PT.DODGE_TOTAL) return;              // the slip is over first: time to slip it again
      st.held = m;
      // it would have been slipped: he holds it until the slip runs out (if it already
      // lands on the tail of the slip, the early dodge is punished as it is)
      if (impact <= PT.DODGE_AVOID[1]) m.windupFrames += PT.DODGE_TOTAL - 3 - impact;
      k.fire(a, a.say);
    },
    feintEnd(k, a, st, m) {
      if (a.response !== 'convert' || st.convert !== m) return false;
      st.convert = null;
      const P = k.f.player, into = asList(a.into);
      k.ai.beginMove(into[0], { forced: true });
      k.ai.forced.unshift(...into.slice(1));
      // land it right as the early slip runs out
      const mv = k.ai.move;
      if (mv && P.state === 'dodge' && !P.dodgeSuccess) {
        const w = Math.max(a.minWindup || 10, PT.DODGE_TOTAL - 3 - P.t);
        if (w < mv.windupFrames) { const d = w - mv.windupFrames; mv.windupFrames = w; if (mv.counterWindow) mv.counterWindow = mv.counterWindow.map((v) => Math.max(0, Math.min(w - 1, v + d))); mv.starWindow = null; }
      }
      k.fire(a, a.say);
      return true;
    },
    active(k, a, st) { return st.dodgeAt != null && k.f.clock - st.dodgeAt <= PT.DODGE_TOTAL; },
  },

  // Always dodging one way: the listed hooks come from the side you keep slipping to
  // (his left hook if you slip left: slip right instead). The tell pose shows the side.
  dodgeBias: {
    side(k, a) { return k.f.behavior.dodgeBias(a.min || 6, a.share || 0.75) || (k.forcedAnti(a) ? 'L' : null); },
    modifyMove(k, a, st, m) {
      if (!(a.moves || []).includes(m.id) || !m.avoidBy.includes('dodgeL') || !m.avoidBy.includes('dodgeR')) return m;
      if (a.light && k.ai.mods.dark > 0) return m; // in the dark only his eyes show: no side to read
      const side = this.side(k, a);
      if (!side) return m;
      const L = side === 'L', rest = m.avoidBy.filter((x) => !x.startsWith('dodge'));
      const pose = L ? 'hookL' : 'hook';
      return {
        ...m, avoidBy: [L ? 'dodgeR' : 'dodgeL', ...rest], antiId: a.id, name: `${m.name} (${L ? 'LEFT' : 'RIGHT'})`,
        animation: { ...m.animation, windup: [pose + 'Tell'], active: [pose], recovery: [pose + 'Tell', 'idle1'], windupHold: 0 },
      };
    },
    moveStart(k, a, st, m) { if (m.antiId === a.id) k.fire(a, a.say); },
    active(k, a) { return !!this.side(k, a); },
  },

  // Star hoarding: sit on 3 stars too long and his listed punches steal one (landed or blocked).
  starHoard: {
    moveResolved(k, a, st, m, res) {
      const P = k.f.player, hoard = k.forcedAnti(a) || k.f.behavior.hoardFrames() >= (a.hold || 480);
      if (!hoard || !(a.on || ['hit', 'blocked']).includes(res) || (a.moves && !a.moves.includes(m.id)) || P.stars < 3) return;
      P.stars--;
      k.f.sfx('starLost');
      k.f.effects.push({ kind: 'lostStar', x: 20, y: 26, t: 0, life: 40 });
      k.fire(a, a.say || 'STAR STOLEN!');
    },
    active(k, a) { return k.f.behavior.hoardFrames() >= (a.hold || 480); },
  },

  // Head-only / body-only: he guards the zone you keep hitting. mode 'streak' (N in a
  // row: for `frames`, or until you land one on the other zone) or 'round' (the zone you
  // hit most last round, guarded all of the next). Counters and stuns still get through.
  zoneBias: {
    punch(k, a, st, p, r, S) {
      const zone = p.star ? null : p.high ? 'head' : 'body', f = k.f;
      if (!zone) return null;
      if (!st.guard && k.forcedAnti(a)) st.guard = { zone: a.zone || zone, until: f.clock + (a.frames || 480) };
      if (st.guard && f.clock > st.guard.until) st.guard = null;
      if (!st.guard && a.mode !== 'round') {
        const Z = f.behavior.zone, n = (Z.zone === zone ? Z.n : 0) + 1;
        if (n >= (a.streak || 5) && (!a.zone || a.zone === zone) && r.result === 'hit' && r.chain !== 'counter') {
          st.guard = { zone, until: f.clock + (a.frames || 480) };
          k.fire(a, a.raise || `GUARDING THE ${zone.toUpperCase()}!`); // (it fires the moment the guard goes up: you learn it then)
          return null; // this one still lands: the guard comes up after it
        }
      }
      if (!st.guard) return null;
      if (zone !== st.guard.zone) { if (r.result === 'hit' && a.mode !== 'round') st.guard = null; return null; }
      if (r.result !== 'hit' || r.chain === 'counter' || r.knockdown || k.ai.punch.stunned || S === 'open') return null;
      k.fire(a, a.say || `GUARDING THE ${zone.toUpperCase()}!`);
      return { result: 'blocked', guarded: true, anti: a.id };
    },
    postPunch(k, a, st, p, r) {
      if (a.mode === 'round' && r.result === 'hit' && !p.star) { st.count ||= { head: 0, body: 0 }; st.count[p.high ? 'head' : 'body']++; }
    },
    roundStart(k, a, st) {
      if (a.mode !== 'round') return;
      const c = st.count || { head: 0, body: 0 }, n = c.head + c.body;
      st.count = { head: 0, body: 0 };
      st.guard = null;
      if (n >= (a.min || 6)) for (const z of ['head', 'body']) if (c[z] / n >= (a.share || 0.7)) { st.guard = { zone: z, until: Infinity }; k.fire(a, a.raise || `GUARDING THE ${z.toUpperCase()} THIS ROUND!`); }
    },
    active(k, a, st) { return !!(st.guard && k.f.clock <= st.guard.until); },
  },

  // Passivity: standing around waiting. 'snack' (he steps in a quick `step` of his own:
  // Gus's bite, which is also an opening), 'cheer' (his crowd meter fills `mult` times faster)
  // or 'buff' (a pride meter fills while you wait: his punches hit `dmg` harder and recover
  // `rec` quicker at full, never with a shorter tell; any punch of yours drains it) or 'calm' (the Monk:
  // the `stillwater` modifier meditates and fills the CALM meter, this entry is its scouting line and its HUD badge).
  passivity: {
    isOn(k, a) { return k.forcedAnti(a) || k.f.behavior.passiveFrames() >= (a.frames || 300); },
    update(k, a, st) {
      const on = this.isOn(k, a) && k.f.phase === 'fight';
      if (a.response === 'buff') {
        const p = st.pride || 0;
        st.pride = Math.max(0, Math.min(1, p + (on ? (a.gain || 1 / 600) : -(a.decay || 1 / 240))));
        if (st.pride > 0.3 && !st.said) { st.said = true; k.fire(a, a.say); }
        if (st.pride < 0.05) st.said = false;
      }
      if (a.response === 'calm') {
        const c = (k.ai.mods.sw && k.ai.mods.sw.calm) || 0;
        if (c > 0.3 && !st.said && k.f.phase === 'fight') { st.said = true; k.fire(a, a.say); }
        if (c < 0.05) st.said = false;
      }
      if (a.response === 'cheer' && on) {
        const cm = k.ai.modifiers.find((m) => m.cfg.type === 'crowdMeter');
        if (cm && k.ai.mods.cheer < 1) {
          k.ai.mods.cheer = Math.min(1, k.ai.mods.cheer + cm.cfg.rate * ((a.mult || 3) - 1));
          if (!st.was) k.fire(a, a.say);
        }
      }
      st.was = on;
    },
    modifyMove(k, a, st, m) {
      if (a.response !== 'buff' || !(st.pride > 0.05) || m.call || m.feint || !m.damage) return m;
      return { ...m, damage: Math.round(m.damage * (1 + (a.dmg || 0.3) * st.pride)), recoveryFrames: Math.round(m.recoveryFrames * (1 - (a.rec || 0.2) * st.pride)) };
    },
    badge(k, a, st) {
      if (a.response === 'calm') { const c = (k.ai.mods.sw && k.ai.mods.sw.calm) || 0; return c > 0.05 ? { text: a.meter || 'CALM', frac: c } : null; }
      return a.response === 'buff' && st.pride > 0.05 ? { text: a.meter || 'PRIDE', frac: st.pride } : null;
    },
    nextStep(k, a, st) {
      if (a.response !== 'snack' || !this.isOn(k, a) || (st.round || 0) >= (a.limit || 1) || k.skipOpen(a.step)) return null;
      st.round = (st.round || 0) + 1;
      k.fire(a, a.say);
      return { ...a.step };
    },
    roundStart(k, a, st) { st.round = 0; },
    active(k, a, st) { return a.response === 'calm' ? ((k.ai.mods.sw && k.ai.mods.sw.calm) || 0) > 0.3 : a.response === 'buff' ? st.pride > 0.3 : this.isOn(k, a); },
  },

  // Rushing: punching into his guard (or at thin air) again and again. The `count`th such
  // punch within `span` frames is answered at once with `counter` (instead of his
  // ordinary guard counter).
  rushing: {
    postPunch(k, a, st, p, r, S) {
      if (r.far || r.exploit || r.anti || r.result === 'hit' || !RUSH_STATES.includes(S)) return;
      const n = k.f.behavior.rush(a.span || 150) + 1;
      if ((n < (a.count || 2) && !k.forcedAnti(a)) || k.pending) return;
      k.ai.guardQ = null; k.ai.guardHits = 0;
      k.queue(asList(a.counter), a.delay || 0);
      k.fire(a, a.say);
    },
    active(k, a) { return k.f.behavior.rush(a.span || 150) + 1 >= (a.count || 2); },
  },

  // Repeating combos. builtIn: the fighter's own modifier does it (Knox's comboReader: the
  // '!read' event marks it); otherwise the same 2+ punch combo twice in a row is caught and
  // answered with `counter`.
  comboRepeat: {
    on(k, a, st, name) { if (a.builtIn && name === a.builtIn) k.fire(a, a.say); },
    punch(k, a, st, p, r) {
      if (a.builtIn) return null;
      const f = k.f, now = f.clock, key = p.star ? 'S' : p.side + (p.high ? 'H' : 'B');
      if (!st.cur || now - st.at > (a.gap || 45)) { st.prev = st.cur && st.cur.length >= 2 ? st.cur : st.prev; st.cur = []; }
      st.at = now; st.cur.push(key);
      if (p.star || k.ai.punch.stunned || !['idle', 'recovery', 'block', 'hit', 'taunt'].includes(k.ai.punch.state)) return null;
      if (r.result === 'hit' && OPENING.has(r.chain) && r.chain !== 'more') return null;
      const i = st.cur.length - 1;
      const again = st.prev && i >= 1 && i < st.prev.length && st.cur.every((x, n) => x === st.prev[n]);
      if (!again && !k.forcedAnti(a)) return null;
      st.cur = []; st.prev = null;
      k.f.sfx('aha');
      if (!k.pending) k.queue(asList(a.counter), a.delay || 0); // (`delay`: frames he waits before the answer, so a fast answer doesn't land on a player still recovering from his own combo)
      k.fire(a, a.say);
      return { result: 'blocked', read: true, anti: a.id };
    },
  },

  // Dash's file on you (a.answers: recorded strategy -> the anti-strategy that answers it).
  // At the bell he says so, and for the first `span` frames of the fight the answer to what
  // you leaned on most last time is switched on the way the lab's force toggle does: it acts
  // at the first chance instead of waiting for the habit. `demo` is the lab's stand-in.
  grudge: {
    update(k, a, st) {
      const f = k.f;
      if (f.phase !== 'fight') return;
      const rec = f.grudge && f.grudge.key !== 'none' ? f.grudge.key : null;
      const key = (rec && a.answers[rec] ? rec : null) || (k.forcedAnti(a) ? a.demo || 'turtle' : null);
      st.key = key;
      const id = key ? `${a.id}:${key}` : null;
      const live = !!id && (k.forcedAnti(a) || f.behavior.t <= (a.span || 1500));
      if (live && !st.said) { st.said = true; k.note(a, a.say); k.banner(a.say, 'pink', 110); }
      if (live && id && !k.force.antis.has(id)) { k.force.antis.add(id); st.added = id; }
      if (!live && st.added) { k.force.antis.delete(st.added); st.added = null; }
    },
    active(k, a, st) { return !!st.added; },
  },

  // ZERO's true form (K6): he adapts to your two most-used behaviours. Every second (once the fight is 20 seconds old) the two styles you lean on most
  // (BehaviorTracker.ranking) switch on the answer to each, from a.answers, for as long as you keep leaning on them; the lab forces one by opts.adaptForce.
  adapt: {
    update(k, a, st) {
      const f = k.f;
      if (f.phase !== 'fight') return;
      const force = f.opts.adaptForce || (k.forcedAnti(a) ? a.demo || 'turtle' : null);
      if (!force && (f.behavior.t < (a.after ?? 1200) || f.clock % 60 !== 0)) return;
      const top = force ? [force] : f.behavior.ranking().filter((x) => a.answers[x]).slice(0, 2);
      st.top = top;
      for (const key of Object.keys(a.answers)) {
        const id = `${a.id}:${key}`, on = top.includes(key);
        if (on && !k.force.antis.has(id)) { k.force.antis.add(id); st.added = (st.added || []).concat(id); if (!st.said) { st.said = true; k.note(a, a.say); k.banner(a.say, 'pink', 110); } }
        else if (!on && k.force.antis.has(id) && (st.added || []).includes(id)) { k.force.antis.delete(id); st.added = st.added.filter((x) => x !== id); }
      }
    },
    active(k, a, st) { return !!(st.added && st.added.length); },
  },

  // Relying on the get-up mash: when you mash back up, 'harder' (his next `punches` hit
  // `mult` harder) or 'moves' (he goes straight into `moves`).
  getUpMash: {
    playerUp(k, a, st) {
      if (a.response === 'moves') k.queue(asList(a.moves), 20);
      else st.harder = a.punches || 3;
      k.fire(a, a.say);
    },
    modifyMove(k, a, st, m) {
      if (!(st.harder > 0) || m.feint || m.call) return m;
      st.harder--;
      return { ...m, damage: Math.round(m.damage * (a.mult || 1.3)), name: m.name + ' (+)' };
    },
    active(k, a, st) { return st.harder > 0; },
  },
};

// ---------------------------------------------------------------------------
export class Knowledge {
  constructor(ai) {
    const d = ai.d;
    this.ai = ai;
    this.f = ai.fight;
    this.id = d.scoutId || d.id;
    this.exploits = d.exploits || [];
    this.antis = (d.antiStrategies || []).filter((a) => ANTI[a.type]);
    this.moments = d.scriptedMoments || [];
    this.triggers = d.stateTriggers || [];
    this.flags = {};        // switches exploits set for the fight (hatOff, cracked...)
    this.roundFlags = {};   // ...or for the round
    this.fired = {};        // exploit id -> times it fired; also match counts
    this.counts = {};
    this.st = {};           // anti id -> its runtime state
    this.events = {};       // Fight.event name -> clock it last happened
    this.script = [];       // queued scripted steps
    this.late = [];         // steps that wait for the end of his combo (a landed punch's trash talk)
    this.pending = null;    // { moves, delay }: an anti-strategy's answer, waiting for his stance
    this.patternSet = null; // a scripted moment's pattern set
    this.moment = {};       // moment id -> round it last ran ('fight' ones: true)
    this.hitRun = 0;        // player hits landed in a row (state triggers)
    this.enraged = 0;
    this.banners = [];
    this.log = [];          // fight lab: [{ t, kind, id, text }]
    this.force = { exploits: new Set(), antis: new Set() }; // fight lab toggles
    // Dash's answers to the strategy on file: full anti-strategies of their own, kept out of the
    // scouting report (they report as the grudge that switched them on)
    this.answers = [];
    for (const a of this.antis) {
      if (a.type !== 'grudge' && a.type !== 'adapt') continue;
      for (const [key, def] of Object.entries(a.answers || {})) {
        if (ANTI[def.type]) this.answers.push({ ...def, id: `${a.id}:${key}`, name: a.name, grudge: a.id, hidden: true });
      }
    }
    for (const a of [...this.antis, ...this.answers]) this.st[a.id] = {};
    this.marks = {};        // state trigger `mark`s -> the clock they were set
    this.stateAt = {};      // state trigger id -> the clock it last fired (cooldowns)
  }

  forcedAnti(a) { return this.force.antis.has(a.id); }
  // the anti-strategies acting now: his own, and Dash's answers to the strategy on file while they're switched on
  get live() { return this.answers.length ? [...this.antis, ...this.answers.filter((a) => this.force.antis.has(a.id))] : this.antis; }
  flag(name) { return !!(this.flags[name] || this.roundFlags[name]); }

  // --- bookkeeping --------------------------------------------------------------
  note(e, text, kind = 'anti') { this.log.push({ t: this.f.clock, round: this.f.round, kind, id: e.id, text: text || e.name }); if (this.log.length > 60) this.log.shift(); }
  // an exploit's or anti-strategy's call-out ("SLIPPED ON HIS BUCKET!"): no longer shown in the fight (spec §4: the only
  // in-fight pop-up is SCOUTED!); it stays in the lab's log, and the cornerman talks about it between rounds
  banner(text) { void text; }
  // a boss's phase reached (its scouting entry, spec §4)
  phaseStart(n) { const P = (this.ai.d.phases || [])[n - 1]; if (P) this.reveal('p:' + n, P.name); }
  // a super's golden moment, landed for the first time
  scoutGolden(S) { this.reveal('s:' + superKey(S), superName(S, this.ai.d)); this.roundFound = (this.roundFound || 0) + 1; if (this.f.roundLog) (this.f.roundLog.golden ||= []).push(superKey(S)); }
  reveal(key, name) {
    const S = this.f.opts.scouting;
    if (!S || !S.add(this.id, key)) return;
    this.banners.push({ text: 'SCOUTED!', sub: name, col: 'green', t: 0, life: 100, y: 44 });
    this.f.sfx('star');
  }
  fire(a, say) {
    this.note(a, say || a.name, 'anti');
    const RL = this.f.roundLog;
    if (RL && !RL.antis.includes(a)) RL.antis.push(a);
    this.reveal('a:' + (a.grudge || a.id), a.name);
    if (say) this.banner(say, 'pink');
    if (this.f.track) this.f.track.cue('!anti:' + a.id);
  }
  exploitFired(x) {
    this.fired[x.id] = (this.fired[x.id] || 0) + 1;
    this.note(x, x.name, 'exploit');
    this.reveal('x:' + x.id, x.name);
    if (this.f.track) this.f.track.cue('!exploit:' + x.id);
  }
  // an anti-strategy's answer: thrown as soon as he's back in his stance
  queue(moves, delay = 0) { if (moves && moves.length) this.pending = { moves: moves.slice(), delay }; }

  // --- the executor calls these ---------------------------------------------------
  update() {
    const f = this.f, ai = this.ai;
    for (const b of this.banners) b.t++;
    this.banners = this.banners.filter((b) => b.t < b.life);
    if (f.phase !== 'fight') return;
    if (this.enraged > 0) this.enraged--;
    for (const a of this.live) { const h = ANTI[a.type]; if (h.update) h.update(k(this), a, this.st[a.id]); }
    // an anti-strategy's answer
    const P = this.pending;
    if (P && QUEUE_STATES.includes(ai.state) && !ai.forced.length && !ai.superTaunt) {
      if (P.delay > 0) P.delay--;
      else { this.pending = null; ai.beginMove(P.moves[0], { forced: true }); ai.forced.push(...P.moves.slice(1)); }
    }
    // passive-player exploits (bait): he takes the bait while in his stance
    for (const x of this.exploits) {
      const T = x.trigger;
      if (T.on !== 'passive' || !this.canFire(x) || ai.state !== 'idle') continue;
      if (f.behavior.passiveFrames() >= T.frames || this.force.exploits.has(x.id)) {
        if (this.passiveDone === f.behavior.lastPunch) continue; // once per quiet spell
        this.passiveDone = f.behavior.lastPunch;
        this.exploitFired(x); this.after(x);
      }
    }
    // a run of blocks (the Mirror copies you): he takes the bait while in his stance
    for (const x of this.exploits) {
      const T = x.trigger;
      if (T.on !== 'blockStreak' || !this.canFire(x) || !['idle', 'block'].includes(ai.state)) continue;
      if (f.behavior.blockStreak >= (T.n || 5) || this.force.exploits.has(x.id)) {
        f.behavior.blockStreak = 0;
        this.exploitFired(x); this.after(x);
      }
    }
    // scripted moments by the clock (every round, or just `round`) or by health (once)
    const left = f.clockFrames / f.FRAMES_PER_SEC;
    for (const s of this.moments) {
      const W = s.when || {};
      if (W.left != null && (!W.round || W.round === (f.stageLock || (f.bout && f.bout.staging === 'phase' ? f.stage : f.round))) && left <= W.left && this.moment[s.id] !== f.round && !this.due) { this.moment[s.id] = f.round; this.due = s; }
      if (W.health != null && ai.healthFrac() <= W.health && !this.moment[s.id] && !this.due) { this.moment[s.id] = true; this.due = s; }
    }
  }

  // His next step, ahead of his pattern and super (after forced moves): a queued
  // scripted step, a due moment, or an anti-strategy's own step.
  nextStep(atBreak = true) {
    const ai = this.ai;
    if (this.script.length) return this.shiftScript();
    if (!atBreak || this.f.phase !== 'fight') return null; // never splits one of his combos
    if (this.late.length) { this.script.push(...this.late); this.late = []; return this.shiftScript(); }
    if (this.due) {
      const s = this.due; this.due = null;
      this.note(s, s.say || s.name, 'moment');
      if (s.say) this.banner(s.say, 'cyan', 90);
      if (s.flag) this.flags[s.flag] = true;
      if (s.patterns) { this.patternSet = s.patterns; ai.pattern = null; }
      if (s.mod) Object.assign(ai.mods, s.mod);
      if (s.steps) this.script.push(...s.steps.map((x) => ({ ...x })));
    }
    if (this.script.length) return this.shiftScript();
    for (const a of this.live) { const h = ANTI[a.type]; if (h.nextStep) { const s = h.nextStep(k(this), a, this.st[a.id]); if (s) return s; } }
    return null;
  }
  shiftScript() {
    while (this.script.length) {
      const s = this.script.shift();
      if (s.mod) { Object.assign(this.ai.mods, s.mod); continue; }
      return s;
    }
    return null;
  }
  // his patterns: with a scripted set running, only its patterns; otherwise none of the scripted ones
  eligible(p) { return this.patternSet ? p.script === this.patternSet : !p.script; }
  // an `open` step an exploit has taken away for the round (Gus can't eat again)
  skipOpen(s) { return !!((s.id && this.flag('noOpen:' + s.id)) || (s.anim && this.flag('noOpen:' + s.anim))); }
  // a palette an exploit's switch puts on him (d.flagPalettes: Rocco without his hard hat)
  palette() {
    const P = this.ai.d.flagPalettes;
    if (P) for (const [f, pal] of Object.entries(P)) if (this.flag(f)) return pal;
    return null;
  }

  modifyMove(m) {
    for (const a of this.live) { const h = ANTI[a.type]; if (h.modifyMove) m = h.modifyMove(k(this), a, this.st[a.id], m) || m; }
    if (this.enraged > 0 && !m.call && !m.feint) {
      const E = this.enrage || {};
      m = { ...m, windupFrames: Math.max(6, Math.round(m.windupFrames * (E.speed || 0.85))), recoveryFrames: Math.round(m.recoveryFrames * (E.recovery || 1.4)) };
      if (m.counterWindow) m.counterWindow = m.counterWindow.map((v) => Math.min(m.windupFrames - 1, v));
      if (m.kdWindow) m.kdWindow = m.kdWindow.map((v) => Math.min(m.windupFrames - 1, v));
    }
    return m;
  }
  moveStart(m) {
    this.hitRun = 0;
    for (const a of this.live) { const h = ANTI[a.type]; if (h.moveStart) h.moveStart(k(this), a, this.st[a.id], m); }
    if (m.cue) this.banner(m.cue, 'red', Math.min(60, m.windupFrames + 10));
  }
  // a feint's windup ran out: an anti-strategy may turn it into a real punch
  feintEnd(m) {
    for (const a of this.live) { const h = ANTI[a.type]; if (h.feintEnd && h.feintEnd(k(this), a, this.st[a.id], m)) return true; }
    return false;
  }

  // The executor's hooks (moveResolved, onKnockdown, roundStart, getUp...)
  hook(name, ...args) {
    const ai = this.ai;
    if (name === 'roundStart') { this.roundFlags = {}; this.enraged = 0; this.stateDone = {}; }
    for (const a of this.live) { const h = ANTI[a.type]; if (h[name]) h[name](k(this), a, this.st[a.id], ...args); }
    if (name === 'moveResolved') {
      const [m, res] = args;
      if (res === 'hit' && !m.call) for (const s of this.triggers) if (s.on === 'landed') this.stateFire(s);
      for (const x of this.exploits) {
        const T = x.trigger;
        if (T.on !== 'resolved' || !this.canFire(x)) continue;
        const forced = this.force.exploits.has(x.id);
        if (!forced) {
          if (T.move && !asList(T.move).includes(m.id)) continue;
          if (T.result && !asList(T.result).includes(res)) continue;
          if (T.dir && (this.f.player.dir < 0 ? 'L' : 'R') !== T.dir) continue;
          if (T.health && !inRange(ai.healthFrac(), T.health)) continue;
          if (T.flag && !this.flag(T.flag)) continue;
        }
        this.exploitFired(x);
        this.resolvedFx = x; // applied when his move is done (the recovery would override it)
      }
    }
    if (name === 'getUp' || name === 'onKnockdown' || name === 'playerDown') {
      for (const x of this.exploits) if (x.trigger.on === name && this.canFire(x)) { this.exploitFired(x); this.after(x); }
      for (const s of this.triggers) if (s.on === (name === 'onKnockdown' ? 'knockdown' : name)) this.stateFire(s);
    }
  }
  // a gimmick fires an exploit by hand (trigger `{ on: 'custom' }`: Halcyon's weighed-down windup)
  custom(id) { const x = this.exploits.find((e) => e.id === id); if (x && this.canFire(x)) { this.exploitFired(x); this.after(x); } }
  // his move is over after an on:'resolved' exploit fired: drop him into its effect
  // (called by the executor at the end of the move's active frames)
  takeResolved() { const x = this.resolvedFx; this.resolvedFx = null; if (x) { this.after(x); return true; } return false; }

  event(name) {
    this.events[name] = this.f.clock;
    for (const a of this.live) { const h = ANTI[a.type]; if (h.on) h.on(k(this), a, this.st[a.id], name); }
  }

  // --- punches ---------------------------------------------------------------------
  canFire(x) { return !x.limit || (this.fired[x.id] || 0) < x.limit; }

  matchPunch(x, p, r, S) {
    const T = x.trigger, ai = this.ai;
    if (T.on === 'custom') return this.canFire(x) && this.force.exploits.has(x.id); // (fired by its gimmick: custom(); the lab's toggle fires it on any punch)
    if ((T.on || 'punch') !== 'punch' || !this.canFire(x)) return false;
    if (this.force.exploits.has(x.id)) return true;
    if (T.state && !asList(T.state).includes(S)) return false;
    const moveT = ['windup', 'active', 'recovery'].includes(S) ? ai.moveT : ai.t;
    if (T.move && !asList(T.move).includes(ai.moveId)) return false;
    if (T.frames && !inRange(moveT, T.frames)) return false;
    if (T.open && !(ai.openStep && (ai.openStep.id === T.open || ai.openStep.anim === T.open))) return false;
    if (T.side && p.side !== T.side) return false;
    if (T.height && (p.star || (T.height === 'high') !== !!p.high)) return false;
    if (T.star != null && !!p.star !== T.star) return false;
    if (T.counter && !(r.result === 'hit' && r.counter)) return false;
    if (T.lands && r.result !== 'hit') return false;
    if (T.after && ai.moveResult !== T.after) return false;
    if (T.first && ai.openHits > 0) return false;
    // a deliberate punch, not one out of a flurry of mashing: no other punch in the last `clean` frames
    if (T.clean && this.f.behavior.total.punches && this.f.behavior.t - this.f.behavior.lastPunch < T.clean) return false;
    if (T.health && !inRange(ai.healthFrac(), T.health)) return false;
    if (T.flag && !this.flag(T.flag)) return false;
    if (T.notFlag && this.flag(T.notFlag)) return false;
    if (T.since && !inRange(this.f.clock - (this.events[T.since.event] ?? -9999), T.since.frames)) return false;
    if (T.mark && !inRange(this.f.clock - (this.marks[T.mark.name] ?? -9999), T.mark.frames)) return false;
    if (T.test && !TESTS[T.test](this, p, r, S)) return false;
    if (T.count) { const c = (this.counts[x.id] = (this.counts[x.id] || 0) + 1); if (c < T.count) return false; this.counts[x.id] = 0; }
    return true;
  }

  // Before his modifiers: an exploit (or an anti-strategy) may replace the result.
  punch(p, r, S) {
    this.fx = null;
    if (r.knockdown || r.far) return null; // the golden chance, or he's out of reach
    for (const x of this.exploits) {
      if (!this.matchPunch(x, p, r, S)) continue;
      const E = x.effect || {};
      const base = p.star ? PUNCH_DAMAGE.star : p.high ? PUNCH_DAMAGE.head : PUNCH_DAMAGE.body;
      let out;
      if (E.keep && r.result === 'hit') out = { ...r };
      else {
        const counter = !!(r.counter || E.knockdown || E.stun);
        out = { result: 'hit', damage: r.result === 'hit' ? r.damage : Math.round(base * (counter ? this.f.counterMult ?? PUNCH_DAMAGE.counterMult : 1)), counter, star: !!r.star, chain: E.open ? 'open' : E.stun ? 'counter' : r.chain || 'single' };
      }
      if (E.star) out.star = true;
      if (E.knockdown) { out.knockdown = true; out.counter = true; }
      out.exploit = x.id;
      this.fx = x;
      this.exploitFired(x);
      return out;
    }
    for (const a of this.live) {
      const h = ANTI[a.type];
      if (!h.punch) continue;
      const o = h.punch(k(this), a, this.st[a.id], p, r, S);
      if (o) return o;
    }
    return null;
  }
  // After his modifiers: anti-strategies that watch the final result (rushing).
  postPunch(p, r, S) {
    for (const a of this.live) { const h = ANTI[a.type]; if (h.postPunch) h.postPunch(k(this), a, this.st[a.id], p, r, S); }
    if (r.result === 'hit') {
      this.hitRun++;
      for (const s of this.triggers) if (s.on === 'hitStreak' && this.hitRun >= (s.n || 3)) this.stateFire(s);
    }
  }
  // After the executor's own bookkeeping: an exploit's effect on his state.
  afterPunch() { const x = this.fx; this.fx = null; if (x) this.after(x, true); }

  after(x, fromHit = false) {
    const E = x.effect || {}, ai = this.ai, st = ai.d.stats;
    if (E.say) this.banner(E.say, 'yellow', 80);
    if (E.sfx) this.f.sfx(E.sfx);
    if (E.flag) (E.until === 'round' ? this.roundFlags : this.flags)[E.flag] = true;
    if (E.mod) for (const [key, v] of Object.entries(E.mod)) ai.mods[key] = Math.max(0, Math.min(1, (ai.mods[key] || 0) + v));
    if (E.cancel) { ai.stepIdx += E.cancel; ai.forced = []; }
    // the rest of the combo he was starting never comes
    if (E.cancelMoves) {
      ai.forced = ai.forced.filter((id) => !E.cancelMoves.includes(id));
      while (ai.steps && ai.stepIdx < ai.steps.length && E.cancelMoves.includes(ai.steps[ai.stepIdx].move)) ai.stepIdx++;
      this.script = this.script.filter((s) => !E.cancelMoves.includes(s.move));
    }
    if (E.tag) this.tagIn();
    if (E.wheel) this.setWheel(E.wheel);
    if (E.extendOpen && ai.state === 'open') {
      const used = ai.openStep.extended || 0, add = Math.max(0, Math.min(E.extendOpen, (E.max ?? 90) - used));
      ai.wait += add; ai.openStep = { ...ai.openStep, extended: used + add, comboLimit: (ai.openStep.comboLimit ?? 99) + (add ? 1 : 0) };
    }
    if (E.open) {
      const { frames, ...o } = E.open;
      ai.startOpen({ anim: 'stunned', comboLimit: 4, star: null, interrupt: false, ...o, open: frames, id: 'x:' + x.id });
      if (fromHit) { ai.openHits = 1; ai.flinch = 10; }
    }
    if (E.stun) {
      ai.stun = E.stun; ai.flurry = E.hits ?? st.stunComboLimit; ai.combo = Math.min(ai.combo || 1, 1);
      if (ai.state !== 'hit') { ai.state = 'hit'; ai.t = 0; ai.hitLen = st.hitstun + 6; ai.move = null; }
    }
    if (E.script) this.script.push(...E.script.map((s) => ({ ...s })));
  }

  // the other twin tags in (the tag team modifier's members)
  tagIn() {
    const ai = this.ai, tt = ai.modifiers.find((m) => m.cfg.type === 'tagTeam');
    if (!tt) return;
    const L = tt.cfg.members.filter((m) => m !== ai.mods.twin);
    if (L.length) { ai.mods.twin = L[Math.floor(Math.random() * L.length)]; ai.pattern = null; ai.mods.tagT = 90; }
  }
  setWheel(set) {
    const ai = this.ai, pw = ai.modifiers.find((m) => m.cfg.type === 'prizeWheel');
    if (!pw || !ai.mods.wheel) return;
    const i = pw.cfg.slices.findIndex((s) => s.set === set);
    if (i >= 0) { ai.mods.wheel.pick = i; ai.mods.wheel.showT = 100; ai.pattern = null; this.f.sfx('ding'); }
  }

  stateFire(s) {
    const scope = s.once || (s.cooldown ? 'never' : 'round');
    this.stateDone ||= {};
    if (s.cooldown && this.f.clock - (this.stateAt[s.id] ?? -99999) < s.cooldown) return;
    if (scope === 'round' ? this.stateDone[s.id] === this.f.round : scope === 'fight' && this.stateDone[s.id]) return;
    this.stateDone[s.id] = scope === 'round' ? this.f.round : true;
    this.stateAt[s.id] = this.f.clock;
    const D = s.do || {};
    this.note(s, s.say || s.name, 'state');
    if (s.say) this.banner(s.say, 'orange', 80);
    if (D.enrage) { this.enraged = D.enrage; this.enrage = D; }
    if (D.mark) this.marks[D.mark] = this.f.clock;
    if (D.steps) (s.on === 'landed' ? this.late : this.script).push(...D.steps.map((x) => ({ ...x })));
    if (D.patterns) { this.patternSet = D.patterns; this.ai.pattern = null; }
  }

  // --- rendering ---------------------------------------------------------------------
  render(frame, fight) {
    const COL = fight.COL;
    // Practice's EXPLOIT VIEW (a scouting reward): a green diamond by his head on the frames
    // where pressing now lands in an exploit window
    if (fight.opts.exploitView && fight.phase === 'fight' && this.exploitNow()) {
      const v = this.ai.view();
      if (!v.hidden) {
        const h = fight.oppHead(v), x = Math.round(h.x - 30), y = Math.round(h.y - 20);
        for (let i = 0; i <= 5; i++) { frame.rect(x - i, y - 5 + i, i * 2 + 1, 1, COL.green); frame.rect(x - i, y + 5 - i, i * 2 + 1, 1, COL.green); }
        frame.rect(x - 1, y - 1, 3, 3, COL.white);
      }
    }
    // meters under the clock (Jax's champion's pride)
    for (const a of this.live) {
      const h = ANTI[a.type], B = h.badge && h.badge(k(this), a, this.st[a.id]);
      if (!B) continue;
      const w = 68, x = 128 - (w >> 1);
      panel(frame, x - 2, 42, w + 4, 11);
      drawText(frame, B.text, x + 1, 43, COL.orange, { mono: false });
      const bx = x + textWidth(B.text, false) + 4, bw = x + w - 2 - bx;
      frame.rect(bx, 45, bw, 4, COL.black);
      frame.rect(bx, 45, Math.max(1, Math.round(bw * B.frac)), 4, B.frac > 0.7 ? COL.red : COL.orange);
    }
    for (const b of this.banners) {
      if (b.y === 44) {
        if (b.t > 90 && (b.t >> 1) & 1) continue;
        const w = Math.max(textWidth('SCOUTED!', false), textWidth(b.sub || '', false)) + 10;
        panel(frame, 128 - (w >> 1), 42, w, 22);
        drawText(frame, 'SCOUTED!', 128 - (textWidth('SCOUTED!', false) >> 1), 45, (b.t >> 2) & 1 ? COL.green : COL.yellow, { mono: false });
        if (b.sub) drawText(frame, b.sub, 128 - (textWidth(b.sub, false) >> 1), 54, COL.white, { mono: false });
        continue;
      }
      if (b.t < 60 && !((b.t >> 2) & 1) && b.t > 8) continue;
      drawTextBig(frame, b.text, 128, b.y, COL[b.col] || COL.yellow, COL.black, 1);
    }
  }
  // Barney's bucket and friends: small props drawn by his feet (d.knowledgeProps)
  renderOpp(frame, fight) {
    for (const pr of this.ai.d.props || []) if (PROPS[pr.type]) PROPS[pr.type](frame, fight, this, pr);
  }

  // Fight lab: exploit windows on the move / open step he's in now, as frame ranges.
  windows() {
    const ai = this.ai, out = [];
    for (const x of this.exploits) {
      const T = x.trigger;
      if ((T.on || 'punch') !== 'punch') continue;
      const states = asList(T.state);
      if (ai.state === 'windup' && ai.move && (!states || states.includes('windup')) && (!T.move || asList(T.move).includes(ai.moveId))) {
        if (!T.move && !states) continue;
        out.push({ id: x.id, name: x.name, where: 'windup', w: T.frames || [0, ai.move.windupFrames - 1], hand: T.side, height: T.height });
      } else if (ai.state === 'open' && ai.openStep && states && states.includes('open') && (!T.open || ai.openStep.id === T.open || ai.openStep.anim === T.open)) {
        out.push({ id: x.id, name: x.name, where: 'open', w: T.frames || [0, ai.openStep.open], hand: T.side, height: T.height });
      } else if (ai.state === 'recovery' && states && states.includes('recovery') && (!T.move || asList(T.move).includes(ai.moveId))) {
        out.push({ id: x.id, name: x.name, where: 'recovery', w: T.frames || [0, ai.move.recoveryFrames], hand: T.side, height: T.height });
      }
    }
    return out;
  }
  // Is a punch pressed now going to land inside an exploit's window? (exploit view)
  exploitNow() {
    const ai = this.ai, t = ['windup', 'active', 'recovery'].includes(ai.state) ? ai.moveT : ai.t;
    for (const w of this.windows()) {
      const x = this.exploits.find((e) => e.id === w.id), lead = x.trigger.star ? PT.STAR_IMPACT : PT.JAB_IMPACT;
      if (t + lead >= w.w[0] && t + lead <= w.w[1] && (w.where !== 'windup' || t + lead < ai.move.windupFrames)) return true;
    }
    for (const x of this.exploits) {
      const T = x.trigger, lead = T.star ? PT.STAR_IMPACT : PT.JAB_IMPACT;
      if (T.since && this.events[T.since.event] != null && inRange(this.f.clock + lead - this.events[T.since.event], T.since.frames)) return true;
    }
    return false;
  }
  // Fight lab readout: every anti-strategy and whether it's armed right now.
  antiStatus() { return this.antis.map((a) => ({ id: a.id, type: a.type, on: !!(ANTI[a.type].active && ANTI[a.type].active(k(this), a, this.st[a.id])), forced: this.force.antis.has(a.id) })); }
}

// handler context (the Knowledge itself: handlers read k.f, k.ai, k.fire...)
const k = (K) => K;

// --- props ------------------------------------------------------------------------
const PROPS = {
  // a camera flash in the crowd on frames [a, b] of an open step (McBride's photo op)
  cameraFlash(frame, fight, K, pr) {
    const ai = K.ai;
    if (ai.state !== 'open' || !ai.openStep || ai.openStep.id !== pr.open || ai.t < pr.frames[0] - 2 || ai.t > pr.frames[1]) return;
    const x = pr.x ?? 58, y = pr.y ?? 70, r = ai.t < pr.frames[0] + 2 ? 7 : 4;
    const W = fight.COL.white, Y = fight.COL.yellow;
    for (let i = -r; i <= r; i++) { frame.px(x + i, y, Math.abs(i) < 3 ? W : Y); frame.px(x, y + i, Math.abs(i) < 3 ? W : Y); }
    for (const [dx, dy] of [[-2, -2], [2, 2], [2, -2], [-2, 2]]) frame.px(x + dx, y + dy, W);
    frame.rect(x - 1, y - 1, 3, 3, W);
  },
  // a mop bucket by his feet; it tips over when his mop swing's golden moment lands (he's slipped on it), until he's
  // back on his feet and it's set upright again
  bucket(frame, fight, K, pr) {
    const x = fight.OPP_X + (pr.dx ?? 34), y = fight.OPP_Y + (pr.dy ?? -1);
    const G = K.ai.lastGolden;
    const tipped = pr.golden ? G && G.key === pr.golden && (fight.phase === 'oppDown' || fight.phase === 'ko' || fight.phase === 'done' || (fight.clock || 0) - G.t < 120)
      : K.fired[pr.exploit] && (K.ai.state === 'open' && K.ai.openStep && K.ai.openStep.id === 'x:' + pr.exploit); // (Barney ascended: still an exploit)
    const grey = c32(17, 18, 20), hi = c32(26, 27, 28), dk = c32(8, 8, 10), water = c32(10, 18, 28), blk = c32(2, 2, 3);
    if (tipped) {
      frame.rect(x - 7, y - 7, 14, 8, blk); frame.rect(x - 6, y - 6, 12, 6, grey); frame.rect(x - 6, y - 6, 12, 2, hi);
      frame.rect(x + 6, y - 7, 2, 8, dk);
      frame.rect(x - 22, y - 1, 16, 2, water);
      return;
    }
    frame.rect(x - 6, y - 12, 12, 13, blk);
    frame.rect(x - 5, y - 11, 10, 11, grey);
    frame.rect(x - 5, y - 11, 3, 11, hi);
    frame.rect(x + 3, y - 11, 2, 11, dk);
    frame.rect(x - 5, y - 11, 10, 2, water);
    frame.rect(x - 6, y - 7, 12, 1, dk);
    // handle
    for (let i = -4; i <= 4; i++) frame.px(x + i, y - 14 - (Math.abs(i) < 3 ? 1 : 0), dk);
  },
};

// The fighter data the game runs (data/fighters/index.js). The corner's words about him are hint banks of their own now
// (data/hints/, src/fight/cornerman.js), so nothing is added here; the mark only says the layer has been through it.
export function withKnowledge(d) {
  if (!d.exploits || !d.exploits.length || d.knowledgeReady) return d;
  return { ...d, knowledgeReady: true };
}
