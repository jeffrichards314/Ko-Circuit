// #92 Gaoler Brisk — Underworld III, the Chain Pits. The warden's own man, and he has the keys. His
// LOCKDOWN is a grab at your wrist: if it lands, one of your arms is LOCKED for a few seconds: the A button
// or the B button does nothing at all, and the other hand has to do the work. It's a grab, so slip it or
// duck it (a block won't stop a hand on your wrist). Everything else he throws is an ordinary punch.
// His super is the CELL SLAM: the door, and all his weight behind it. A knockdown: slip it. Counter it on the
// glint and the door shuts on his own fingers.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const jingle = { tell: 'coins' };

export default {
  id: 'brisk',
  name: 'GAOLER BRISK',
  short: 'BRISK',
  nickname: 'THE KEYMASTER',
  circuit: 'u3',
  rank: 2,
  isChampion: false,
  card: {
    age: 52,
    weight: 189,
    record: '70-6 40KO',
    hometown: 'THE GATEHOUSE',
    quote: 'LIGHTS OUT IN TEN MINUTES. EVERYONE IN THEIR CELLS. THAT MEANS YOU, CHAMP.',
  },
  lines: { win: 'BACK IN YOUR CELL. NO SUPPER.', lose: 'WHO... HAS THE KEYS?' },

  build: 'medium',
  palette: 'brisk',
  spriteLayers: 'brisk',

  stats: stats({ health: 340, damageMult: 1.95, stunResistance: 5, stunFrames: 44, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    cuff: mv('jab', W, { name: 'CUFF', sfx: jingle }),
    cuffR: mv('jabR', W, { name: 'CUFF (R)', sfx: jingle }),
    baton: mv('hook', W, { name: 'BATON', sfx: { tell: 'grunt' } }),
    batonL: mv('hookL', W, { name: 'BATON (L)', sfx: { tell: 'grunt' } }),
    kidney: mv('bodyR', W, { name: 'KIDNEY SHOT', sfx: { tell: 'grunt' } }),
    // the grab: landed, it locks an arm. Slip it or duck it.
    lockdown: mv('jab', W, { name: 'LOCKDOWN', lock: true, noFake: true, windupFrames: 8, activeFrames: 7, recoveryFrames: 30, damage: 6, avoidBy: ['dodgeL', 'dodgeR', 'duck'], counterWindow: [3, 7], starWindow: [3, 5], punishStar: ['dodged', 'ducked'],
      sfx: { tell: 'lockClick', swing: 'whiff' }, animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] } }),
    keySwing: mv('haymaker', W, { name: 'KEY SWING', windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], sfx: { tell: 'coins', swing: 'swingHeavy' } }),
    // the super
    cellSlam: superMove('CELL SLAM', { windupFrames: 20, kdWindow: [11, 14], counterWindow: [5, 17], sfx: { tell: 'gate', swing: 'crash' } }),
  },

  patterns: [
    { id: 'roundup', weight: 3, when: { rounds: [1] }, steps: steps('i26 cuff i14 cuffR i18 baton i26 lockdown i34 kidney i22 keySwing i40') },
    { id: 'lockup', weight: 3, steps: steps('i22 cuffR i12 cuff i16 batonL i26 kidney i20 lockdown i32 keySwing i30 baton i14 batonL i40') },
    { id: 'lightsOut', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 lockdown i30 baton i12 batonL i14 cuff i12 cuffR i26 keySwing i22 kidney i38') },
  ],

  super: { hit: 'head', move: 'cellSlam', golden: 'windup', window: [11, 14], taunt: 46, shout: 'CELL SLAM!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'droppedKeys', type: 'quirk', name: 'HE DROPS THE KEYS',
      trigger: { on: 'resolved', move: 'lockdown', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'HE DROPS THE KEYS!', sfx: 'coins' },
      hint: { kind: 'audio', text: 'A LOCKDOWN THAT MISSES SPILLS THE KEY RING ACROSS THE FLOOR.' },
      scout: 'SLIP HIS LOCKDOWN GRAB: HE DROPS THE KEY RING AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'rustyRing', type: 'stunTrigger', name: 'THE RUSTY RING',
      trigger: { state: 'windup', move: 'keySwing', counter: true, frames: [9, 12] },
      effect: { stun: 90, hits: 5, star: true, say: 'THE RING SNAPS!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE KEY RING JINGLES LOUDEST AT THE TOP OF THE KEY SWING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE KEY SWING (THE KEYS JINGLE LOUDEST) SNAPS THE RING: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'arrested', type: 'jabSpam', name: 'YOU\'RE UNDER ARREST', streak: 3, gap: 40, counter: ['lockdown'], say: 'YOU\'RE UNDER ARREST!',
      scout: 'JAB AND JAB AND JAB AT HIS GLOVES AND HE PARRIES THE THIRD AND ARRESTS YOU WITH A LOCKDOWN.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lockdownDrill', name: 'THE LOCKDOWN', when: { left: 90 }, say: 'LOCKDOWN!',
      steps: [{ idle: 16 }, { move: 'cuff' }, { idle: 14 }, { move: 'lockdown' }, { idle: 32 }, { move: 'baton' }, { idle: 18 }, { move: 'lockdown' }],
    },
  ],
  special: [{ type: 'arms', frames: 150 }],
  titleDefense: null,
  gallery: 'THE WARDEN\'S KEYMASTER. HIS LOCKDOWN GRAB LOCKS ONE OF YOUR ARMS: THE A OR B BUTTON DOES NOTHING.',
  medals: { signature: { text: 'NEVER HAVE AN ARM LOCKED.', check: 'noCue', cue: '!locked' } },
  music: 'briskWalkup',
};
