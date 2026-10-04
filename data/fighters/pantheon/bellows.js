// #70 Bellows — Pantheon V, the Thunder Forge. The forge's lungs. He breathes in, and his belly grows,
// and the longer he breathes the bigger the blow that comes out: a puff (a small breath, a small
// punch), a gust (a bigger one) or a GALE (three long breaths, the belly at full stretch, and a punch
// that clears the room). Read the belly. A short breath is a jab; a full belly is one to slip.
// His super is the HURRICANE: three breaths, then all of it. A knockdown: slip it. Counter it on the
// glint, into that belly, and it goes off in his face.
// Pantheon V difficulty: 6-frame tells (for the smallest), shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;
const breath = (o) => ({ sfx: { tell: 'breathIn', swing: 'whoosh' }, ...o });

export default {
  id: 'bellows',
  name: 'BELLOWS',
  short: 'BELLOWS',
  nickname: 'THE WINDBAG',
  circuit: 'p5',
  rank: 1,
  isChampion: false,
  card: {
    age: 52,
    weight: 318,
    record: '40-7 29KO',
    hometown: 'THE BELLOWS ROOM',
    quote: 'BIG BREATH IN... BIG BREATH... OUT. YOU\'LL FEEL IT.',
  },
  lines: { win: 'WHEW. THAT WAS A LOT OF AIR.', lose: 'NO... MORE... AIR...' },

  build: 'heavy',
  palette: 'bellows',
  spriteLayers: 'bellows',

  stats: stats({ health: 350, damageMult: 2.0, stunResistance: 5, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 }, winded: { frames: ['winded1', 'winded2'], rate: 12 } }),

  moves: {
    // a small breath: a small punch
    puff: mv('jab', W, breath({ name: 'PUFF', windupFrames: 6, counterWindow: [3, 5], damage: 10, animation: { windup: ['inhale1'], active: ['blow'], recovery: ['exhaled', 'idle1'] } })),
    puffR: mv('jabR', W, breath({ name: 'PUFF (R)', windupFrames: 6, counterWindow: [3, 5], damage: 10, animation: { windup: ['inhale1'], active: ['blow'], recovery: ['exhaled', 'idle1'] } })),
    // two breaths: a hook that comes round the outside
    gust: mv('hook', W, breath({ name: 'GUST', windupFrames: 8, counterWindow: [3, 7], starWindow: [3, 5], damage: 15, animation: { windup: ['inhale1', 'inhale2'], windupRate: 4, active: ['hook'], recovery: ['hookTell', 'idle1'] } })),
    gustL: mv('hookL', W, breath({ name: 'GUST (L)', windupFrames: 8, counterWindow: [3, 7], starWindow: [3, 5], damage: 15, animation: { windup: ['inhale1', 'inhale2'], windupRate: 4, active: ['hookL'], recovery: ['hookLTell', 'idle1'] } })),
    // three breaths and the belly at full stretch: only slipping helps
    gale: mv('haymaker', W, breath({ name: 'GALE', windupFrames: 20, counterWindow: [5, 19], starWindow: [5, 8], damage: 22, animation: { windup: ['inhale1', 'inhale2', 'inhale3'], windupRate: 6, active: ['blow'], recovery: ['exhaled', 'idle1'] } })),
    belly: mv('bodyR', W, { name: 'BELLY BUMP', sfx: { tell: 'grunt' } }),
    // the super
    hurricane: superMove('HURRICANE', breath({ windupFrames: 26, counterWindow: [5, 23], starWindow: [5, 8], kdWindow: [19, 22], animation: { windup: ['inhale1', 'inhale2', 'inhale3'], windupRate: 8, active: ['blow'], recovery: ['exhaled', 'idle1'] } })),
  },

  patterns: [
    { id: 'lungful', weight: 3, when: { rounds: [1] }, steps: steps('i30 puff i18 puffR i22 gust i36 gale i40 belly i22 gustL i44') },
    { id: 'bigBreath', weight: 3, steps: steps('i26 gustL i20 puff i16 belly i34 gale i38 gust i22 puffR i44') },
    { id: 'windSprints', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 puff i14 puffR i18 gust i16 gustL i30 gale i34 belly i16 puff i40') },
  ],

  super: { move: 'hurricane', golden: 'windup', hit: 'body', window: [19, 22], taunt: 52, shout: 'HURRICANE!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'popped', type: 'stunTrigger', name: 'POPPED',
      trigger: { state: 'windup', move: 'gale', height: 'low', frames: [14, 25], clean: 30 },
      effect: { stun: 100, hits: 6, star: true, say: 'POPPED!', sfx: 'deflate' },
      hint: { kind: 'visual', text: 'AT THE THIRD BREATH THE BELLY IS STRETCHED TIGHT AS A DRUM.' },
      scout: 'A BODY SHOT ON THE LATE FRAMES OF A GALE (THE BELLY AT FULL STRETCH) POPS IT: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'windedGale', type: 'quirk', name: 'OUT OF WIND',
      trigger: { on: 'resolved', move: 'gale', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'winded', comboLimit: 7, star: [0, 40] }, say: 'OUT OF WIND!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'A GALE THAT MISSES LEAVES HIM PANTING LIKE A BELLOWS WITH A HOLE IN IT.', hidden: true },
      scout: 'SLIP THE GALE: HE IS OUT OF WIND AND OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'catchesBreath', type: 'passivity', name: 'CATCHES HIS BREATH', response: 'snack', frames: 300, limit: 2, say: 'CATCHING HIS BREATH!',
      step: { open: 64, anim: 'winded', id: 'gulp', heal: 0.05, comboLimit: 4, star: [0, 24], sfxLoop: 'pant', sfxEvery: 26 },
      scout: 'WAIT AROUND FOR 5 SECONDS AND HE STOPS TO CATCH HIS BREATH (AND HEAL A LITTLE): IT\'S AN OPENING, BUT ONLY ONCE OR TWICE A ROUND.',
    },
  ],
  scriptedMoments: [
    {
      id: 'deepBreath', name: 'A DEEP BREATH', when: { left: 75 }, say: 'A DEEP BREATH!',
      steps: [{ idle: 20 }, { move: 'puff' }, { idle: 16 }, { move: 'gust' }, { idle: 30 }, { move: 'gale' }],
    },
  ],
  special: [],
  titleDefense: null,
  gallery: 'THE FORGE\'S LUNGS. HE INHALES, HIS BELLY GROWS, AND THE LONGER THE BREATH THE BIGGER THE PUNCH.',
  medals: { signature: { text: 'SLIP THE GALE TWICE.', check: 'moveResult', move: 'gale', result: 'dodged', n: 2 } },
  music: 'bellowsWalkup',
};
