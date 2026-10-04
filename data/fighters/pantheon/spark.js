// #69 Spark — Pantheon V, the Thunder Forge. Live wire in shorts. When one of his hits lands he
// CHARGES you: he crackles white-yellow, and his next punch, landed or not, does DOUBLE damage. Slip
// the doubled punch and he stays charged until one lands, so get out of the way of everything
// until he's spent it, or ground him: a body shot while he's crackling and idle.
// His super is the LIGHTNING ROD: he thrusts a glove to the sky and the sky answers. A knockdown:
// slip it. Counter it on the glint and it strikes him.
// Pantheon V difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;

export default {
  id: 'spark',
  name: 'SPARK',
  short: 'SPARK',
  nickname: 'THE LIVE WIRE',
  circuit: 'p5',
  rank: 2,
  isChampion: false,
  card: {
    age: 19,
    weight: 130,
    record: '31-4 22KO',
    hometown: 'THE BELLOWS ROOM',
    quote: 'GOT A LIGHT? I\'M ALL OUT OF... NO, I\'M ALL IN. I\'M ALL IN!',
  },
  lines: { win: 'BZZZT! GOTCHA!', lose: 'BLEW A... FUSE...' },

  build: 'lean',
  palette: 'spark',
  spriteLayers: 'spark',

  stats: stats({ health: 290, damageMult: 2.0, stunFrames: 42, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 8 } }),

  moves: {
    jab: mv('jab', W, { name: 'ZAP JAB', recoveryFrames: 18, sfx: { tell: 'zap' } }),
    jabR: mv('jabR', W, { name: 'ZAP CROSS', recoveryFrames: 18, sfx: { tell: 'zap' } }),
    hook: mv('hook', W, { sfx: { tell: 'zap' } }),
    hookL: mv('hookL', W, { sfx: { tell: 'zap' } }),
    body: mv('body', W, { sfx: { tell: 'zap' } }),
    bodyR: mv('bodyR', W, { sfx: { tell: 'zap' } }),
    upper: mv('upper', W, { name: 'STATIC UPPERCUT', sfx: { tell: 'zap' } }),
    // the super: a glove to the sky, and the sky answers
    lightningRod: superMove('LIGHTNING ROD', { sfx: { tell: 'crackle', swing: 'thunder' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'shortCircuit', weight: 3, when: { rounds: [1] }, steps: steps('i26 jab i14 jabR i22 hookL i34 upper i26 bodyR i16 hook i40') },
    { id: 'liveWire', weight: 3, steps: steps('i22 hook i14 jab i14 bodyR i30 upper i22 jabR i16 hookL i36') },
    { id: 'arcFlash', weight: 2, when: { rounds: [2, 3] }, steps: steps('i18 jabR i12 jab i12 hookL i26 body i16 upper i22 jab i12 jabR i36') },
  ],

  super: { hit: 'body', move: 'lightningRod', golden: 'windup', window: [10, 13], taunt: 44, shout: 'LIGHTNING ROD!', times: [1, 2] },

  guardCounter: 'upper', // (his quickest punches would give a swinger no time to slip)
  getUpTable: GETUP,


  exploits: [
    {
      id: 'grounded', type: 'stunTrigger', name: 'GROUNDED',
      trigger: { state: 'idle', test: 'sparkCharged', height: 'low', clean: 30 },
      effect: { stun: 84, hits: 5, star: true, say: 'GROUNDED!', sfx: 'zap' },
      hint: { kind: 'visual', text: 'WHILE HE CRACKLES, THE CHARGE RUNS THROUGH HIS WHOLE BODY LOOKING FOR A WAY OUT.' },
      scout: 'A BODY SHOT WHILE HE IS CRACKLING (CHARGED) AND STANDING STILL GROUNDS HIM: STUNNED FOR 5 HITS, THE FIRST A STAR, AND THE CHARGE IS GONE.',
    },
    {
      id: 'shortedOut', type: 'quirk', name: 'SHORTED OUT',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 76, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'SHORTED OUT!', sfx: 'zap' },
      hint: { kind: 'visual', text: 'THE STATIC UPPERCUT ARCS OFF HIS GLOVE AND LEAVES HIM DAZED IF IT MISSES.', hidden: true },
      scout: 'SLIP HIS STATIC UPPERCUT: HE SHORTS OUT AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'staticDischarge', type: 'rushing', name: 'STATIC DISCHARGE', span: 150, count: 2, counter: ['upper'], say: 'STATIC DISCHARGE!',
      scout: 'SWING AT HIS GLOVES OR AT THIN AIR TWICE IN A ROW AND A STATIC DISCHARGE ARCS BACK AT YOU AT ONCE.',
    },
  ],
  scriptedMoments: [
    {
      id: 'overload', name: 'OVERLOAD', when: { left: 60 }, say: 'OVERLOAD!',
      steps: [{ idle: 16 }, { move: 'jab' }, { idle: 14 }, { move: 'jabR' }, { idle: 14 }, { move: 'hookL' }, { idle: 30 }, { move: 'upper' }],
    },
  ],
  special: [{ type: 'shock', mult: 2, frames: 480, hot: 'spark.hot', dischargeOn: 'grounded', arc: [24, 30, 31] }],
  titleDefense: null,
  gallery: 'LIVE WIRE IN SHORTS. WHEN HE HITS YOU HE CHARGES: HIS NEXT HIT DOES DOUBLE.',
  medals: { signature: { text: 'NEVER LET HIM CHARGE YOU.', check: 'noCue', cue: '!charged' } },
  music: 'sparkWalkup',
};
