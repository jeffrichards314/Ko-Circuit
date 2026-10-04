// #94 The Jailer — Underworld III's champion, the Chain Pits. The warden. No one has seen his face, and no
// one has left his cells. His CHAINS! is a shout, a throw and a snap: a shackle closes on one of your arms and
// for six seconds you cannot slip toward that side (a clink and nothing); the other way is free, and
// so is a duck or a block. Counter the shout and the chains never close. A STAR PUNCH, landed while
// you're chained, breaks the shackle and staggers him.
// His super is the LIFE SENTENCE: the biggest blow in the pits. A knockdown: slip it. Counter it on the glint
// and the sentence is commuted.
// Underworld difficulty: 6-frame tells (a giant's; the circuit's 4), adaptive, 10 hearts, one life; a champion.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 6;
const rattleT = { tell: 'chainRattle' };

export default {
  id: 'jailer',
  name: 'THE JAILER',
  short: 'JAILER',
  nickname: 'THE WARDEN',
  circuit: 'u3',
  rank: 0,
  isChampion: true,
  card: {
    age: 999,
    weight: 349,
    record: 'NO ESCAPES',
    hometown: 'THE LOWEST CELL',
    quote: 'YOU CAN\'T LEAVE. NO ONE CAN. THE ONLY QUESTION IS HOW LONG YOU LAST.',
  },
  lines: { win: 'BACK TO THE CELL. THE DOOR SHUTS ITSELF.', lose: 'THE KEYS... WHO HAS... THE KEYS...' },

  build: 'giant',
  palette: 'jailer',
  spriteLayers: 'jailer',

  stats: stats({ health: 460, damageMult: 2.15, stunResistance: 7, starLossChance: 0.6, stunFrames: 48, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),

  moves: {
    keyJab: mv('jab', W, { name: 'KEY JAB', sfx: rattleT }),
    keyJabR: mv('jabR', W, { name: 'KEY CROSS', sfx: rattleT }),
    chainHook: mv('hook', W, { name: 'CHAIN HOOK', sfx: rattleT }),
    chainHookL: mv('hookL', W, { name: 'CHAIN HOOK (L)', sfx: rattleT }),
    cellBlow: mv('bodyR', W, { name: 'CELL BLOW', sfx: { tell: 'grunt' } }),
    lockUp: mv('upper', W, { name: 'LOCK UP', sfx: { tell: 'lockClick', swing: 'swingHeavy' } }),
    manacle: mv('haymaker', W, { name: 'MANACLE', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'chainRattle', swing: 'crash' } }),
    // the call: a shout and a throw, then the shackle closes (the `chained` modifier). Counter it and the chains never come.
    chainCall: {
      name: 'CHAINS!', feint: true, call: true, noFake: true,
      windupFrames: 18, activeFrames: 0, recoveryFrames: 6, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 15], starWindow: [3, 6], cancels: 3,
      sfx: { tell: 'chainRattle' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overheadTell2'], recovery: ['overheadTell2'] },
    },
    // the super
    lifeSentence: superMove('LIFE SENTENCE', { windupFrames: 24, kdWindow: [13, 16], counterWindow: [5, 21], sfx: { tell: 'gate', swing: 'crash' } }),
  },

  patterns: [
    { id: 'arraignment', weight: 3, when: { rounds: [1] }, steps: steps('i30 keyJab i18 chainHook i22 cellBlow i30 chainCall i40 lockUp i32 manacle i38 keyJabR i16 chainHookL i44') },
    { id: 'sentencing', weight: 3, steps: steps('i26 chainCall i38 keyJabR i16 keyJab i22 lockUp i34 chainHookL i18 manacle i36 cellBlow i44') },
    { id: 'hardLabor', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 chainHook i14 chainHookL i24 chainCall i36 lockUp i20 manacle i32 keyJab i14 keyJabR i16 cellBlow i40') },
  ],

  super: { hit: 'head', move: 'lifeSentence', golden: 'windup', window: [13, 16], taunt: 50, shout: 'LIFE SENTENCE!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'brokenChains', type: 'stunTrigger', name: 'BROKEN CHAINS',
      trigger: { on: 'custom', scenario: 'chained' },
      effect: { stun: 112, hits: 7, say: 'THE CHAINS BREAK!', sfx: 'chainBreak' },
      hint: { kind: 'quote', text: '"NOTHING BREAKS MY CHAINS." (A STAR PUNCH IS BRIGHTER THAN NOTHING.)' },
      scout: 'LAND A STAR PUNCH ON HIM WHILE YOU ARE CHAINED: THE SHACKLE BREAKS AND HE IS STUNNED FOR 7 HITS.',
    },
    {
      id: 'crackedManacle', type: 'stunTrigger', name: 'A CRACKED MANACLE',
      trigger: { state: 'windup', move: 'manacle', counter: true, frames: [12, 15] },
      effect: { stun: 104, hits: 6, star: true, say: 'THE MANACLE CRACKS!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE IRON GROANS AT THE TOP OF THE MANACLE.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE MANACLE CRACKS IT: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'keyInTheLock', type: 'quirk', name: 'THE KEY IN THE LOCK',
      trigger: { on: 'resolved', move: 'lockUp', result: 'dodged' },
      effect: { open: { frames: 94, anim: 'stunned', comboLimit: 7, star: [0, 34] }, say: 'THE LOCK JAMS!', sfx: 'lockClick' },
      hint: { kind: 'visual', text: 'A LOCK UP THAT MISSES JAMS THE BIG LOCK ON HIS CHEST.', hidden: true },
      scout: 'SLIP HIS LOCK UP UPPERCUT: THE LOCK ON HIS CHEST JAMS AND HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'sentenceGrows', type: 'passivity', name: 'THE SENTENCE GROWS', response: 'buff', frames: 300, gain: 1 / 540, dmg: 0.3, rec: 0.2, meter: 'SENTENCE', say: 'THE SENTENCE GROWS!',
      scout: 'STAND AROUND FOR 5 SECONDS AND THE SENTENCE GROWS: EVERY PUNCH HITS HARDER AND RECOVERS FASTER UNTIL YOU HIT HIM.',
    },
    {
      id: 'confiscates', type: 'starHoard', name: 'CONFISCATES YOUR STARS', moves: ['cellBlow', 'keyJab', 'keyJabR'], hold: 420, say: 'STAR CONFISCATED!',
      scout: 'SIT ON THREE STARS FOR SEVEN SECONDS AND HIS CELL BLOW AND KEY JABS CONFISCATE ONE, EVEN WHEN YOU BLOCK THEM.',
    },
  ],
  scriptedMoments: [
    {
      id: 'wardensRound', name: 'THE WARDEN\'S ROUND', when: { left: 100 }, say: 'THE WARDEN\'S ROUND!',
      steps: [{ idle: 18 }, { move: 'chainCall' }, { idle: 30 }, { move: 'keyJab' }, { idle: 16 }, { move: 'lockUp' }, { idle: 26 }, { move: 'manacle' }],
    },
    {
      id: 'solitary', name: 'SOLITARY', when: { health: 0.4 }, say: 'SOLITARY!',
      steps: [{ idle: 20 }, { move: 'chainHook' }, { idle: 18 }, { move: 'chainHookL' }, { idle: 20 }, { move: 'chainCall' }, { idle: 30 }, { move: 'manacle' }],
    },
  ],
  special: [{ type: 'chained', call: 'chainCall', frames: 360 }],
  titleDefense: null,
  gallery: 'THE WARDEN OF THE CHAIN PITS. HIS SHOUT CLOSES A SHACKLE ON ONE ARM: YOU CAN\'T SLIP THAT WAY. A STAR PUNCH BREAKS IT.',
  medals: { signature: { text: 'BREAK HIS CHAINS WITH A STAR PUNCH.', check: 'cueCount', cue: '!chainBreak', n: 1 } },
  music: 'jailerEntrance',
};
