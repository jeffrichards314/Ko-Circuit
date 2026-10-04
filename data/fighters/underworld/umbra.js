// #104 Umbra — Underworld VI. A pale thing with no colour of its own, and a shadow that doesn't match it. HIS SHADOW ATTACKS BY
// ITSELF: a dark copy of him lies on the canvas to one side of the ring, and every so often it rises, raises a fist in a tell (a low
// hum, the cut-out lighting up) and strikes from that side. Slip away from the side it's on. Umbra himself keeps fighting all the while (and
// the shadow's strikes are kept clear of his own: never two at once). A punch that lands on Umbra while his shadow is winding up
// PINS it to him: the strike never comes and he's stunned.
// His super is the TOTAL ECLIPSE: slip it; counter it on the glint.
// Underworld difficulty: 3-frame tells (a lean fighter), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';

const W = 3;
const sh = { swing: 'swingHeavy' };
// the shadow's strikes: a hook or a body blow from each side (slip away from it) and an uppercut from either
const strike = (kind, name, o = {}) => mv(kind, W, { name, strike: true, counterWindow: null, starWindow: null, kdWindow: null, punishStar: null, noFake: true, sfx: sh, ...o });

export default {
  id: 'umbra',
  name: 'UMBRA',
  short: 'UMBRA',
  nickname: 'THE MAN AND HIS SHADOW',
  circuit: 'u6',
  rank: 3,
  isChampion: false,
  card: { age: '???', weight: 132, record: '1-0 1KO', hometown: 'THE GATE\'S FLOOR', quote: 'DON\'T LOOK AT ME. LOOK AT WHAT I\'M STANDING NEXT TO.' },
  lines: { win: 'IT WAS BEHIND YOU.', lose: 'MY... SHADOW... LEFT ME...' },

  build: 'lean',
  palette: 'umbra',
  spriteLayers: 'umbra',

  stats: stats({ health: 380, damageMult: 2.0, stunResistance: 5, starLossChance: 0.6, stunFrames: 46, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),
  guardCounter: 'dusk',

  moves: {
    jab: mv('jab', W, { name: 'UMBRAL JAB', sfx: { tell: 'whisper' } }),
    crescent: mv('hook', W, { name: 'CRESCENT HOOK', sfx: { tell: 'whisper', swing: 'swingHeavy' } }),
    penumbra: mv('body', W, { name: 'PENUMBRA', sfx: { tell: 'whisper' } }),
    dusk: mv('upper', W, { name: 'DUSK UPPERCUT', sfx: { tell: 'whisper', swing: 'swingHeavy' } }),
    // the shadow's own strikes (their windup is the modifier's `tell`; their defense is away from the shadow's side)
    shHookL: strike('hookL', 'SHADOW HOOK', { avoidBy: ['dodgeR', 'duck'], damage: 13 }),
    shHookR: strike('hook', 'SHADOW HOOK', { avoidBy: ['dodgeL', 'duck'], damage: 13 }),
    shBodyL: strike('body', 'SHADOW BLOW', { avoidBy: ['block', 'dodgeR'], damage: 12 }),
    shBodyR: strike('bodyR', 'SHADOW BLOW', { avoidBy: ['block', 'dodgeL'], damage: 12 }),
    shUpper: strike('upper', 'SHADOW UPPERCUT', { avoidBy: ['dodgeL', 'dodgeR'], damage: 15 }),
    eclipse: superMove('TOTAL ECLIPSE', { windupFrames: 18, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'hum', swing: 'crash' } }),
  },

  patterns: [
    { id: 'dim', weight: 3, when: { rounds: [1] }, steps: steps('i34 jab i32 penumbra i30 crescent i36 dusk i42 jab i30 crescent i50') },
    { id: 'gloaming', weight: 3, steps: steps('i28 crescent i26 jab i28 penumbra i34 dusk i32 crescent i28 penumbra i46') },
    { id: 'night', weight: 2, when: { health: [0, 0.5] }, steps: steps('i22 dusk i20 crescent i20 penumbra i22 jab i22 dusk i24 crescent i34') },
  ],

  super: { hit: 'body', move: 'eclipse', golden: 'windup', window: [9, 12], taunt: 44, shout: 'TOTAL ECLIPSE!', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'pinned', type: 'stunTrigger', name: 'PINNED SHADOW',
      trigger: { on: 'custom' },
      effect: { stun: 104, hits: 6, say: 'THE SHADOW IS PINNED!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'WHEN THE SHADOW RISES TO STRIKE, IT IS ONLY HIS SHADOW: ANYTHING THAT HITS HIM HITS IT TOO.' },
      scout: 'LAND A PUNCH ON UMBRA WHILE HIS SHADOW IS WINDING UP: THE STRIKE IS CANCELLED AND HE IS STUNNED FOR 6 HITS.',
    },
    {
      id: 'castOut', type: 'quirk', name: 'HIS SHADOW LAGS',
      trigger: { on: 'resolved', move: 'dusk', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 6, star: [0, 38] }, say: 'HIS SHADOW LAGS BEHIND!', sfx: 'whoosh' },
      hint: { kind: 'visual', text: 'A MISSED UPPERCUT DRAGS HIM UP OFF THE CANVAS AND HIS SHADOW STAYS BEHIND.', hidden: true },
      scout: 'SLIP HIS DUSK UPPERCUT: HIS SHADOW LAGS AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'shadowPresses', type: 'getUpMash', name: 'THE SHADOW PRESSES', response: 'harder', punches: 3, mult: 1.35, say: 'THE SHADOW PRESSES!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 35% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'longShadow', name: 'THE LONG SHADOW', when: { left: 70 }, say: 'THE SHADOW LENGTHENS...', steps: [{ idle: 20 }, { move: 'jab' }, { idle: 30 }, { move: 'crescent' }, { idle: 30 }, { move: 'dusk' }] },
  ],
  special: [{
    type: 'shadow', tell: 22, gap: [150, 250], first: 210, dx: 64, ghost: 'umbra.shade', hot: 'umbra.shade.hot', tellSfx: 'hum', pin: 'pinned',
    strikes: [{ id: 'shHookL', side: -1 }, { id: 'shHookR', side: 1 }, { id: 'shBodyL', side: -1 }, { id: 'shBodyR', side: 1 }, { id: 'shUpper', side: -1 }, { id: 'shUpper', side: 1 }],
  }],
  titleDefense: null,
  gallery: 'A MAN AND HIS SHADOW, AND THE SHADOW FIGHTS ON ITS OWN. SLIP AWAY FROM THE SIDE IT RISES ON.',
  medals: { signature: { text: 'PIN HIS SHADOW TWICE.', check: 'cueCount', cue: '!shadowPinned', n: 2 } },
  music: 'umbraWalkup',
};
