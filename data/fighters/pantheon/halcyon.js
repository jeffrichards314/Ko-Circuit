// HALCYON, THE UNDEFEATED — the boss at the top of the Pantheon (spec §18 A6). Three forms, health-based (spec §4,
// 2026-10-02): empty a form's health bar and he gets back up at full health, in the next light (three rounds on the slower boss clock, then the championship rounds):
//   DAWN   round 1   fast combos: a jab into a hook into a blow into an uppercut, four hits on 4-frame
//                    tells, each with its own defense. The light is low and rose-gold.
//   NOON   round 2   blinding: a bloom of white swallows his body and every windup opens with a flash.
//                    The only tell is his SHADOW, a small dark copy of his pose on the canvas to the left.
//   DUSK   round 3   slow, deep red and violet, and every hit he lands knocks you down. Slip them.
//                    A body shot into his slow windup slows him further.
// You win by knocking the last form out (every form first; the championship rounds follow round 3, §4). His arena's light changes with the form.
// His super is the OATH: all three forms throw it once or twice a round, a knockdown: slip it. Counter it on
// the glint and the sun stumbles.
// Halcyon difficulty: 4-frame tells, adaptive, hearts 12; three forms.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const link = (kind, name, o = {}) => mv(kind, W, { name, counterWindow: null, starWindow: null, punishStar: null, recoveryFrames: 4, noFake: true, ...o });
const lead = (kind, name, o = {}) => mv(kind, W, { name, counterWindow: [2, 4], starWindow: [2, 3], noFake: true, ...o, recoveryFrames: 4 });
const end = (kind, name, o = {}) => mv(kind, W, { name, counterWindow: null, starWindow: null, noFake: true, ...o });
// dusk: slow, and every hit is a knockdown
const dusk = (kind, name, windup, avoidBy, o = {}) => mv(kind, W, {
  name, knockdown: true, noFake: true, windupFrames: windup, activeFrames: 8, recoveryFrames: 44, damage: 26, avoidBy,
  counterWindow: [5, windup - 8], starWindow: [5, 8], punishStar: ['dodged'], sfx: { tell: 'groan', swing: 'swingHeavy' }, ...o,
});
const ring = { open: 0 };
void ring;

export default {
  id: 'halcyon',
  name: 'HALCYON',
  short: 'HALCYON',
  nickname: 'THE UNDEFEATED',
  circuit: 'halcyon',
  rank: 0,
  isChampion: true,
  card: {
    age: 1000,
    weight: 175,
    record: '0 LOSSES',
    hometown: 'THE GATE OF LIGHT',
    quote: 'NO ONE HAS CLIMBED THIS HIGH. THE SUN ALWAYS SETS ON A CHALLENGER.',
  },
  lines: { win: 'THE SUN ALWAYS WINS.', lose: 'THE SUN... HAS SET...' },

  build: 'medium',
  palette: 'halcyon',
  spriteLayers: 'halcyon',
  roundMusic: ['halcyonDawn', 'halcyonNoon', 'halcyonDusk'],

  // full health every form (each form is a phase: spec §4; between rounds he heals a little, like any boss)
  stats: stats({ health: 460, damageMult: 2.15, stunResistance: 7, starLossChance: 0.6, stunFrames: 48, hitstun: 12, betweenRoundHeal: 0.2 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 14 } }),

  moves: {
    // --- dawn: the combo kit (each combo's first punch is counterable; the rest chain at 15 frames) ---
    dJab: lead('jab', 'DAWN JAB', { sfx: { tell: 'chime' } }),
    dCross: lead('jabR', 'DAWN CROSS', { sfx: { tell: 'chime' } }),
    dHook: link('hook', 'FIRST LIGHT HOOK'),
    dHookL: link('hookL', 'FIRST LIGHT HOOK (L)'),
    dBody: link('bodyR', 'DAYBREAK BLOW'),
    dBodyL: link('body', 'DAYBREAK BLOW (L)'),
    dHookEnd: end('hook', 'FIRST RAY'),
    dUpperEnd: end('upper', 'RISING SUN', { damage: 17 }),
    dBodyEnd: end('bodyR', 'DAYBREAK BLOW'),
    // --- noon: single punches, on 4-frame tells, seen only in his shadow ---
    nJab: mv('jab', W, { name: 'NOON JAB', sfx: { tell: 'chime' } }),
    nCross: mv('jabR', W, { name: 'NOON CROSS', sfx: { tell: 'chime' } }),
    nHook: mv('hook', W, { name: 'ZENITH HOOK', sfx: { tell: 'chime' } }),
    nHookL: mv('hookL', W, { name: 'ZENITH HOOK (L)', sfx: { tell: 'chime' } }),
    nBody: mv('body', W, { name: 'HIGH NOON BLOW', sfx: { tell: 'chime' } }),
    nBodyR: mv('bodyR', W, { name: 'HIGH NOON BLOW (R)', sfx: { tell: 'chime' } }),
    nUpper: mv('upper', W, { name: 'SOLAR UPPERCUT', sfx: { tell: 'chime' } }),
    // --- dusk: slow, and every hit knocks you down ---
    dkStrike: dusk('hook', 'SETTING SUN', 24, ['dodgeL']),
    dkStrikeL: dusk('hookL', 'SETTING SUN (L)', 24, ['dodgeR']),
    dkSweep: dusk('sweep', 'LONG SHADOW', 26, ['duck']),
    dkFall: dusk('haymaker', 'THE LAST LIGHT', 30, ['dodgeL', 'dodgeR'], { counterWindow: [5, 22], starWindow: [5, 8] }),
    // --- his super, in every form ---
    oath: superMove('THE OATH', { windupFrames: 24, counterWindow: [5, 20], kdWindow: [13, 16], sfx: { tell: 'fanfare', swing: 'crash' } }),
  },

  patterns: [
    // DAWN
    { id: 'firstRays', set: 'dawn', weight: 3, fixed: true, steps: steps('i28 dJab dHookL dUpperEnd i38 dCross dBody dHookEnd i44') },
    { id: 'breaking', set: 'dawn', weight: 3, fixed: true, steps: steps('i26 dCross dHook dBodyL dUpperEnd i40 dJab dBody dBodyEnd i44') },
    { id: 'daylight', set: 'dawn', weight: 2, fixed: true, steps: steps('i24 dJab dHookL dBody dHookEnd i36 dCross dHook dUpperEnd i44') },
    // NOON
    { id: 'zenith', set: 'noon', weight: 3, steps: steps('i28 nJab i16 nHook i18 nBodyR i34 nUpper i28 nCross i16 nHookL i40') },
    { id: 'highSun', set: 'noon', weight: 3, steps: steps('i24 nBody i14 nHookL i16 nJab i30 nUpper i22 nBodyR i16 nHook i40') },
    // DUSK
    { id: 'sundown', set: 'dusk', weight: 3, steps: steps('i50 dkStrike i50 dkSweep i56 dkStrikeL i60 dkFall i70') },
    { id: 'longNight', set: 'dusk', weight: 3, steps: steps('i46 dkStrikeL i52 dkStrike i50 dkFall i62 dkSweep i70') },
  ],

  // his three forms are his phases (spec §4 "Boss phases"): each lasts until its health bar is emptied, not a round
  phases: [
    { name: 'DAWN', scout: 'FAST COMBOS: JAB, HOOK, BLOW, UPPERCUT, FOUR HITS ON TIGHT TELLS. EMPTY THE BAR AND THE LIGHT CHANGES.' },
    { name: 'NOON', scout: 'BLINDING: WHITE LIGHT SWALLOWS HIS BODY AND EVERY WINDUP OPENS WITH A FLASH. HIS SHADOW SHOWS WHERE HE IS.' },
    { name: 'DUSK', scout: 'SLOW, DEEP RED AND VIOLET, AND EVERY HIT HE LANDS KNOCKS YOU DOWN. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],
  super: { hit: 'body', move: 'oath', golden: 'windup', window: [13, 16], taunt: 50, shout: 'THE OATH!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], stayDown: 0.5, health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'shadowHead', type: 'stunTrigger', name: 'THE SHADOW\'S HEAD',
      trigger: { state: 'windup', test: 'noonForm', height: 'high', frames: [1, 6], clean: 30 },
      effect: { stun: 104, hits: 7, star: true, say: 'YOU HIT THE SUN!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'AT NOON EVERY WINDUP OPENS WITH A FLASH. THE FLASH LEAVES HIS HEAD EXPOSED FOR A MOMENT.' },
      scout: 'IN THE NOON FORM, A HEAD SHOT ON THE FIRST FRAMES OF ANY WINDUP (THE FLASH) COUNTS AS A COUNTER: STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'weighedDown', type: 'stunTrigger', name: 'WEIGHED DOWN',
      trigger: { on: 'custom' },
      effect: {},
      hint: { kind: 'visual', text: 'DUSK IS HEAVY. EVERY BLOW YOU LAND ON HIS BODY MAKES HIS WINDUP HEAVIER STILL.', hidden: true },
      scout: 'IN THE DUSK FORM, BODY SHOTS INTO HIS SLOW WINDUP EACH ADD 10 FRAMES TO IT (UP TO 30): IT BUYS YOU TIME.',
    },
    {
      id: 'firstRayMissed', type: 'quirk', name: 'THE FIRST RAY MISSES',
      trigger: { on: 'resolved', move: ['dUpperEnd', 'dHookEnd'], result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'THE RAY GOES WIDE!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE LAST HIT OF A DAWN COMBO THROWS ALL OF HIM AFTER IT.', hidden: true },
      scout: 'SLIP THE FINAL HIT OF A DAWN COMBO (THE HOOK OR THE UPPERCUT): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'sunRises', type: 'getUpMash', name: 'THE SUN RISES AGAIN', response: 'harder', punches: 3, mult: 1.3, say: 'THE SUN RISES!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
    {
      id: 'sunburn', type: 'turtling', name: 'A BLOCK IS A BURN', response: 'drain', span: 480, share: 0.45, every: 44, say: 'A BLOCK IS A BURN!',
      scout: 'BLOCK TOO MUCH AND YOUR GUARD BURNS: YOU LOSE A HEART EVERY SECOND YOU KEEP IT UP.',
    },
  ],
  scriptedMoments: [
    {
      id: 'dawnRush', name: 'THE DAWN RUSH', when: { left: 60, round: 1 }, say: 'THE DAWN RUSH!',
      steps: [{ idle: 18 }, { move: 'dJab' }, { move: 'dHookL' }, { move: 'dUpperEnd' }, { idle: 24 }, { move: 'dCross' }, { move: 'dBody' }, { move: 'dHookEnd' }],
    },
    {
      id: 'noonBlaze', name: 'HIGH NOON', when: { left: 60, round: 2 }, say: 'HIGH NOON!',
      steps: [{ idle: 18 }, { move: 'nJab' }, { idle: 14 }, { move: 'nHookL' }, { idle: 14 }, { move: 'nBodyR' }, { idle: 20 }, { move: 'nUpper' }],
    },
    {
      id: 'duskFalls', name: 'THE SUN SETS', when: { left: 60, round: 3 }, say: 'THE SUN SETS!',
      steps: [{ idle: 24 }, { move: 'dkStrike' }, { idle: 40 }, { move: 'dkStrikeL' }, { idle: 40 }, { move: 'dkFall' }],
    },
  ],
  special: [
    {
      type: 'phases',
      phases: [
        { from: 1, set: 'dawn', name: 'FORM I: DAWN', color: [31, 22, 16], palette: 'halcyon', shout: null, note: 'DAWN: FAST COMBOS. FOUR HITS, EACH WITH ITS OWN DEFENSE.' },
        { from: 2, set: 'noon', name: 'FORM II: NOON', color: [31, 31, 28], palette: 'halcyon.noon', shout: 'THE SUN AT NOON!', note: 'NOON: WATCH HIS SHADOW. THE FLASH BEFORE EACH WINDUP LEAVES HIS HEAD OPEN.' },
        { from: 3, set: 'dusk', name: 'FORM III: DUSK', color: [31, 12, 8], palette: 'halcyon.dusk', shout: 'THE SUN SETS!', note: 'DUSK: SLOW, AND EVERY HIT KNOCKS YOU DOWN. SLIP EVERYTHING.' },
      ],
    },
    { type: 'halcyon', slow: 10, max: 30 },
  ],
  titleDefense: null,
  gallery: 'HALCYON, THE UNDEFEATED. THREE FORMS, EACH AT FULL HEALTH: FAST AT DAWN, BLINDING AT NOON, SLOW AND DEADLY AT DUSK.',
  medals: { signature: { text: 'BREAK ALL THREE FORMS BY KNOCKOUT.', check: 'cueCount', cue: '!formBroken', n: 2 } },
  music: 'halcyonEntrance',
};
