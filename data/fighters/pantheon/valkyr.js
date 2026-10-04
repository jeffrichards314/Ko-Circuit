// #77 Valkyr — Pantheon VII, the Summit. She fights from the sky. Between her jabs she leaves the
// top of the screen altogether, and all you see is her SHADOW on the canvas: a dark ellipse that
// grows as she drops, and sits to the side she'll land on. A shadow to your LEFT is a dive to your
// left: slip RIGHT. A shadow on the RIGHT: slip LEFT. A shadow dead centre and she's coming straight
// down: slip either way. The bigger the shadow, the closer she is.
// Her super is VALHALLA: the biggest shadow you've seen, dead centre, a knockdown. Slip it and hit her
// on the way out and she goes down instead.
// Pantheon VII difficulty: 5-frame ground tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const drop = (side, o = {}) => ({
  name: side < 0 ? 'DIVE (LEFT)' : side > 0 ? 'DIVE (RIGHT)' : 'DIVE (CENTRE)',
  dive: side, noFake: true,
  windupFrames: 30, activeFrames: 6, recoveryFrames: 34, damage: 18,
  avoidBy: side < 0 ? ['dodgeR'] : side > 0 ? ['dodgeL'] : ['dodgeL', 'dodgeR'],
  counterWindow: null, starWindow: null, punishStar: ['dodged'],
  sfx: { tell: 'whoosh', swing: 'swingHeavy' },
  animation: { windup: ['overheadTell2'], active: ['overhead1'], recovery: ['overheadRecover', 'idle1'] },
  ...o,
});

export default {
  id: 'valkyr',
  name: 'VALKYR',
  short: 'VALKYR',
  nickname: 'THE DIVER',
  circuit: 'p7',
  rank: 4,
  isChampion: false,
  card: {
    age: 26,
    weight: 141,
    record: '44-1 38KO',
    hometown: 'THE TOP OF THE SKY',
    quote: 'LOOK DOWN. LOOK AT YOUR FEET. THAT\'S ME.',
  },
  lines: { win: 'FROM ON HIGH.', lose: 'I FELL... FOR ONCE...' },

  build: 'lean',
  palette: 'valkyr',
  spriteLayers: 'valkyr',

  stats: stats({ health: 290, damageMult: 2.1, stunFrames: 42 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 12 } }),

  moves: {
    jab: mv('jab', W, { sfx: { tell: 'whoosh' } }),
    jabR: mv('jabR', W, { sfx: { tell: 'whoosh' } }),
    hook: mv('hook', W),
    hookL: mv('hookL', W),
    body: mv('body', W),
    bodyR: mv('bodyR', W),
    diveL: drop(-1),
    diveR: drop(1),
    diveC: drop(0),
    valhalla: drop(0, { name: 'VALHALLA', knockdown: true, windupFrames: 34, recoveryFrames: 46, damage: 30, punishStar: null }),
  },

  patterns: [
    { id: 'soaring', weight: 3, when: { rounds: [1] }, steps: steps('i26 jab i14 diveL i26 hookL i18 bodyR i30 diveC i28 jabR i40') },
    { id: 'stoop', weight: 3, steps: steps('i22 diveR i26 jab i14 hook i16 body i28 diveL i24 diveC i40') },
    { id: 'updraught', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 diveC i22 hookL i14 jabR i26 diveR i20 diveL i28 bodyR i16 hook i38') },
  ],

  super: { hit: 'head', move: 'valhalla', golden: 'recovery', window: [16, 20], taunt: 46, shout: 'VALHALLA!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'hardLanding', type: 'quirk', name: 'A HARD LANDING',
      trigger: { on: 'resolved', move: 'diveC', result: 'dodged' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'A HARD LANDING!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE STRAIGHT-DOWN DIVE HAS NOWHERE TO GO BUT THE FLOOR.', hidden: true },
      scout: 'SLIP HER STRAIGHT-DOWN DIVE: SHE LANDS HARD AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'wingClip', type: 'stunTrigger', name: 'CLIPPED IN FLIGHT',
      trigger: { state: 'windup', move: 'hookL', side: 'R', height: 'high', counter: true, frames: [3, 6] },
      effect: { stun: 90, hits: 5, star: true, say: 'CLIPPED!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'HER LEFT HOOK ENDS WITH A RUSTLE OF FEATHERS, HALF A BEAT LATE.' },
      scout: 'A RIGHT-HAND HEAD COUNTER ON THE LATE FRAMES OF HER LEFT HOOK STUNS HER FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'circlesOverhead', type: 'earlyDodge', name: 'CIRCLES OVERHEAD', response: 'hold', moves: ['diveL', 'diveR', 'diveC'], say: 'SHE CIRCLES!',
      scout: 'SLIP EARLY, WHILE THE SHADOW IS STILL SMALL, AND SHE HOLDS THE DIVE SO IT LANDS AS YOUR SLIP RUNS OUT: WAIT FOR THE BIG SHADOW.',
    },
  ],
  scriptedMoments: [
    {
      id: 'squall', name: 'A SQUALL', when: { left: 60 }, say: 'A SQUALL!',
      steps: [{ idle: 18 }, { move: 'diveL' }, { idle: 22 }, { move: 'diveR' }, { idle: 22 }, { move: 'diveC' }],
    },
  ],
  special: [{ type: 'dive', inFrames: 10, side: 34, height: 190, back: 14 }],
  titleDefense: null,
  gallery: 'A DIVER. HER SHADOW ON THE CANVAS GROWS AS SHE DROPS, AND SHOWS WHICH SIDE SHE\'LL LAND ON.',
  medals: { signature: { text: 'SLIP THREE DIVES FROM THE LEFT.', check: 'moveResult', move: 'diveL', result: 'dodged', n: 3 } },
  music: 'valkyrWalkup',
};
