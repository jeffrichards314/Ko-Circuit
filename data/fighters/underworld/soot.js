// #89 Queen Soot — Underworld II's champion, Ashen Fields. The queen of the burning plain, and the plain
// obeys her. Every so often the ground cracks on one side of the ring and a WALL OF FIRE goes up: for five
// seconds you cannot slip toward it (the fire clinks you back). A cracking sound and glowing cracks tell you which
// side is next. Duck what you can't slip, slip the other way, and block what you can: none of her
// punches ever leaves you without an answer.
// Her super is the FIRE STORM: the wall comes down on both sides at once. A knockdown: slip it. Counter it on the
// glint and the storm turns on her.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life; a champion.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 4;
const sizzle = { tell: 'ember' };

export default {
  id: 'soot',
  name: 'QUEEN SOOT',
  short: 'SOOT',
  nickname: 'QUEEN OF ASH',
  circuit: 'u2',
  rank: 0,
  isChampion: true,
  card: {
    age: 500,
    weight: 141,
    record: '120-0 118KO',
    hometown: 'THE THRONE OF ASH',
    quote: 'KNEEL. THE FLOOR IS WARM, AND IT ISN\'T GOING TO GET ANY COOLER.',
  },
  lines: { win: 'BOW, AND BE SWEPT UP.', lose: 'MY CROWN... GOES COLD...' },

  build: 'medium',
  palette: 'soot',
  spriteLayers: 'soot',

  stats: stats({ health: 420, damageMult: 2.0, stunResistance: 6, starLossChance: 0.6, stunFrames: 46, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }),

  moves: {
    sear: mv('jab', W, { name: 'SEARING JAB', sfx: sizzle }),
    searR: mv('jabR', W, { name: 'SEARING CROSS', sfx: sizzle }),
    cinders: mv('hook', W, { name: 'CINDER HOOK', sfx: sizzle }),
    cindersL: mv('hookL', W, { name: 'CINDER HOOK (L)', sfx: sizzle }),
    smolder: mv('bodyR', W, { name: 'SMOLDER', sfx: sizzle }),
    spark: mv('upper', W, { name: 'SPARK', windupFrames: 9, counterWindow: [3, 8], starWindow: [3, 5], sfx: { tell: 'ember', swing: 'swingHeavy' } }),
    blaze: mv('haymaker', W, { name: 'BLAZE', windupFrames: 14, counterWindow: [4, 13], starWindow: [4, 7], sfx: { tell: 'ignite', swing: 'swingHeavy' } }),
    // the super
    fireStorm: superMove('FIRE STORM', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'flame', swing: 'crash' } }),
  },

  patterns: [
    { id: 'embers', weight: 3, when: { rounds: [1] }, steps: steps('i26 sear i14 searR i18 cinders i26 smolder i20 spark i32 blaze i38 cindersL i44') },
    { id: 'ashes', weight: 3, steps: steps('i22 searR i12 sear i14 cindersL i24 spark i18 smolder i30 blaze i32 cinders i14 cindersL i42') },
    { id: 'crown', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 spark i16 cinders i12 cindersL i26 blaze i22 sear i12 searR i16 smolder i40') },
  ],

  super: { hit: 'body', move: 'fireStorm', golden: 'windup', window: [12, 15], taunt: 48, shout: 'FIRE STORM!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'snuffedOut', type: 'stunTrigger', name: 'SNUFFED OUT',
      trigger: { star: true, test: 'wallUp' },
      effect: { flag: 'snuffed', stun: 96, hits: 6, say: 'SNUFFED OUT!', sfx: 'hiss' },
      hint: { kind: 'quote', text: '"THE FLAME OBEYS ME." (UNLESS SOMETHING GREATER STRIKES IT.)' },
      scout: 'LAND A STAR PUNCH ON HER WHILE A FIRE WALL BURNS: THE WALL IS SNUFFED OUT AND SHE IS STUNNED FOR 6 HITS.',
    },
    {
      id: 'dyingEmbers', type: 'stunTrigger', name: 'DYING EMBERS',
      trigger: { state: 'windup', move: 'blaze', counter: true, frames: [10, 13] },
      effect: { stun: 112, hits: 7, star: true, say: 'THE EMBERS DIE!', sfx: 'hiss' },
      hint: { kind: 'audio', text: 'A LONG INTAKE OF BREATH BEFORE THE BLAZE, AND THE FLAMES DIP.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE BLAZE (THE FLAMES DIP) MAKES HER EMBERS DIE: STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'ashCrown', type: 'quirk', name: 'THE CROWN SLIPS',
      trigger: { on: 'resolved', move: 'spark', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'THE CROWN SLIPS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'A SPARK THAT MISSES KNOCKS HER CROWN CROOKED.', hidden: true },
      scout: 'SLIP HER SPARK UPPERCUT: HER CROWN SLIPS AND SHE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'watchesYourFeet', type: 'earlyDodge', name: 'WATCHES YOUR FEET', response: 'hold', moves: ['spark', 'cinders', 'cindersL'], lead: 12, say: 'SHE WAITS FOR YOUR FEET!',
      scout: 'SLIP EARLY (WELL BEFORE A PUNCH LANDS) AND SHE HOLDS THE SPARK OR CINDER HOOK UNTIL YOUR SLIP RUNS OUT: SLIP LATE.',
    },
    {
      id: 'risesFromAsh', type: 'getUpMash', name: 'RISES FROM THE ASH', response: 'moves', moves: ['spark'], say: 'FROM THE ASH!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND SHE GOES STRAIGHT INTO A SPARK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'flamesClose', name: 'THE FLAMES CLOSE IN', when: { left: 110 }, say: 'THE FLAMES CLOSE IN!',
      steps: [{ idle: 18 }, { move: 'sear' }, { idle: 12 }, { move: 'searR' }, { idle: 16 }, { move: 'cinders' }, { idle: 24 }, { move: 'blaze' }],
    },
    {
      id: 'queenOfAsh', name: 'QUEEN OF ASH', when: { health: 0.4 }, say: 'QUEEN OF ASH!',
      steps: [{ idle: 18 }, { move: 'spark' }, { idle: 16 }, { move: 'cinders' }, { idle: 14 }, { move: 'cindersL' }, { idle: 26 }, { move: 'blaze' }],
    },
  ],
  special: [{ type: 'firewall', first: 320, every: 520, hold: 300, warn: 50, exploit: 'snuffedOut' }],
  titleDefense: null,
  gallery: 'THE QUEEN OF THE BURNING PLAIN. A WALL OF FIRE CLOSES ONE SIDE OF THE RING: SLIP THE OTHER WAY.',
  medals: { signature: { text: 'SNUFF OUT HER FIRE WALL.', check: 'cueCount', cue: '!exploit:snuffedOut', n: 1 } },
  music: 'sootEntrance',
};
