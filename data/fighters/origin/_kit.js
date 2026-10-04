// ORIGIN's moves (2026-10-04, the secret final boss): the first fighter there ever was; every punch in the game is a copy of one of his. Everything he throws is
// built here once and shared by ORIGIN (the Gauntlet's) and ORIGIN TRUE FORM (the Title Defense's).
//
//   THE FIRST ARTS      FIRST JAB, CROSS, HOOK, BODY BLOW, UPPERCUT, LOW BLOW, FULL STRIDE: the Void's kit on 3-frame tells (tuned to his slot, data/difficulty.js)
//   BELT HALO           (`halo_L`, `halo_R`) belts from the halo round his head slam down from the sides. TWO belts glow, one after the other: the one that glows
//                       FIRST is the safe side (slip toward it); the other comes down on the far side. The finisher, THE WHOLE HALO (`hf_fin`), glows every belt at
//                       once and can only be blocked.
//   THE FIRST PUNCH    (`fp`) one enormous punch with a long windup in which the whole screen slows (the fight's time scale drops: src/fight/asc/origin.js)
//   EVERY ARENA         (`ea_go`...) the arena flickers between fragments of past arenas and he fights in that arena's champion's style: two of the champion's own
//                       blows, his echo (the warning) and his signature, in his colours. Four styles a throw, chosen as he throws it.
//   REWIND              (`rw_go`...) six blows; if one lands, time rewinds (the hit is undone) and the sequence replays faster. A clean run breaks the rewind:
//                       the golden moment (the recovery of its last blow) is only there then.
//   THE MEDLEY          (`md_go`...) signature supers of three different worlds chained into one combo, a new transition between each (a call that turns him into
//                       that world's colours).
//   TRUE FORM ONLY      AFTERIMAGES (`af_*`: his afterimage throws the blow again from the other side), THE RING OF FIRE (`rf_*`), COLLISION (`co_*`: two arena
//                       fragments meet in the middle and the shrapnel flies out) and THE FIRST ARENA, REWOUND (`fa_*`: First Punch, Every Arena and Rewind in one).
// Every blow has a visible tell and a defense that works, in an order that is the same every time (learnable): data/fighters/origin/*.js, tools/origin-test.mjs.
import { vm, only, longSteps, superMove } from '../void/_void.js';
import { signatureMoves } from '../void/signatures.js';
import { crystalMoves, CRYSTALS, HOLLOWED_COLORS } from '../void/crystals.js';
import { STYLES } from './styles.js';
import { posePath } from '../zero.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
export const SIG = signatureMoves();

// ---------------------------------------------------------------------------------------------------------------- the first arts
export const ARTS = {
  jab: vm('jab', { name: 'FIRST JAB', recoveryFrames: 18 }),
  cross: vm('jabR', { name: 'FIRST CROSS', recoveryFrames: 18 }),
  hook: vm('hook', { name: 'FIRST HOOK', recoveryFrames: 22 }),
  hookL: vm('hookL', { name: 'FIRST HOOK (L)', recoveryFrames: 22 }),
  body: vm('body', { name: 'FIRST BODY BLOW', recoveryFrames: 20 }),
  bodyR: vm('bodyR', { name: 'FIRST BODY BLOW (R)', recoveryFrames: 20 }),
  upper: vm('upper', { name: 'FIRST UPPERCUT', recoveryFrames: 24 }),
  sweep: vm('sweep', { name: 'FIRST LOW BLOW', recoveryFrames: 30 }),
  stride: vm('haymaker', { name: 'FIRST FULL STRIDE', recoveryFrames: 36 }),
};
const ARTS_LIST = Object.keys(ARTS);

// his answer to bad habits (a jab spammer, a rusher, a repeater): slow, so a 3-frame reply cannot come before a jab is over
ARTS.ans = { ...vm('hook', { name: 'THE FIRST ANSWER', recoveryFrames: 34 }), windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], damage: 18, noFake: true };

// ---------------------------------------------------------------------------------------------------------------- the belt halo
// `halo: { safe: 'L' | 'R', t: [first glow, second glow] }`: the windup's fractions at which the first (safe) and the other belt light. The belt that was
// lit second comes down on the far side, so the first one's side is where to go.
const haloMove = (safe, name, o = {}) => ({
  name, windupFrames: 14, activeFrames: 8, recoveryFrames: 24, damage: 16, height: 'high',
  avoidBy: [safe === 'L' ? 'dodgeL' : 'dodgeR'], counterWindow: null, starWindow: null, halo: { safe, t: [0.05, 0.5] },
  sfx: { tell: 'glowUp', swing: 'swingHeavy' },
  animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  ...o,
});
export const HALO = {
  halo_L: haloMove('L', 'BELT HALO (LEFT)'),
  halo_R: haloMove('R', 'BELT HALO (RIGHT)'),
  // THE WHOLE HALO: every belt lights at once and comes down on both sides: only a block holds it (a one-hit knockdown, the golden moment is early in its windup: a punch
  // that misses it leaves you in your own jab for 12 more frames, and a block cannot be raised from a jab: the golden moment of a block-only blow sits at least 15 frames
  // before it lands)
  hf_fin: { ...superMove('THE WHOLE HALO', { windupFrames: 26, avoidBy: ['block'], counterWindow: null, starWindow: null, kdWindow: [9, 10], punishStar: ['blocked'], sfx: { tell: 'gate', swing: 'crash' } }), halo: { safe: null, t: [0.05, 0.05] }, noFake: true },
  // the slams of the super: the same belts, tighter
  hf_L: haloMove('L', 'BELT HALO (LEFT)', { recoveryFrames: 22 }),
  hf_R: haloMove('R', 'BELT HALO (RIGHT)', { recoveryFrames: 22 }),
};

// ---------------------------------------------------------------------------------------------------------------- the first punch
export const FIRST_PUNCH = {
  fp: {
    name: 'THE FIRST PUNCH', knockdown: true, noFake: true, windupFrames: 56, activeFrames: 12, recoveryFrames: 60, damage: 40, avoidBy: D2, counterWindow: null, starWindow: null,
    slowmo: true, kdWindow: [37, 38], sfx: { tell: 'eclipseWarn', swing: 'crash' },
    animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 28, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  },
};

// ---------------------------------------------------------------------------------------------------------------- every arena
// A style's blows are the champion's own, retimed to a 6-frame tell; their poses and sounds are his (ORIGIN's sprite layers carry the poses).
function styleBlow(champ, id, tag) {
  const src = champ.moves[id], A = src.animation, map = (l) => l.map((p) => posePath(champ, p));
  return {
    ...src, name: src.name, windupFrames: 6, counterWindow: null, starWindow: null, kdWindow: undefined, recoveryKd: undefined, punishStar: undefined, openAfter: undefined, cancels: 0, noFake: true,
    knockdown: false, recoveryFrames: Math.max(src.recoveryFrames, 16), sfx: { ...src.sfx }, style: tag,
    animation: { windup: map(A.windup.slice(-1)), active: map(A.active), recovery: map(A.recovery) },
  };
}
export const STYLE_MOVES = {};
for (const S of STYLES) {
  STYLE_MOVES[`flick_${S.id}`] = {
    name: 'THE ARENA FLICKERS', call: true, feint: true, noFake: true, windupFrames: 14, activeFrames: 0, recoveryFrames: 4, damage: 0, avoidBy: ALL4, counterWindow: [2, 12], starWindow: null, cancels: 0,
    arena: S.circuit, style: S.id, sfx: { tell: 'glitch' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] },
  };
  S.blows.forEach((b, i) => { STYLE_MOVES[`st_${S.id}_${i + 1}`] = styleBlow(S.sig.champ, b, S.id); });
  delete STYLE_MOVES[`st_${S.id}_1`].noFake; STYLE_MOVES[`st_${S.id}_1`].noFake = true;
}
export const EVERY_ARENA = {
  ea_go: { name: 'EVERY ARENA', call: true, feint: true, noFake: true, windupFrames: 20, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 18], starWindow: null, cancels: 0, sfx: { tell: 'glitch' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  // the last arena: the flicker stops on the first one (the golden moment is in its windup)
  ea_fin: { name: 'THE FIRST ARENA', call: true, feint: true, noFake: true, windupFrames: 26, activeFrames: 0, recoveryFrames: 20, damage: 0, avoidBy: ALL4, counterWindow: null, starWindow: null, kdWindow: [15, 16], cancels: 0, arena: 'origin', style: 'origin', sfx: { tell: 'rewind' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
};
const styleChain = (id) => [`flick_${id}`, `st_${id}_1`, `st_${id}_2`, `echo_${id}`, `sig_${id}`];

// ---------------------------------------------------------------------------------------------------------------- rewind
// Six blows and a last one (the golden moment is in the recovery of the last, and only when no blow of the run landed). `rewind: true` marks the blows a
// hit rewinds. The recoveries are the kit's own: tight in the replays (src/fight/asc/origin.js).
const rw = (kind, name, o) => ({ ...vm(kind, { name, recoveryFrames: 18, ...o }), rewind: true, noFake: true });
export const REWIND = {
  rw_go: { name: 'REWIND', call: true, feint: true, noFake: true, windupFrames: 22, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 20], starWindow: null, cancels: 0, rewind: true, sfx: { tell: 'rewind' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  rw_1: rw('jab', 'REPLAY: JAB'), rw_2: rw('hook', 'REPLAY: HOOK'), rw_3: rw('bodyR', 'REPLAY: BODY BLOW', { recoveryFrames: 20 }), rw_4: rw('upper', 'REPLAY: UPPERCUT', { recoveryFrames: 22 }),
  rw_5: rw('jabR', 'REPLAY: CROSS'), rw_6: rw('hookL', 'REPLAY: HOOK (L)', { recoveryFrames: 22 }),
  // the last: a slow slip. Its recovery is the golden moment of a clean run
  rw_fin: { ...vm('haymaker', { name: 'LAST SECOND', recoveryFrames: 40, windupFrames: 14 }), rewind: true, noFake: true, recoveryKd: [5, 6], knockdown: false },
};
export const REWIND_CHAIN = ['rw_1', 'rw_2', 'rw_3', 'rw_4', 'rw_5', 'rw_6', 'rw_fin'];

// ---------------------------------------------------------------------------------------------------------------- the medley
// Worlds: where the signatures come from. A transition (`tr_<world>`) is a call that turns him into that world's colours and names it; then the signature's own
// echo (the warning) and the signature. (The Void's are the Hollowed's big blows: only the true form's.)
export const MEDLEY_WORLDS = {
  road: ['gus', 'brody', 'mcbride', 'midnight', 'rex', 'baron', 'maestro', 'avalanche'],
  warp: ['mirror', 'karver', 'warden', 'eclipse'],
  pantheon: SIG.zones.pantheon,
  underworld: SIG.zones.underworld,
};
export const WORLD_NAMES = { road: 'THE ROAD', warp: 'THE WARPED CITY', pantheon: 'THE PANTHEON', underworld: 'THE UNDERWORLD', void: 'THE VOID' };
export const MEDLEY_MOVES = {
  md_go: { name: 'THE MEDLEY', call: true, feint: true, noFake: true, windupFrames: 20, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 18], starWindow: null, cancels: 0, sfx: { tell: 'whoosh' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  md_fin: { name: 'ALL OF THEM', call: true, feint: true, noFake: true, windupFrames: 26, activeFrames: 0, recoveryFrames: 20, damage: 0, avoidBy: ALL4, counterWindow: null, starWindow: null, kdWindow: [15, 16], cancels: 0, sfx: { tell: 'echo' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
};
for (const w of [...Object.keys(WORLD_NAMES)]) {
  MEDLEY_MOVES[`tr_${w}`] = { name: WORLD_NAMES[w], call: true, feint: true, noFake: true, windupFrames: 12, activeFrames: 0, recoveryFrames: 4, damage: 0, avoidBy: ALL4, counterWindow: [2, 10], starWindow: null, cancels: 0, world: w, sfx: { tell: 'glitch' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } };
}
// the Void's signatures: the Hollowed's own big blows, each behind a short call that turns him their colour
const CRY = crystalMoves();
export const VOID_SIGS = {};
for (const c of CRYSTALS) {
  VOID_SIGS[`vecho_${c.key}`] = {
    name: `${c.skill} CRYSTAL`, echo: c.id, echoName: `${c.skill} CRYSTAL`, echoColor: HOLLOWED_COLORS[c.id], feint: true, call: true, noFake: true,
    windupFrames: 22, activeFrames: 0, recoveryFrames: 1, damage: 0, avoidBy: ALL4, counterWindow: [3, 19], starWindow: null, cancels: 0,
    animation: { windup: ['overheadTell1'], active: ['overheadTell2'], recovery: ['overheadTell2'] },
  };
  const fin = CRY[`cx_${c.key}_fin`];
  VOID_SIGS[`vsig_${c.key}`] = { ...fin, name: c.finName, windupFrames: 3, kdWindow: undefined, recoveryKd: undefined, super: undefined, goldenHit: undefined, counterWindow: null, starWindow: null, knockdown: true, noFake: true };
}

// ---------------------------------------------------------------------------------------------------------------- true form only
const af = (kind, name, o = {}) => ({ ...vm(kind, { name, recoveryFrames: 20, ...o }), noFake: true, afterimage: true });
export const AFTERIMAGE = {
  // a blow, then his afterimage (a ghost of him on the far side) throws the mirror of it: the far side's slip
  af_go: { name: 'AFTERIMAGES', call: true, feint: true, noFake: true, windupFrames: 18, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 16], starWindow: null, cancels: 0, sfx: { tell: 'shadowStep' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  af_hook: af('hook', 'FIRST HOOK'), af_hookL: af('hookL', 'AFTERIMAGE: HOOK (L)', { windupFrames: 8 }),
  af_body: af('body', 'FIRST BODY BLOW'), af_bodyR: af('bodyR', 'AFTERIMAGE: BODY BLOW (R)', { windupFrames: 8 }),
  af_upper: af('upper', 'FIRST UPPERCUT', { recoveryFrames: 22 }), af_upperG: af('upper', 'AFTERIMAGE: UPPERCUT', { windupFrames: 9, recoveryFrames: 22 }),
  af_fin: { ...superMove('THE SHADOW OF THE FIRST', { windupFrames: 28, avoidBy: D2, counterWindow: null, starWindow: null, kdWindow: [17, 18], punishStar: ['dodged'], sfx: { tell: 'shadowStep', swing: 'crash' } }), afterimage: true, noFake: true },
};
export const AFTERIMAGE_CHAIN = ['af_hook', 'af_hookL', 'af_body', 'af_bodyR', 'af_upper', 'af_upperG', 'af_fin'];

const rf = (kind, name, o = {}) => ({ ...vm(kind, { name, ...o }), noFake: true, ring: true });
export const FIRE_RING = {
  rf_go: { name: 'THE RING OF FIRE', call: true, feint: true, noFake: true, windupFrames: 20, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 18], starWindow: null, cancels: 0, sfx: { tell: 'flame' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  rf_low: rf('sweep', 'RING SWEEP', { recoveryFrames: 32, sfx: { tell: 'flame', swing: 'swingHeavy' } }),
  rf_rise: rf('upper', 'RING RISES', { recoveryFrames: 26, sfx: { tell: 'flame', swing: 'swingHeavy' } }),
  rf_squeeze: rf('body', 'RING TIGHTENS', { recoveryFrames: 24, avoidBy: ['block'], sfx: { tell: 'flame', swing: 'swingHeavy' } }),
  rf_fin: { ...superMove('THE FIRE CLOSES', { windupFrames: 28, avoidBy: ['block'], counterWindow: null, starWindow: null, kdWindow: [9, 10], punishStar: ['blocked'], sfx: { tell: 'flame', swing: 'crash' } }), ring: true, noFake: true },
};
export const FIRE_RING_CHAIN = ['rf_low', 'rf_rise', 'rf_low', 'rf_squeeze', 'rf_rise', 'rf_squeeze', 'rf_fin'];

const co = (kind, name, o = {}) => ({ ...vm(kind, { name, ...o }), noFake: true, fragment: true });
export const COLLISION = {
  co_go: { name: 'COLLISION', call: true, feint: true, noFake: true, windupFrames: 20, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 18], starWindow: null, cancels: 0, sfx: { tell: 'rumble' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  // two fragments meet in the middle: either slip clears it; the shrapnel flies to one side, so the slip must be to the other
  co_in: co('haymaker', 'THE FRAGMENTS MEET', { windupFrames: 10, recoveryFrames: 30, sfx: { tell: 'rumble', swing: 'crash' } }),
  co_shrapL: co('hook', 'SHRAPNEL (LEFT)', { windupFrames: 6, recoveryFrames: 20 }),
  co_shrapR: co('hookL', 'SHRAPNEL (RIGHT)', { windupFrames: 6, recoveryFrames: 20 }),
  co_fin: { ...superMove('THE WORLD ON TOP OF YOU', { windupFrames: 28, avoidBy: D2, counterWindow: null, starWindow: null, kdWindow: [17, 18], punishStar: ['dodged'], sfx: { tell: 'rumble', swing: 'crash' } }), fragment: true, noFake: true },
};
export const COLLISION_CHAIN = ['co_in', 'co_shrapL', 'co_in', 'co_shrapR', 'co_in', 'co_shrapL', 'co_shrapR', 'co_fin'];

// THE FIRST ARENA, REWOUND: the first punch, the arenas and the rewind in one (the first punch's windup is shorter than the real one's, and not golden)
export const FINAL_COMBO = {
  fa_go: { name: 'THE BEGINNING, REWOUND', call: true, feint: true, noFake: true, windupFrames: 24, activeFrames: 0, recoveryFrames: 6, damage: 0, avoidBy: ALL4, counterWindow: [2, 22], starWindow: null, cancels: 0, rewind: true, sfx: { tell: 'rewind' }, animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] } },
  fa_punch: { ...FIRST_PUNCH.fp, name: 'THE FIRST PUNCH', windupFrames: 40, kdWindow: undefined, rewind: true, recoveryFrames: 40, damage: 30, knockdown: false },
  fa_fin: { ...vm('haymaker', { name: 'THE LAST SECOND', recoveryFrames: 44, windupFrames: 16 }), rewind: true, noFake: true, recoveryKd: [5, 6], knockdown: false },
};

// ---------------------------------------------------------------------------------------------------------------- everything
export const ALL_MOVES = () => ({
  ...ARTS, ...HALO, ...FIRST_PUNCH, ...STYLE_MOVES, ...EVERY_ARENA, ...REWIND, ...MEDLEY_MOVES, ...SIG.moves, ...VOID_SIGS,
});
export const TRUE_MOVES = () => ({ ...AFTERIMAGE, ...FIRE_RING, ...COLLISION, ...FINAL_COMBO });
export { ARTS_LIST, styleChain, only, longSteps, ALL4, D2 };
export const VOID_SIG_KEYS = CRYSTALS.map((c) => c.key);
