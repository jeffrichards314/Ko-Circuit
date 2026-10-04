// The difficulty curve (spec §9, §18 A3) and the dev-only tuning knobs every fight goes through.
//
// Not a player setting: Career has no difficulty option. These are the numbers a designer edits to retune the whole
// game without touching a fighter file. Every fighter is authored at his own timings and damage; at load
// (data/fighters/index.js `retune()`) `tuneFighter()` rescales him onto the curve below:
//
//   tells    every windup (and the counter / star / perfect-hit / exploit windows inside it) is scaled so his median
//            opening tell lands on his slot in TELLS: moves up to the median by one factor, slower ones by the same
//            added frames, no opener under OPENER_FLOOR of the slot. Windows keep their place in the punch; a perfect-hit
//            or exploit window keeps its width (frame-exact knowledge stays frame-exact). Answer-only punches (a guard
//            counter, an anti-strategy's counter) and sound-only leads keep their authored speed.
//   heat     h in [0, 1], one number per fight read off his tell slot (log scale: 34f -> 0, 5f -> 1). Every other lever
//            follows it, so all of them share the tells' sawtooth and only ZERO's true form (5f) reaches the top of any.
//   damage   his damageMult is set so his average punch lands on DAMAGE(h), keeping some of his own character (IDENTITY).
//   get-up   the player's get-up mash, as presses per second needed (GETUP): rises with h and with every knockdown in
//            the fight, and from the zone's wall knockdown on (WALL) it needs WALL_NEED presses a second: near-impossible.
//   stars    star windows narrow with h (STAR_WIDTH); the circuit's starsPerRound still caps them.
//   pace     idles of 24+ frames between his combos shorten with h (PACE): more pressure later, combos untouched.
//   adapt    adaptive pattern picking: how much a pattern that landed on you comes back (ADAPT).
//   strict   anti-strategy thresholds (streaks, frames, shares) tighten with h (STRICT).
//   golden   every super's golden moment needs a clean punch and its window narrows with h (GOLDEN: 8 frames at Rookie,
//            2 at ZERO's true form); against the six big bosses it is a long stun (GOLDEN_STUN), not a knockdown
//   supers   supers per round by role (SUPERS): champions and Dash above the fighters around them, bosses above that,
//            ZERO's true form the most.
//
// THE KNOBS (KNOBS below): change a number, reload. In the fight lab the same knobs are live sliders (they don't save:
// copy the numbers here to keep them).
//   tell      global multiplier on every tell window (1.1 = 10% longer = easier)
//   damage    global multiplier on damage taken (0.9 = 10% less)
//   zones     the same two multipliers per zone: main (Rookie to Grand Prix, Underground, Dash I-IV), championship (Jax,
//             Nightmare, ZERO's first encounter), pantheon (P1-P7, Halcyon, Dash V-VI), underworld (U1-U6, Vorgath, Dash
//             VII-VIII), void (Void I-III, Dash Unbound, ZERO's true form)
//   bosses    per boss: tell (frames, replaces his TELLS slot), damage (multiplier), wall (the knockdown that's near-
//             impossible to get up from), supers ([min, max] per round), goldenStun (frames he's open after his super's
//             golden moment). null = the curve's value.

export const KNOBS = {
  tell: 1,
  damage: 1,
  zones: {
    main: { tell: 1, damage: 1 },
    championship: { tell: 1, damage: 1 },
    pantheon: { tell: 1, damage: 1 },
    underworld: { tell: 1, damage: 1 },
    void: { tell: 1, damage: 1 },
  },
  bosses: {
    jax: { tell: null, damage: null, wall: null, supers: null, goldenStun: null },
    zero: { tell: null, damage: null, wall: null, supers: null, goldenStun: null },
    halcyon: { tell: null, damage: null, wall: null, supers: null, goldenStun: null },
    vorgath: { tell: null, damage: null, wall: null, supers: null, goldenStun: null },
    dash9: { tell: null, damage: 0.85, wall: null, supers: null, goldenStun: null },
    zeroTrue: { tell: null, damage: 0.93, wall: null, supers: null, goldenStun: null },
  },
};
export const BOSSES = Object.keys(KNOBS.bosses);

// The order a career meets every fight (Dash after the title he follows; the secret circuits where they open), and
// the zone each circuit's knobs come from.
export const STORY = ['rookie', 'minor', 'rival1', 'metro', 'major', 'rival2', 'carnival', 'continental', 'world', 'rival3', 'storm', 'legends',
  'grandprix', 'rival4', 'underground', 'dream', 'nightmare', 'zero',
  'p1', 'p2', 'p3', 'rival5', 'p4', 'p5', 'p6', 'rival6', 'p7', 'halcyon',
  'u1', 'u2', 'u3', 'rival7', 'u4', 'u5', 'u6', 'rival8', 'vorgath',
  'v1', 'v2', 'v3', 'rival9', 'zeroTrue'];
export const ZONE = {
  ...Object.fromEntries(['rookie', 'minor', 'rival1', 'metro', 'major', 'rival2', 'carnival', 'continental', 'world', 'rival3', 'storm', 'legends', 'grandprix', 'rival4', 'underground'].map((c) => [c, 'main'])),
  dream: 'championship', nightmare: 'championship', zero: 'championship',
  ...Object.fromEntries(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon', 'rival5', 'rival6'].map((c) => [c, 'pantheon'])),
  ...Object.fromEntries(['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'vorgath', 'rival7', 'rival8'].map((c) => [c, 'underworld'])),
  ...Object.fromEntries(['v1', 'v2', 'v3', 'rival9', 'zeroTrue'].map((c) => [c, 'void'])),
};

// TELLS (frames): [his circuit's first fighter, its champion]; the ones between step evenly. A one-fighter circuit
// (a boss, Dash) is one number: Dash sits half a frame above the champion he follows (a spike after the title), and
// every champion's slot is tighter than the champion's before him in the zone. `nominal` is the circuit's row in the §9 / A3 table (what the screens print).
// Sawtooth: each circuit opens easier than the champion before it, and closes harder than that champion.
export const TELLS = {
  rookie: { span: [34, 30], nominal: 32 },
  minor: { span: [31, 26], nominal: 28 },
  rival1: { span: [25], nominal: 25 },
  metro: { span: [27, 23], nominal: 25 },
  major: { span: [24, 20], nominal: 22 },
  rival2: { span: [19.5], nominal: 19.5 },
  carnival: { span: [22, 18], nominal: 20 },
  continental: { span: [21, 17], nominal: 19 },
  world: { span: [19, 15], nominal: 17 },
  rival3: { span: [14.5], nominal: 14.5 },
  storm: { span: [18, 14], nominal: 16 },
  legends: { span: [17, 13], nominal: 15 },
  grandprix: { span: [16, 12], nominal: 14 },
  rival4: { span: [11.5], nominal: 11.5 },
  underground: { span: [15, 11], nominal: 13 },
  dream: { span: [10], nominal: 10 },
  nightmare: { span: [13.5, 11], nominal: 12 },
  zero: { span: [9], nominal: 9 },
  p1: { span: [14, 12.5], nominal: 13 },
  p2: { span: [13.5, 12], nominal: 13 },
  p3: { span: [13, 11.5], nominal: 12 },
  rival5: { span: [11], nominal: 11 },
  p4: { span: [12.5, 11], nominal: 12 },
  p5: { span: [12, 10.5], nominal: 11 },
  p6: { span: [11.5, 10], nominal: 11 },
  rival6: { span: [9.5], nominal: 9.5 },
  p7: { span: [11.5, 9.5], nominal: 11 },
  halcyon: { span: [8], nominal: 8 },
  u1: { span: [11, 9.75], nominal: 10 },
  u2: { span: [10.5, 9.5], nominal: 10 },
  u3: { span: [10.25, 9], nominal: 10 },
  rival7: { span: [8.5], nominal: 8.5 },
  u4: { span: [10, 8.75], nominal: 9 },
  u5: { span: [9.5, 8.5], nominal: 9 },
  u6: { span: [9.25, 8], nominal: 9 },
  rival8: { span: [7.5], nominal: 7.5 },
  vorgath: { span: [7], nominal: 7 },
  v1: { span: [9, 8], nominal: 8 },
  v2: { span: [8.5, 7.5], nominal: 8 },
  v3: { span: [8, 7], nominal: 8 },
  rival9: { span: [6], nominal: 6 },
  zeroTrue: { span: [5], nominal: 5 },
};
// heat: 0 at a 34-frame tell, 1 at 5 frames (log scale: 32 -> 28 frames matters less than 8 -> 5)
const HEAT_EASY = 34, HEAT_HARD = 5;
export const heatOf = (tell) => Math.max(0, Math.min(1, Math.log(HEAT_EASY / tell) / Math.log(HEAT_EASY / HEAT_HARD)));
const lerp = (a, b, t) => a + (b - a) * t;

// DAMAGE: his average real punch (x damageMult) at heat h, in player health (100 = a full bar).
export const DAMAGE = { at0: 9.5, at1: 38 };
// IDENTITY: how much of his own weight he keeps against his circuit's average (0 = every fighter hits the same,
// 1 = his authored ratio to the circuit is kept in full)
export const IDENTITY = 0.5;
// GETUP: presses per second the get-up mash needs for the 1st knockdown (base) and each one after (step), at heat 0 and 1;
// a cap where there is no wall (the main game never gets near-impossible), +champion/+boss on the base.
export const GETUP = { base: [3, 10], step: [0.6, 2], cap: 12, champion: 0.5, boss: 1, power: 6 };
export const WALL_NEED = 20;    // presses a second from the wall knockdown on: near-impossible
export const MASH_FRAMES = 400; // the frames the needed rate is measured over (about a count of 7)
// WALL: the knockdown from which getting up is near-impossible, by zone / circuit (null = never)
export const WALL = { main: null, championship: 3, pantheon: 3, underworld: 3, halcyon: 2, vorgath: 2, void: 2, zeroTrue: 1 };
export const OPENER_FLOOR = 0.67;   // no opening punch's tell under this share of his tell target
export const STAR_WIDTH = [1, 0.5];  // star windows' width at heat 0 and 1
export const PACE = [1, 0.8];        // idles of 24+ frames x this at heat 0 and 1
export const ADAPT = [0.3, 0.9];     // an adaptive pattern's extra weight per punch it landed (cap 4)
export const STRICT = [0.9, 1.2];
// GOLDEN: the golden chance (a perfect hit's instant knockdown) at heat 0 and 1. clean: frames since the player's previous
// punch landed or missed (a deliberate shot; a masher's jabs come 16 apart and never qualify: the punch is still a counter);
// width: most frames a perfect-hit window can be (it keeps its start)
// width: every super's golden window, frames wide (generous early, 2 frames only at the very top: ZERO's true form)
export const GOLDEN = { clean: [18, 30], width: [8, 2] };
// GOLDEN_STUN: frames a big boss stays wide open after you land his super's golden moment (a few seconds, scaled per boss:
// the later the boss, the shorter the opening). The knob per boss (KNOBS.bosses[id].goldenStun) overrides it.
export const GOLDEN_STUN = { jax: 240, zero: 225, halcyon: 210, vorgath: 195, dash9: 180, zeroTrue: 150 };
// SUPERS per round: [min, max] by role; a fighter below heat `early` throws `fighterEarly`
export const SUPERS = { early: 0.25, fighterEarly: [1, 1], fighter: [1, 2], championEarly: [1, 2], champion: [2, 2], boss: [2, 3], zeroTrue: [3, 4] };

// BOUTS: the six big bosses fight in PHASES (spec §4 "Boss phases"). A phase ends when its health bar is emptied: he goes
// down, gets back up transformed at full health. Only his last phase can be knocked out, TKO'd or counted out. A boss fights the
// longer regular bout (`rounds`: room for his phases, on the slower boss clock, ROUND below) and then the championship rounds (CHAMPIONSHIP below) on top
// of his phases: every phase must still be finished, and the knockout that ends the fight is only possible in the last one.
//   staging  'phase': everything that changes by round in his data (forms, patterns, arena, music) follows his phase
//            (Halcyon's forms, Vorgath's phases, ZERO's true form); 'round': his rounds stay his rounds (rounds past
//            `rounds3` play like his last authored one) and his phase-2 content is marked `when: { phase: [2] }`.
export const BOUTS = {
  jax: { phases: 2, rounds: 4, staging: 'round' },
  zero: { phases: 2, rounds: 4, staging: 'round' },
  halcyon: { phases: 3, rounds: 5, staging: 'phase' },
  vorgath: { phases: 3, rounds: 5, staging: 'phase' },
  dash9: { phases: 2, rounds: 4, staging: 'round' },
  zeroTrue: { phases: 4, rounds: 7, staging: 'phase' },
};
export const boutOf = (d) => (d && BOUTS[d.id]) || null;

// TWEAKS: fighters the curve can't place by their ladder slot alone (each with why). tell: x his slot; damage: x; health: x (on top of HEALTH); tdHealth: x his Title Defense
// version's health (on top of the above);
// role: his role on the curve; keepCounter: his counter windows keep their width as his windups scale; keep: moves left as
// authored.
export const TWEAKS = {
  // the Summit's ladder ends with the gatekeeper after its champion: he's the last wall before Halcyon
  barney2: { role: 'champion', damage: 1.1, health: 0.68, tdHealth: 0.9 },
  // long tells by design (nothing hurts him but a counter, each counter window three frames wide): his tells stay
  // longer than the Void's, but come down from 13f, and the windows stay three frames
  // (his Rebuke, the answer to a punch outside a counter, keeps its 14 frames: it must stay slippable from your own jab)
  counterShard: { tell: 1.25, keepCounter: true, damage: 1.1, keep: ['rebuke'] },
  // ladder order (tools/difficulty-graph.mjs): fighters whose own weight or extra anti-strategies put them out of step
  // with their place on the ladder; the earlier one gives a little damage back, the later one takes a little more
  oro: { damage: 0.82 }, lark: { damage: 1.1 },        // Oro opens the Pantheon with two anti-strategies
  nimbus: { damage: 0.95 }, ulla: { damage: 1.05 },
  tom: { damage: 0.95 }, jules: { damage: 1.06 },
  reflection: { damage: 0.85 }, doubt: { damage: 1.02 }, // Reflection carries two anti-strategies
  valkyr: { damage: 0.95 }, scribe: { damage: 1.03 },
  moros: { damage: 0.95 }, soot: { damage: 1.04 },
  jailer: { damage: 0.95 }, fkarver: { damage: 1.04 },
  nox: { damage: 0.95 },
  dash1: { damage: 1.1 },
  // he answers instead of attacking, so his one golden chance needs a roomy window (the whole game's widest: Rookie's 8 frames)
  monk: { goldW: 8 },
  // the flurry (now eight, was eleven): a little gentler (his weight and his tells; the dance stays)
  hank: { damage: 0.95, tell: 1.1, health: 0.55 },
  // evasive by design (they slip most of what you throw): a gentler health scale, or a fight against them never ends
  // (and the ones the human-model player needed the championship rounds against nearly every time)
  warden: { health: 0.65 }, oldguard: { health: 0.7 }, rho: { damage: 1.05, health: 0.7 }, karver: { health: 0.75 }, mirror: { health: 0.8 },
  blockShard: { health: 0.8 }, nebula: { health: 0.8 }, // (the slowest of the Void fighters stays the slowest; Nebula: a wall in Title Defense)
  strongman: { health: 0.55 }, tess: { health: 0.4 }, rourke: { health: 0.42 },
  // the final audit (2026-10-03): before the Underworld the aggressive human-model player rarely needs the championship rounds. These fighters ended
  // right at the end of round 3 (a quarter to nine tenths of the fights went on into round 4), so their health comes down a little: the fights end
  // in round 3 and the championship rounds stay the answer to a player who cannot finish
  lars: { health: 0.8 }, duchess: { health: 0.9 }, bolt: { health: 0.9 }, cade: { health: 0.85 }, static: { health: 0.85 }, null: { health: 0.9 },
  maestro: { tdHealth: 0.9 }, eclipse: { tdHealth: 0.85 }, // (Title Defense: their remixes' own factor, on top of the one above, data/fighters/titleDefense.js)
  quinn: { health: 0.9 }, dash3: { health: 0.85 }, dash4: { health: 0.75 }, cirrus: { health: 0.9 }, aurora: { health: 0.8 }, orbit: { health: 0.9 }, hale: { health: 0.75 }, prism: { health: 0.9, tdHealth: 0.85 },
  // the later Dash fights the human-model player lost up to half the time: a little easier (shorter fights, a little less weight, never his tells)
  dash5: { health: 0.72 }, dash6: { health: 0.4, damage: 0.8 }, dash7: { health: 0.8 }, dash8: { health: 0.75, damage: 0.85 },
};

// HEALTH: every regular fighter's health x this by zone (2026-10-03, after the first play-through: fights ended in round 1-2; they should go to round 3 and the
// championship rounds). The big bosses are not scaled: they have longer bouts (BOUTS). The medals' speed targets and the Title Defense par times scale with it.
// MASH: a punch does less (never a Star Punch) the more punches you WASTED (blocked, whiffed, bounced off his guard) in the last `window` frames:
// from `free` of them it falls to ((free + 1) / (wasted + 1)) ^ power of its damage, never under `floor`. A masher wastes 6-9 in 200 frames; a player
// who throws at openings, however fast, 3 or fewer.
export const MASH = { window: 240, free: 3, power: 3, floor: 0.03 };
export const HEALTH = { main: 3.0, championship: 2.3, pantheon: 2.0, underworld: 1.5, void: 1.35 };

// ---------------------------------------------------------------------------------------------------------------
// The fighter's place: his circuit, his index on its ladder, his role.
export function roleOf(d, C) {
  if (d.id === 'zeroTrue') return 'zeroTrue';
  if (TWEAKS[d.id] && TWEAKS[d.id].role) return TWEAKS[d.id].role;
  if (BOSSES.includes(d.id) || (C && C.boss)) return 'boss';
  if (d.rival || d.isChampion) return 'champion';
  return 'fighter';
}
// the tell slot (frames, before the knobs) for fighter id in circuit C
export function tellSlot(id, C) {
  const T = TELLS[C.id];
  if (!T) return null;
  const [a, b = a] = T.span, list = C.fighters || [id], n = list.length, i = Math.max(0, list.indexOf(id));
  return n <= 1 ? b : a + ((b - a) * i) / (n - 1);
}
export const zoneMult = (cid, key) => (KNOBS.zones[ZONE[cid]] || {})[key] ?? 1;
const bossKnob = (id, key) => (KNOBS.bosses[id] || {})[key] ?? null;

// his tell target after the knobs (frames)
export function tellTarget(d, C) {
  const slot = bossKnob(d.id, 'tell') ?? tellSlot(d.id, C) * ((TWEAKS[d.id] || {}).tell ?? 1);
  return slot * KNOBS.tell * zoneMult(C.id, 'tell');
}
// the wall knockdown for him (null: never near-impossible)
export function wallOf(d, C) {
  const k = bossKnob(d.id, 'wall');
  if (k != null) return k;
  if (d.id === 'zeroTrue') return WALL.zeroTrue;
  if (C.id === 'halcyon' || C.id === 'vorgath') return WALL[C.id];
  return WALL[ZONE[C.id]] ?? null;
}
// presses per second needed to get up from the k-th knockdown of the fight
export function mashNeed(G, k) {
  if (G.wall && k >= G.wall) return WALL_NEED;
  const r = G.base + G.step * (k - 1);
  return G.wall ? r : Math.min(G.cap, r);
}
// the meter's decay per frame for the k-th knockdown (fightState): presses/s x power over MASH_FRAMES fills 100
export function mashDecay(G, k) {
  return Math.max(0.05, (mashNeed(G, k) * G.power) / 60 - 100 / MASH_FRAMES);
}
// the old per-circuit form (circuit.mash { power, decay, perKnockdown }) in presses per second, for the before/after audit
export function legacyNeed(M, k) {
  const decay = M.decay * (1 + M.perKnockdown * (k - 1));
  return ((decay + 100 / MASH_FRAMES) * 60) / M.power;
}

// ---------------------------------------------------------------------------------------------------------------
// Measuring a fighter (shared with tools/knowledge-audit.js's difficulty score and tools/balance.mjs)
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
// the punches that start something: not a feint / call / super / strike, not only ever a chain follow-up
export function openers(d) {
  // (a fighter who only ever answers, the Monk, starts every one of his punches from a `reactions` entry: those are his openers)
  const follow = new Set(), starts = new Set(Object.values(d.reactions || {}));
  for (const p of d.patterns || []) {
    const st = p.steps || [];
    st.forEach((s, i) => {
      if (!s.move) return;
      const chained = i > 0 && st[i - 1].move && !(d.moves[st[i - 1].move] || {}).feint;
      if (chained) follow.add(s.move); else starts.add(s.move);
    });
  }
  return Object.entries(d.moves).filter(([id, m]) => !m.super && !id.endsWith('*') && !m.feint && !m.call && !m.strike && m.activeFrames > 0
    && (m.avoidBy || []).length && (starts.has(id) || !follow.has(id))).map(([id, m]) => ({ id, ...m }));
}
// his tell: the median windup of his openers (a `quiet` lead is sound only: the tell is what shows)
export function tellOf(d) {
  const w = openers(d).map((m) => m.windupFrames - (m.quiet || 0));
  return w.length ? median(w) : null;
}
// his average real punch in player health (x damageMult; one-hit knockdowns and feints left out)
export function damageOf(d) {
  const real = Object.entries(d.moves).filter(([id, m]) => !id.endsWith('*') && !m.feint && !m.call && m.activeFrames > 0 && !m.knockdown && m.damage > 0);
  if (!real.length) return 0;
  return (real.reduce((s, [, m]) => s + m.damage, 0) / real.length) * (d.stats.damageMult || 1);
}

// ---------------------------------------------------------------------------------------------------------------
// The transform. `d` is the authored fighter (supers wired and knowledge added); `C` his circuit; `circuitDamage` the
// authored average damage of his circuit (for IDENTITY). Returns a new fighter; `d` is never changed.
export function tuneFighter(d, C, circuitDamage) {
  if (!C || !TELLS[C.id]) return d;
  const role = roleOf(d, C);
  const slot = bossKnob(d.id, 'tell') ?? tellSlot(d.id, C);
  const h = heatOf(tellSlot(d.id, C));
  const authored = tellOf(d);
  const target = tellTarget(d, C);
  // one factor for all his timings (a `longTells` fighter, the Counter Shard, is never made quicker)
  const tw = TWEAKS[d.id] || {};
  let k = authored ? target / authored : 1;
  if (d.longTells && tw.tell == null) k = Math.max(1, k);
  const starW = lerp(STAR_WIDTH[0], STAR_WIDTH[1], h);
  const goldW = tw.goldW ?? Math.max(GOLDEN.width[1], h >= 1 ? GOLDEN.width[1] : Math.ceil(lerp(GOLDEN.width[0], GOLDEN.width[1], h)));

  const moves = {};
  // (a fighter made quicker keeps every counter window where it was, frames from the start of his tell, and its width:
  // shrinking one to fit would take frames off a window his tells already made tight)
  const anchor = tw.keepCounter ? 'end' : k < 1 ? 'start' : null;
  // a move up to his median tell scales by k; a slower one (a haymaker, a super) gets the frames the median got, so
  // a big telegraphed punch stays telegraphed without turning glacial
  const delta = authored ? (authored * k) - authored : 0;
  const kOf = (W) => (!W || !authored || W <= authored ? k : Math.max(0.1, (W + delta) / W));
  // no opening punch more than a third under his slot (OPENER_FLOOR): a quick one stays his quickest, but stays readable
  const opens = new Set(openers(d).map((m) => m.id)), floor = Math.ceil(OPENER_FLOOR * target);
  // his answers to bad play (the guard counter, an anti-strategy's counter punches) keep their authored speed, floored like an
  // opener: stretched with the rest, a slow answer turns into a free slip-and-punish for the very player it should punish
  const answers = answerMoves(d);
  const kAt = (id, W) => {
    if (!W) return kOf(W);
    if (answers.has(id) && kOf(W) > 1) return Math.max(1, floor / W);
    return opens.has(id) ? Math.max(kOf(W), floor / W) : kOf(W);
  };
  for (const [id, m] of Object.entries(d.moves)) {
    if ((tw.keep || []).includes(id)) { moves[id] = m; continue; }
    if (!m.quiet) { moves[id] = scaleMove(m, kAt(id, m.windupFrames), starW, anchor, goldW); continue; }
    // a sound-only lead (Link's rattle): the visible tell scales like anyone's, the lead stays as authored (it's warning already)
    const vis = m.windupFrames - m.quiet, q = m.quiet, W = Math.round(vis * kOf(vis)) + q;
    moves[id] = { ...scaleMove(m, W / m.windupFrames, starW, anchor, goldW), quiet: q };
  }

  // damage: his average punch onto the curve, keeping IDENTITY of his weight against his circuit
  const own = damageOf(d);
  const want = lerp(DAMAGE.at0, DAMAGE.at1, h) * Math.pow(own && circuitDamage ? own / circuitDamage : 1, IDENTITY);
  const dmgK = (own ? want / own : 1) * (tw.damage ?? 1) * KNOBS.damage * zoneMult(C.id, 'damage') * (bossKnob(d.id, 'damage') ?? 1);
  const stats = { ...d.stats, damageMult: +((d.stats.damageMult || 1) * dmgK).toFixed(3) };
  if (!BOSSES.includes(d.id)) stats.health = Math.round(d.stats.health * (tw.health ?? 1) * (HEALTH[ZONE[C.id]] ?? 1));

  // the player's get-up
  const getUp = {
    power: GETUP.power,
    base: lerp(GETUP.base[0], GETUP.base[1], h) + (role === 'champion' ? GETUP.champion : role === 'boss' || role === 'zeroTrue' ? GETUP.boss : 0),
    step: lerp(GETUP.step[0], GETUP.step[1], h),
    cap: GETUP.cap,
    wall: wallOf(d, C),
  };

  // pace: his longer idles (not the short ones that glue a combo together, under 24 frames) shorten with heat
  const pace = lerp(PACE[0], PACE[1], h);
  const patterns = (d.patterns || []).map((p) => ({ ...p, steps: p.steps.map((s) => (s.idle >= 24 && Object.keys(s).length === 1 ? { idle: Math.max(24, Math.round(s.idle * pace)) } : s)) }));

  // supers per round by role (a fighter whose times aren't the default [1, 2] keeps his own: the Memory Shard's one recital)
  // and every super's golden moment onto the curve: GOLDEN.width frames wide, starting where it was authored (windup and
  // advance windows ride the windup's scaling in scaleMove; a taunt's, a recovery's or an opening's keep their start)
  const knob = bossKnob(d.id, 'supers');
  const byRole = role === 'zeroTrue' ? SUPERS.zeroTrue : role === 'boss' ? SUPERS.boss
    : role === 'champion' ? (h < SUPERS.early ? SUPERS.championEarly : SUPERS.champion) : (h < SUPERS.early ? SUPERS.fighterEarly : SUPERS.fighter);
  const tuneSup = (S, main) => {
    const out = { ...S };
    if (main && !S.inline) { const def = !S.times || (S.times[0] === 1 && S.times[1] === 2); out.times = knob || (def ? byRole : S.times); }
    if (S.window && (S.golden === 'windup' || S.golden === 'advance')) {
      const sm = d.moves[S.move + '*'] || d.moves[S.on || S.move];
      out.window = keepWidth(S.window, sm ? kOf(sm.windupFrames) : k);
    }
    if (out.window) out.window = [out.window[0], out.window[0] + goldW - 1];
    return out;
  };
  const superList = (d.superList || (d.super ? [d.super] : [])).map((S, i) => tuneSup(S, i === 0));
  const sup = superList[0] || d.super;
  // the six big bosses: the golden moment is a long stun (frames), not a knockdown
  const goldenStun = BOSSES.includes(d.id) ? (bossKnob(d.id, 'goldenStun') ?? GOLDEN_STUN[d.id]) : null;

  const strict = lerp(STRICT[0], STRICT[1], h);
  return {
    ...d,
    moves, stats, patterns, super: sup, superList, goldenStun,
    special: (d.special || []).map((s) => scaleSpecial(s, kOf)),
    exploits: (d.exploits || []).map((x) => scaleExploit(x, k, d.moves, moves, anchor)),
    antiStrategies: d.antiStrategies && d.antiStrategies.map((a) => strictAnti(a, strict)),
    getUp,
    adapt: lerp(ADAPT[0], ADAPT[1], h),
    goldenClean: Math.round(lerp(GOLDEN.clean[0], GOLDEN.clean[1], h)),
    difficulty: { slot, target, authored, k, h, role, starW, goldW, pace, strict, dmgK, zone: ZONE[C.id] },
  };
}

// the moves he throws in answer to the player's bad habits: his guard counter, and every anti-strategy's counter punches
const asArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
export function answerMoves(d) {
  const ids = new Set(typeof d.guardCounter === 'string' ? [d.guardCounter] : []);
  const add = (a) => { for (const id of [...asArr(a.counter), ...asArr(a.into)]) if (typeof id === 'string') ids.add(id); for (const v of Object.values(a.answers || {})) add(v); };
  for (const a of d.antiStrategies || []) add(a);
  // (only answer-only moves: a punch he also throws in his patterns is one of his tells, and follows the curve with them)
  const inPatterns = new Set((d.patterns || []).flatMap((p) => p.steps.map((x) => x.move)).filter(Boolean));
  return new Set([...ids].filter((id) => d.moves[id] && !inPatterns.has(id)));
}
// a window [a, b] moved by k with its width kept
function keepWidth(w, k) { const a = Math.max(0, Math.round(w[0] * k)); return [a, a + (w[1] - w[0])]; }
// one move: windup x k, the windows in it with it (a perfect hit keeps its width), the star window narrowed to starW
export function scaleMove(m, k, starW = 1, keepCounter = null, goldW = 99) { // keepCounter: 'start' | 'end' (see tuneFighter)
  if (!m || !m.windupFrames) return m;
  const W = Math.max(1, Math.round(m.windupFrames * k));
  const last = W - 1;
  const sc = (w) => w && [Math.min(last, Math.max(0, Math.round(w[0] * k))), Math.min(last, Math.max(0, Math.round(w[1] * k)))];
  const out = { ...m, windupFrames: W };
  if (m.counterWindow) {
    const len = m.counterWindow[1] - m.counterWindow[0];
    if (!keepCounter) out.counterWindow = sc(m.counterWindow);
    else if (keepCounter === 'start') { const a = Math.max(0, Math.min(last - len, m.counterWindow[0])); out.counterWindow = [a, Math.min(last, a + len)]; } // (same frames from the tell)
    else { const b = Math.min(last, W - (m.windupFrames - m.counterWindow[1])); out.counterWindow = [Math.max(0, b - len), b]; } // (same distance from the punch)
  }
  if (m.kdWindow) {
    // a super's golden moment is exactly goldW frames wide (it may grow early in the game) and stays inside the windup;
    // any other perfect hit only ever narrows
    const len = m.goldenHit ? Math.min(last, goldW - 1) : Math.min(m.kdWindow[1] - m.kdWindow[0], goldW - 1);
    const a = Math.max(0, Math.min(last - len, Math.round(m.kdWindow[0] * k)));
    out.kdWindow = [a, a + len];
  }
  if (m.recoveryKd) out.recoveryKd = [m.recoveryKd[0], m.recoveryKd[0] + (m.goldenHit ? goldW - 1 : Math.min(m.recoveryKd[1] - m.recoveryKd[0], goldW - 1))];
  if (m.starWindow) {
    const [a, b] = sc(m.starWindow), mid = (a + b) / 2, half = Math.max(0.5, ((b - a) * starW) / 2);
    out.starWindow = [Math.max(0, Math.round(mid - half)), Math.min(last, Math.round(mid + half))];
  }
  for (const key of ['quiet', 'cueFrame', 'minWindup']) if (typeof m[key] === 'number') out[key] = Math.round(m[key] * k);
  if (m.animation && (m.animation.windupHold || m.animation.windupRate)) {
    out.animation = { ...m.animation };
    if (m.animation.windupHold) out.animation.windupHold = Math.round(m.animation.windupHold * k);
    if (m.animation.windupRate) out.animation.windupRate = Math.max(2, Math.round(m.animation.windupRate * k));
  }
  return out;
}
// a modifier's own tells (the windups of the attacks it makes, its tempo floor) follow the fighter's
const SPECIAL_TELLS = ['tell', 'minWindup', 'lateTell'];
function scaleSpecial(s, kOf) {
  let out = s;
  for (const key of SPECIAL_TELLS) if (typeof s[key] === 'number') { if (out === s) out = { ...s }; out[key] = Math.round(s[key] * kOf(s[key])); }
  return out;
}
// an exploit whose window sits inside one of his windups moves with it (its width kept)
// (a fighter whose counter windows stay put, 'start' or 'end' anchored: his exploit windows do the same); a probe
// (the knowledge test's timed setup, `at: { move, t }`) keeps its distance from the end of that windup
function scaleExploit(x, k, from, to, fromEnd = false) {
  const T = x.trigger;
  let out = x;
  if (x.probe && x.probe.at && from[x.probe.at.move]) {
    const a = x.probe.at, W0 = from[a.move].windupFrames, W1 = to[a.move].windupFrames;
    out = { ...out, probe: { ...x.probe, at: { ...a, t: Math.max(0, W1 - (W0 - a.t)) } } };
  }
  if (!T || !T.frames || !T.state) return out;
  const states = Array.isArray(T.state) ? T.state : [T.state];
  if (states.length !== 1 || states[0] !== 'windup') return out;
  const mv = T.move && (Array.isArray(T.move) ? T.move[0] : T.move);
  const frames = fromEnd === 'end' && mv && from[mv] ? T.frames.map((v) => Math.max(0, v + to[mv].windupFrames - from[mv].windupFrames))
    : fromEnd === 'start' ? T.frames : keepWidth(T.frames, mv && from[mv] ? to[mv].windupFrames / from[mv].windupFrames : k);
  return { ...out, trigger: { ...T, frames } };
}
// anti-strategy strictness: s > 1 tightens (shorter streaks, sooner reactions), s < 1 loosens; floors keep each one sane
function strictAnti(a, s) {
  const o = { ...a };
  const down = (key, floor) => { if (typeof a[key] === 'number') o[key] = Math.max(floor, Math.round(a[key] / s)); };
  switch (a.type) {
    case 'jabSpam': down('streak', 2); break;
    case 'zoneBias': down('streak', 2); break;
    case 'rushing': down('count', 2); break;
    case 'dodgeBias': down('min', 3); break;
    case 'passivity': down('frames', 120); break;
    case 'starHoard': down('hold', 180); break;
    case 'turtling': if (typeof a.share === 'number') o.share = Math.max(0.2, +(a.share / s).toFixed(2)); break;
    case 'getUpMash': if (typeof a.mult === 'number') o.mult = +(1 + (a.mult - 1) * s).toFixed(2); break;
    default: break;
  }
  if (a.answers) o.answers = Object.fromEntries(Object.entries(a.answers).map(([key, v]) => [key, strictAnti(v, s)]));
  return o;
}

// ---------------------------------------------------------------------------------------------------------------
// THE CLOCK AND THE CHAMPIONSHIP ROUNDS (spec §4, §6, §9, A3; rebuilt 2026-10-03).
//
// The clock is the same for every fight (Career, Title Defense, Gauntlet, Practice): a round is 3:00 on the game clock, which
// runs 24 frames to a game second (72 real seconds); a big boss's round is 3:00 on a slower clock (30 frames to a game second,
// 90 real seconds), as his old bouts were. There are no judges: a fight ends by KO, TKO (three knockdowns in one round) or the
// player being knocked out. Rounds 1-3 are the fight as it always was; if nobody is down for good by the end of round 3 the fight
// goes into championship rounds (round 4, 5, ...), each one harder than the one before.
export const ROUND = { game: 180, frames: 24, bossFrames: 30 }; // game seconds in a round; frames a game second lasts (a boss's is slower)
export const roundFrames = (boss) => ROUND.game * (boss ? ROUND.bossFrames : ROUND.frames);
export const REGULATION = 3; // rounds before the championship rounds begin (a fighter's own `rounds`, the Will Shard's five, still holds)

// CHAMPIONSHIP: index 0 is the first championship round (round 4), index 1 the second (round 5), and so on; a round past the end of a
// list takes its last number. Everything here is a multiplier on what the fighter does in a normal round unless it says otherwise.
//   pace      his waits between combos (idles) x this: more frequent attacks
//   openings  how long a recovery or an `open` step stays open to a punch x this, he covers up for the rest (the timeline is never cut; a golden moment, a perfect hit and an armored super keep their whole window)
//   idle      the free hits he gives while standing idle (his idleHitLimit) x this, rounded down: 1 = as ever, 0 = none, he covers up at once
//   supers    EXTRA supers a round, on top of his role's SUPERS
//   damage    what his hits do x this
//   getUp     the health he gets back up with after a knockdown x this (his get-up table's own fraction): a nearly-beaten fighter cannot stand back up whole
//   oppHeal   his recovery between rounds x this (his own betweenRoundHeal): shrinks, then stops
//   youHeal   the player's mash recovery in the corner x this (the corner's cap): shrinks too
//   suddenFrom  the championship round (1 = round 4) from which the first knockdown by either fighter ends the fight: round 6 is index 3
export const CHAMPIONSHIP = {
  pace:     [0.7, 0.5, 0.25, 0.15, 0.12],
  openings: [0.85, 0.7, 0.55, 0.45, 0.4],
  idle:     [1, 0.5, 0, 0, 0],
  supers:   [0, 1, 3, 5, 6],
  damage:   [1.3, 2.6, 8.0, 12.0, 20.0],
  getUp:    [0.8, 0.6, 0.45, 0.35, 0.3],
  oppHeal:  [0.5, 0.15, 0, 0],
  youHeal:  [0.5, 0.1, 0, 0],
  suddenFrom: 3,
};
// the escalation of a round: `c` = how many championship rounds in (1 = round 4), 0 in a normal round
export function escalation(c) {
  if (c <= 0) return { c: 0, pace: 1, openings: 1, idle: 1, supers: 0, damage: 1, getUp: 1, oppHeal: 1, youHeal: 1, sudden: false };
  const at = (a) => a[Math.min(a.length, c) - 1];
  return { c, pace: at(CHAMPIONSHIP.pace), openings: at(CHAMPIONSHIP.openings), idle: at(CHAMPIONSHIP.idle), supers: at(CHAMPIONSHIP.supers), damage: at(CHAMPIONSHIP.damage), getUp: at(CHAMPIONSHIP.getUp),
    oppHeal: at(CHAMPIONSHIP.oppHeal), youHeal: at(CHAMPIONSHIP.youHeal), sudden: c >= CHAMPIONSHIP.suddenFrom };
}
