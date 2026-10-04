// #85 Moros — Underworld I's champion, Ferryman's Shore. A masked brute the size of a doorway, and he wears
// THREE faces: a weeping one, a grinning one and a raging one float over his shoulders, bobbing on three
// rhythms at once. Every time he winds up, ONE of them jerks down. Only one mask is the true face, a
// different one each round, and only the true face's dip is followed by a punch. The others dip for DECOYS:
// a wind-up with nothing behind it. Learn the true face and you can stop slipping shadows... and a counter
// on a decoy cracks him.
// His super is the REQUIEM: all three masks at once and the whole weight of him. A knockdown: slip it. Counter
// it on the glint and the masks turn on him.
// Underworld difficulty: 6-frame tells (a giant's; the circuit's 4), adaptive, 10 hearts, one life; a champion.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 6;
const clack = { tell: 'maskClack' };
// a decoy: the same windup as a real punch, then nothing (a `feint`). It has its own sound: no real punch makes it.
const decoy = (kind, name, o = {}) => ({ ...mv(kind, W, { name, sfx: clack }), feint: true, noFake: true, damage: 0, activeFrames: 0, recoveryFrames: 30, starWindow: null, punishStar: null, ...o });

export default {
  id: 'moros',
  name: 'MOROS',
  short: 'MOROS',
  nickname: 'THE MANY-FACED',
  circuit: 'u1',
  rank: 0,
  isChampion: true,
  card: {
    age: 999,
    weight: 344,
    record: '??-0 ??KO',
    hometown: 'WHERE THE RIVER BENDS',
    quote: 'WHICH ONE IS ME? I LOST TRACK. I THINK THE RIGHT ONE.',
  },
  lines: { win: 'THREE FACES, AND NONE OF THEM WERE YOURS.', lose: 'WHICH... ONE... WAS I?' },

  build: 'giant',
  palette: 'moros',
  spriteLayers: 'moros',

  stats: stats({ health: 400, damageMult: 2.1, stunResistance: 7, starLossChance: 0.6, stunFrames: 48, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 24 } }),

  moves: {
    jab: mv('jab', W, { name: 'MASKED JAB', sfx: { tell: 'grunt' } }),
    jabR: mv('jabR', W, { name: 'MASKED CROSS', sfx: { tell: 'grunt' } }),
    hook: mv('hook', W, { name: 'DEAD HOOK', sfx: { tell: 'grunt' } }),
    hookL: mv('hookL', W, { name: 'DEAD HOOK (L)', sfx: { tell: 'grunt' } }),
    bodyR: mv('bodyR', W, { name: 'GRAVE BLOW', sfx: { tell: 'grunt' } }),
    upper: mv('upper', W, { name: 'HEADSTONE', sfx: { tell: 'grunt' } }),
    march: mv('haymaker', W, { name: 'FUNERAL MARCH', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'grunt', swing: 'swingHeavy' } }),
    // decoys (never hurt): the three masks' false tells
    decoyJab: decoy('jab', 'DECOY JAB'),
    decoyHook: decoy('hook', 'DECOY HOOK', { counterWindow: [2, W + 1] }),
    decoyMarch: decoy('haymaker', 'DECOY MARCH', { windupFrames: 14, counterWindow: [4, 12] }),
    // the super
    requiem: superMove('REQUIEM', { windupFrames: 24, kdWindow: [13, 16], counterWindow: [5, 21], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'procession', weight: 3, when: { rounds: [1] }, steps: steps('i28 jab i16 decoyHook i22 hook i22 bodyR i30 decoyJab i18 march i38 jabR i16 hookL i44') },
    { id: 'threeFaces', weight: 3, steps: steps('i26 decoyJab i18 hookL i16 decoyHook i22 upper i32 jabR i16 decoyMarch i20 march i36 bodyR i44') },
    { id: 'masquerade', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 decoyHook i16 hook i14 hookL i24 decoyJab i18 upper i28 march i24 decoyMarch i16 bodyR i40') },
  ],

  super: { hit: 'body', move: 'requiem', golden: 'windup', window: [13, 16], taunt: 50, shout: 'REQUIEM!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'wrongFace', type: 'stunTrigger', name: 'THE WRONG FACE',
      trigger: { state: 'windup', move: ['decoyJab', 'decoyHook', 'decoyMarch'], counter: true, frames: [3, 8] },
      effect: { stun: 110, hits: 7, star: true, say: 'THE MASK CRACKS!', sfx: 'crunch' },
      hint: { kind: 'visual', text: 'A FALSE MASK\'S DIP IS A LITTLE SLOWER, AND ITS EYES DON\'T FLARE RED.' },
      scout: 'COUNTER A DECOY (THE WINDUP OF A FALSE MASK): THE MASK CRACKS AND HE IS STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'graveDigger', type: 'quirk', name: 'THE STONE FALLS',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 30] }, say: 'THE STONE FALLS!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HIS HEADSTONE UPPERCUT OVERBALANCES HIM IF IT MISSES.', hidden: true },
      scout: 'SLIP HIS HEADSTONE UPPERCUT: IT OVERBALANCES HIM AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'lostTheThread', type: 'stunTrigger', name: 'HE LOSES THE THREAD',
      trigger: { state: 'windup', move: 'march', counter: true, frames: [11, 15] },
      effect: { stun: 104, hits: 6, star: true, say: 'HE LOSES THE THREAD!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE MASKS ALL CLACK TOGETHER AT THE TOP OF THE FUNERAL MARCH.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE FUNERAL MARCH MAKES HIM LOSE THE THREAD: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'growsImpatient', type: 'passivity', name: 'GROWS IMPATIENT', response: 'buff', frames: 300, gain: 1 / 540, dmg: 0.3, rec: 0.2, meter: 'IMPATIENCE', say: 'HIS PATIENCE ENDS!',
      scout: 'STAND AROUND FOR 5 SECONDS AND HIS IMPATIENCE BUILDS: EVERY PUNCH HITS HARDER AND RECOVERS FASTER UNTIL YOU HIT HIM.',
    },
    {
      id: 'risesFromTheBoards', type: 'getUpMash', name: 'RISES FROM THE BOARDS', response: 'harder', mult: 1.35, punches: 3, say: 'HE RISES WITH YOU!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT THREE PUNCHES HIT HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'facesTurn', name: 'THE FACES TURN', when: { left: 100 }, say: 'THE FACES TURN!',
      steps: [{ idle: 18 }, { move: 'decoyHook' }, { idle: 14 }, { move: 'jab' }, { idle: 18 }, { move: 'decoyMarch' }, { idle: 22 }, { move: 'march' }],
    },
    {
      id: 'funeral', name: 'THE FUNERAL', when: { health: 0.4 }, say: 'THE FUNERAL!',
      steps: [{ idle: 20 }, { move: 'upper' }, { idle: 18 }, { move: 'hook' }, { idle: 18 }, { move: 'hookL' }, { idle: 26 }, { move: 'march' }],
    },
  ],
  special: [{ type: 'rhythms', real: [1, 2, 0], masks: [
    { x: -34, y: -147, period: 26, kind: 'weep' },
    { x: 0, y: -153, period: 34, kind: 'grin' },
    { x: 34, y: -147, period: 44, kind: 'rage' },
  ] }],
  titleDefense: null,
  gallery: 'A MASKED BRUTE WITH THREE FACES BOBBING OVER HIS SHOULDERS. ONLY ONE OF THEM TELLS THE TRUTH.',
  medals: { signature: { text: 'CRACK A MASK: COUNTER ONE OF HIS DECOYS.', check: 'counterMove', move: 'decoyHook', n: 1 } },
  music: 'morosEntrance',
};
