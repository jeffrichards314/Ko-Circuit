// #91 Link — Underworld III, the Chain Pits. A wire of a man wound in chain, and the loose end is a whip.
// He lashes from out of reach: while he waits, everything you throw at him just whiffs on the air. But the
// lash has to be sent, and he can't send it quietly: each lash starts with the RATTLE of the chain, six
// frames of it, HIGH for a lash at your head, LOW for one at your body, and only in the last four frames
// does he move. Listen for the rattle and you get six frames more than anyone has ever had.
// His super is the CHAIN STORM: the whole chain in the air at once. A knockdown: slip it. Counter it on the
// glint and it wraps him.
// Underworld difficulty: 4-frame visible tells (and the rattle before them), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
// a lash: the rattle for `quiet` frames (he stands as he was), then the pose. `note` is the pitch of the rattle.
const lash = (kind, name, pose, note, o = {}) => mv(kind, W, {
  name, rattle: true, quiet: 6, note, windupFrames: 10, counterWindow: [6, 9], starWindow: null,
  sfx: { tell: note === 'low' ? 'rattleLo' : 'rattleHi', swing: 'whip' },
  animation: { windup: ['idle1', pose], windupRate: 6, active: [pose.replace('Tell', '')], recovery: [pose, 'idle1'] },
  ...o,
});

export default {
  id: 'link',
  name: 'LINK',
  short: 'LINK',
  nickname: 'THE WHIP',
  circuit: 'u3',
  rank: 3,
  isChampion: false,
  card: {
    age: 29,
    weight: 154,
    record: '52-3 47KO',
    hometown: 'THE LONG CORRIDOR',
    quote: 'YOU HEAR ME BEFORE YOU FEEL ME. YOU ALWAYS DO. YOU JUST NEVER LISTEN.',
  },
  lines: { win: 'HEARD IT COMING, DIDN\'T YOU?', lose: 'THE CHAIN... WENT SLACK...' },

  build: 'lean',
  palette: 'link',
  spriteLayers: 'link',

  stats: stats({ health: 320, damageMult: 1.9, stunResistance: 4, stunFrames: 42, hitstun: 10, idleHitLimit: 0 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 14 } }),

  moves: {
    lash: lash('jab', 'LASH', 'jabTell', 'high'),
    lashR: lash('jabR', 'LASH (R)', 'jabRTell', 'high'),
    crack: lash('hook', 'WHIP CRACK', 'hookTell', 'high', { windupFrames: 12, counterWindow: [6, 11], animation: { windup: ['idle1', 'hookTell'], windupRate: 6, active: ['hook'], recovery: ['hookTell', 'idle1'] } }),
    crackL: lash('hookL', 'WHIP CRACK (L)', 'hookLTell', 'high', { windupFrames: 12, counterWindow: [6, 11], animation: { windup: ['idle1', 'hookLTell'], windupRate: 6, active: ['hookL'], recovery: ['hookLTell', 'idle1'] } }),
    ribLash: lash('bodyR', 'RIB LASH', 'bodyRTell', 'low', { animation: { windup: ['idle1', 'bodyRTell'], windupRate: 6, active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] } }),
    lowLash: lash('sweep', 'LOW LASH', 'sweepTell', 'low', { windupFrames: 12, counterWindow: [6, 11], animation: { windup: ['idle1', 'sweepTell'], windupRate: 6, active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] } }),
    coil: lash('upper', 'COIL', 'upperTell', 'high', { windupFrames: 12, counterWindow: [6, 11], starWindow: [6, 8], animation: { windup: ['idle1', 'upperTell'], windupRate: 6, active: ['upper'], recovery: ['upper', 'idle1'] } }),
    // the super
    chainStorm: superMove('CHAIN STORM', { windupFrames: 20, kdWindow: [11, 14], counterWindow: [5, 17], sfx: { tell: 'chainRattle', swing: 'crash' } }),
  },

  patterns: [
    { id: 'lashing', weight: 3, when: { rounds: [1] }, steps: steps('i26 lash i16 lashR i18 crack i26 ribLash i22 coil i30 lowLash i40') },
    { id: 'rattling', weight: 3, steps: steps('i22 lashR i12 lash i16 crackL i24 lowLash i30 coil i18 ribLash i16 crack i40') },
    { id: 'chainWork', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 lash i12 lashR i12 crack i14 crackL i26 lowLash i28 coil i20 ribLash i38') },
  ],

  super: { hit: 'body', move: 'chainStorm', golden: 'windup', window: [11, 14], taunt: 46, shout: 'CHAIN STORM!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'tangled', type: 'quirk', name: 'TANGLED UP',
      trigger: { on: 'resolved', move: 'crack', result: 'dodged' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HE TANGLES HIMSELF!', sfx: 'clinkChain' },
      hint: { kind: 'audio', text: 'A WHIP CRACK THAT MISSES WRAPS BACK AROUND HIM WITH A CLATTER.' },
      scout: 'SLIP HIS WHIP CRACK: THE CHAIN WRAPS BACK AROUND HIM AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'looseLink', type: 'stunTrigger', name: 'THE LOOSE LINK',
      trigger: { state: 'windup', move: 'coil', counter: true, frames: [8, 11] },
      effect: { stun: 88, hits: 5, star: true, say: 'THE LINK BREAKS!', sfx: 'chainBreak' },
      hint: { kind: 'visual', text: 'THE CHAIN SAGS AT THE TOP OF THE COIL: ONE LINK IS BENT.', hidden: true },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE COIL (THE CHAIN SAGS) BREAKS A LINK: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'holdsTheLash', type: 'earlyDodge', name: 'HOLDS THE LASH', response: 'hold', moves: ['lash', 'lashR', 'crack'], lead: 12, say: 'HE HOLDS THE LASH!',
      scout: 'SLIP EARLY (ON THE RATTLE, BEFORE HE MOVES) AND HE HOLDS THE LASH UNTIL YOUR SLIP RUNS OUT: WAIT FOR HIS BODY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'feedingTime', name: 'FEEDING TIME', when: { left: 85 }, say: 'FEEDING TIME!',
      steps: [{ idle: 16 }, { move: 'lash' }, { idle: 12 }, { move: 'lashR' }, { idle: 14 }, { move: 'crack' }, { idle: 20 }, { move: 'lowLash' }],
    },
  ],
  special: [{ type: 'rattle', back: 6 }],
  titleDefense: null,
  gallery: 'A WIRE OF A MAN WOUND IN CHAIN. THE RATTLE COMES FIRST, HIGH OR LOW, THEN THE LASH.',
  medals: { signature: { text: 'DUCK THE LOW LASH THREE TIMES.', check: 'moveResult', move: 'lowLash', result: 'ducked', n: 3 } },
  music: 'linkWalkup',
};
