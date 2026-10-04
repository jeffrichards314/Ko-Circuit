// #76 Aldric the Winged — Pantheon VII, the Summit. An angel in plate, and his wings tell you everything.
// Before a combo he FLARES them: a call, a shout of feathers, and the spread of the wings is the
// number of hits to come. A narrow flare is ONE hit. A wider one is TWO. The full spread, wings to
// the edges of the ring, is THREE. Each hit of a chain is its own punch with its own defense, and they
// come close together: slip the hook, slip the body blow the other way, and get under the last.
// Counter the flare itself (before the first hit) and the whole chain is cancelled.
// His super is the SKY BREAKER: wings up and all his weight down. A knockdown: slip it. Counter it on the
// glint and it's his wings that break.
// Pantheon VII difficulty: 4-frame chain tells, fixed chains between shuffled jabs, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const flare = (n, name) => ({
  name, feint: true, call: true, noFake: true,
  windupFrames: 14, activeFrames: 0, recoveryFrames: 4, damage: 0,
  avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
  counterWindow: [2, 12], starWindow: [2, 5], cancels: n,
  sfx: { tell: 'whoosh' },
  animation: { windup: [`flare${n}`], active: [`flare${n}`], recovery: [`flare${n}`] },
});
// a chain link (recovery 4: the next hit follows) and its ending (a full recovery)
const link = (kind, name) => mv(kind, W, { name, counterWindow: null, starWindow: null, punishStar: null, recoveryFrames: 4, noFake: true });
const end = (kind, name) => mv(kind, W, { name, counterWindow: null, starWindow: null, noFake: true });

export default {
  id: 'aldric',
  name: 'ALDRIC THE WINGED',
  short: 'ALDRIC',
  nickname: 'THE PINION',
  circuit: 'p7',
  rank: 5,
  isChampion: false,
  card: {
    age: 44,
    weight: 271,
    record: '61-0 55KO',
    hometown: 'THE SUMMIT',
    quote: 'COUNT THE FEATHERS. I ALWAYS DO. ONE, TWO, THREE.',
  },
  lines: { win: 'THREE FEATHERS. THREE HITS.', lose: 'MY... WINGS...' },

  build: 'heavy',
  palette: 'aldric',
  spriteLayers: 'aldric',

  stats: stats({ health: 360, damageMult: 2.1, stunResistance: 6, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 24 } }),

  moves: {
    jab: mv('jab', W, { name: 'WHITE JAB', sfx: { tell: 'whoosh' } }),
    jabR: mv('jabR', W, { name: 'WHITE CROSS', sfx: { tell: 'whoosh' } }),
    flare1: flare(1, 'FLARE: ONE'),
    flare2: flare(2, 'FLARE: TWO'),
    flare3: flare(3, 'FLARE: THREE'),
    hookLink: link('hook', 'PINION HOOK'),
    bodyLink: link('bodyR', 'PINION BLOW'),
    hookEnd: end('hook', 'PINION HOOK'),
    bodyEnd: end('bodyR', 'PINION BLOW'),
    upperEnd: end('upper', 'PINION UPPERCUT'),
    skyBreaker: superMove('SKY BREAKER', { sfx: { tell: 'fanfare', swing: 'crash' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'oneFeather', weight: 2, when: { rounds: [1] }, fixed: true, steps: steps('i30 jab i16 flare1 i2 hookEnd i36 jabR i18 flare1 i2 bodyEnd i44') },
    { id: 'twoFeathers', weight: 3, fixed: true, steps: steps('i28 flare2 i2 hookLink bodyEnd i38 jab i16 flare1 i2 hookEnd i36 jabR i44') },
    { id: 'threeFeathers', weight: 3, when: { rounds: [2, 3] }, fixed: true, steps: steps('i26 flare3 i2 hookLink bodyLink upperEnd i42 jabR i14 flare2 i2 hookLink bodyEnd i44') },
    { id: 'molt', weight: 2, fixed: true, steps: steps('i24 flare1 i2 bodyEnd i30 flare3 i2 hookLink bodyLink upperEnd i44') },
  ],

  super: { hit: 'body', move: 'skyBreaker', golden: 'windup', window: [10, 13], taunt: 50, shout: 'SKY BREAKER!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'clippedWing', type: 'stunTrigger', name: 'A CLIPPED WING',
      trigger: { state: 'windup', move: ['flare1', 'flare2', 'flare3'], height: 'low', frames: [6, 12], clean: 30 },
      effect: { stun: 96, hits: 6, star: true, say: 'A CLIPPED WING!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'WHEN THE WINGS ARE WIDE HIS RIBS ARE OPEN TO THE AIR.' },
      scout: 'A BODY SHOT ON THE LATE FRAMES OF ANY WING FLARE CLIPS A WING: STUNNED FOR 6 HITS, THE FIRST A STAR, THE CHAIN CANCELLED.',
    },
    {
      id: 'moltedFeather', type: 'quirk', name: 'A MOLTED FEATHER',
      trigger: { on: 'resolved', move: 'upperEnd', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'HE MOLTS!', sfx: 'whoosh' },
      hint: { kind: 'visual', text: 'THE LAST HIT OF THE THREE-CHAIN THROWS HIS WHOLE WEIGHT AFTER IT.', hidden: true },
      scout: 'SLIP THE FINAL UPPERCUT OF HIS THREE-HIT CHAIN: HE MOLTS AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'platedWing', type: 'zoneBias', name: 'PLATED IN GOLD', streak: 4, frames: 480, raise: 'PLATED!', say: 'PLATED!',
      scout: 'HIT THE SAME PLACE FOUR TIMES IN A ROW AND HE PLATES IT IN GOLD FOR 8 SECONDS: ALTERNATE HEAD AND BODY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullSpread', name: 'THE FULL SPREAD', when: { left: 60 }, say: 'THE FULL SPREAD!',
      steps: [{ idle: 20 }, { move: 'flare3' }, { idle: 2 }, { move: 'hookLink' }, { move: 'bodyLink' }, { move: 'upperEnd' }],
    },
  ],
  special: [],
  titleDefense: null,
  gallery: 'AN ANGEL IN PLATE. HE FLARES HIS WINGS BEFORE A COMBO: THE WIDTH IS THE NUMBER OF HITS.',
  medals: { signature: { text: 'SLIP A THREE-HIT CHAIN\'S LAST UPPERCUT TWICE.', check: 'moveResult', move: 'upperEnd', result: 'dodged', n: 2 } },
  music: 'aldricWalkup',
};
