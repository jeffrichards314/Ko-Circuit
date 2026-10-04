// #66 Orbit — Pantheon IV, the Starfield. Two star-fists circle him, round and round, a
// lap every second and a half. He can't throw a punch until one crosses in front of his chest: that
// orb drops to his glove, the punch follows, and the orb flies at you. The other keeps circling. So the
// rhythm of his punches is the rhythm of his orbs: count the laps. And twice a lap, when both
// orbs stand on the same line, he has nothing in front of him at all.
// His super is the ECLIPSE: both orbs swing in front of him at once, a knockdown: slip it.
// Counter it on the glint and both orbs come down on him.
// Pantheon IV difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;
const orb = (o) => ({ orb: true, ...o });

export default {
  id: 'orbit',
  name: 'ORBIT',
  short: 'ORBIT',
  nickname: 'THE GYROSCOPE',
  circuit: 'p4',
  rank: 1,
  isChampion: false,
  card: {
    age: 34,
    weight: 189,
    record: '41-3 30KO',
    hometown: 'THE ASTROLABE',
    quote: 'EVERYTHING GOES ROUND. EVERYTHING COMES BACK. SO WILL MY FISTS.',
  },
  lines: { win: 'AND ROUND WE GO.', lose: 'MY ORBITS... DECAYED...' },

  build: 'medium',
  palette: 'orbit',
  spriteLayers: 'orbit',

  stats: stats({ health: 310, damageMult: 1.95, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    jab: mv('jab', W, orb({ hand: 'L', name: 'LEFT ORB', sfx: { tell: 'chime' } })),
    jabR: mv('jabR', W, orb({ hand: 'R', name: 'RIGHT ORB', sfx: { tell: 'chime' } })),
    hook: mv('hook', W, orb({ hand: 'R', name: 'ORBIT HOOK', sfx: { tell: 'chime' } })),
    hookL: mv('hookL', W, orb({ hand: 'L', name: 'ORBIT LEFT HOOK', sfx: { tell: 'chime' } })),
    body: mv('body', W, orb({ hand: 'L', name: 'LOW ORBIT', sfx: { tell: 'chime' } })),
    bodyR: mv('bodyR', W, orb({ hand: 'R', name: 'LOW ORBIT (R)', sfx: { tell: 'chime' } })),
    upper: mv('upper', W, orb({ hand: 'R', name: 'RISING ORBIT', sfx: { tell: 'chime' } })),
    // the super: both orbs in front of him at once
    eclipse: superMove('ECLIPSE', orb({ hand: 'R', kdWindow: [10, 13], sfx: { tell: 'fanfare', swing: 'swingHeavy' } })),
  },

  patterns: [
    { id: 'laps', weight: 3, when: { rounds: [1] }, steps: steps('i24 jab i18 hook i22 body i32 upper i28 jabR i18 hookL i36') },
    { id: 'gravity', weight: 3, steps: steps('i22 bodyR i16 jab i16 hookL i30 upper i22 body i16 hook i40') },
    { id: 'precession', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 hookL i14 hook i26 jabR i12 jab i28 upper i20 bodyR i36') },
  ],

  super: { hit: 'body', move: 'eclipse', golden: 'windup', window: [10, 13], taunt: 46, shout: 'ECLIPSE!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'conjunction', type: 'stunTrigger', name: 'CONJUNCTION',
      trigger: { state: 'idle', test: 'aligned', height: 'low', clean: 40 },
      effect: { stun: 88, hits: 5, star: true, say: 'CONJUNCTION!', sfx: 'chime' },
      hint: { kind: 'visual', text: 'WHEN BOTH ORBS LINE UP, HE HAS NOTHING GUARDING HIS FRONT.' },
      scout: 'A BODY SHOT WHILE HIS TWO ORBS LINE UP (TWICE A LAP) KNOCKS HIM OFF HIS ORBIT: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'spentOrb', type: 'quirk', name: 'THE ORB COMES BACK EMPTY',
      trigger: { on: 'resolved', move: 'hook', result: 'dodged', dir: 'L' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'THE ORB GOES WIDE!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE ORBIT HOOK LEAVES HIS ORB WELL OFF BALANCE.', hidden: true },
      scout: 'SLIP LEFT OF HIS ORBIT HOOK: THE ORB SWINGS WIDE AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'orbitGuard', type: 'jabSpam', name: 'THE ORBS GUARD', streak: 4, counter: ['upper'], say: 'ORBIT GUARD!',
      scout: 'KEEP JABBING AT HIM AND THE ORBS PARRY THE 4TH PUNCH; HE ANSWERS WITH THE RISING ORBIT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'meteorShower', name: 'METEOR SHOWER', when: { left: 60 }, say: 'METEOR SHOWER!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 14 }, { move: 'jabR' }, { idle: 14 }, { move: 'hookL' }, { idle: 30 }, { move: 'upper' }],
    },
  ],
  special: [
    { type: 'orbit', period: 84, rx: 46, ry: 11, at: [0, -66], col: [30, 24, 6], hi: [31, 31, 22], lo: [20, 12, 2] },
  ],
  titleDefense: null,
  gallery: 'A GYROSCOPE OF A MAN. TWO STAR-FISTS CIRCLE HIM, AND HE PUNCHES WHEN ONE CROSSES IN FRONT.',
  medals: { signature: { text: 'SLIP THE ECLIPSE.', check: 'moveResult', move: 'eclipse', result: 'dodged', n: 1 } },
  music: 'orbitWalkup',
};
