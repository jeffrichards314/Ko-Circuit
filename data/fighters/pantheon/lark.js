// #52 Lark — Pantheon I, the Gate of Dawn. The Pantheon's herald, and every note of
// her trumpet is a punch on its way: she blows, a note floats up over her, and the
// PITCH is the height: a high note is a head punch (slip it, or duck under it), a low
// note is a body blow (slip it, or block it). Dodging always works. But a held note
// is different: a long HIGH note can only be ducked, a long LOW note can only be
// blocked. The pitch tells you which. The fanfares chain notes in a row: read each
// pitch as it comes.
// Her super is the HERALD'S BLAST: the whole trumpet at your head, a knockdown: slip it.
// Counter it on the glint and she runs out of air.
// Pantheon I difficulty: 6-frame tells, shuffled and adaptive, hearts 12.

const W = 7;
const note = (name, pitch, o) => ({
  name, note: pitch, height: pitch === 'low' ? 'low' : 'high',
  activeFrames: 6, noFake: false,
  starWindow: null,
  sfx: { tell: pitch === 'low' ? 'trumpetLo' : 'trumpetHi', swing: 'whiff' },
  ...o,
});

export default {
  id: 'lark',
  name: 'LARK',
  short: 'LARK',
  nickname: 'THE HERALD',
  circuit: 'p1',
  rank: 2,
  isChampion: false,
  card: {
    age: 21,
    weight: 122,
    record: '26-0 19KO',
    hometown: 'THE GATE OF DAWN',
    quote: 'HEAR THAT? THAT\'S THE SOUND OF YOU LOSING.',
  },
  lines: {
    win: 'FANFARE FOR THE WINNER!',
    lose: 'FLAT... I WENT... FLAT...',
  },

  build: 'lean',
  palette: 'lark',
  spriteLayers: 'lark',

  stats: {
    health: 260,
    damageMult: 1.75,
    stunResistance: 3,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 14 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['blow', 'idle1'], rate: 10 },
    victory: ['victory'],
    winded: { frames: ['winded1', 'winded2'], rate: 12 },
  },

  moves: {
    // a short high note: a jab at your head. Slip it or duck it.
    trill: note('HIGH NOTE', 'high', {
      windupFrames: W, recoveryFrames: 20, damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, W - 1],
      animation: { windup: ['blow'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    }),
    // a short low note: a punch in the stomach. Slip it or block it.
    blat: note('LOW NOTE', 'low', {
      windupFrames: W + 1, recoveryFrames: 22, damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W],
      punishStar: ['dodged'],
      animation: { windup: ['blow'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    }),
    // the quick grace notes: a high pip and a low bump, faster and lighter
    pip: note('HIGH PIP', 'high', {
      windupFrames: W - 1, recoveryFrames: 18, damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, W - 2],
      animation: { windup: ['blow'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    }),
    bump: note('LOW BUMP', 'low', {
      windupFrames: W, recoveryFrames: 20, damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W - 1],
      animation: { windup: ['blow'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    }),
    // a long high note: it can only be ducked
    holdHigh: note('LONG HIGH NOTE', 'high', {
      windupFrames: 16, recoveryFrames: 30, damage: 13, activeFrames: 8,
      avoidBy: ['duck'],
      counterWindow: [3, 14],
      starWindow: [3, 6],
      punishStar: ['ducked'],
      sfx: { tell: 'trumpetHold', swing: 'swingHeavy' },
      animation: { windup: ['blow'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    }),
    // a long low note: it can only be blocked
    holdLow: note('LONG LOW NOTE', 'low', {
      windupFrames: 16, recoveryFrames: 30, damage: 14, activeFrames: 8,
      avoidBy: ['block'],
      counterWindow: [3, 14],
      starWindow: [3, 6],
      sfx: { tell: 'trumpetHoldLo', swing: 'swingHeavy' },
      animation: { windup: ['blow'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    }),
    // the super: the whole horn at your head. A knockdown.
    heraldBlast: note('HERALD\'S BLAST', 'high', {
      knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 46, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17],
      starWindow: [4, 7],
      kdWindow: [11, 14],
      punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['blow'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    }),
  },

  patterns: [
    {
      id: 'reveille', weight: 3, when: { rounds: [1] },
      steps: [
        { idle: 32 }, { move: 'trill' }, { idle: 26 }, { move: 'blat' }, { idle: 28 }, { move: 'pip' },
        { idle: 24 }, { move: 'trill' }, { idle: 44 }, { move: 'holdHigh' }, { idle: 46 }, { move: 'blat' },
        { idle: 22 }, { move: 'bump' }, { idle: 50 },
      ],
    },
    {
      id: 'fanfare', weight: 3,
      steps: [
        { idle: 28 }, { move: 'blat' }, { idle: 22 }, { move: 'pip' }, { idle: 22 }, { move: 'bump' }, { idle: 20 }, { move: 'trill' },
        { idle: 44 }, { move: 'holdLow' }, { idle: 44 }, { move: 'trill' }, { idle: 24 }, { move: 'holdHigh' }, { idle: 52 },
      ],
    },
    {
      id: 'tattoo', weight: 2, when: { rounds: [2, 3] },
      steps: [
        { idle: 26 }, { move: 'pip' }, { idle: 20 }, { move: 'trill' }, { idle: 20 }, { move: 'bump' },
        { idle: 42 }, { move: 'holdHigh' }, { idle: 40 }, { move: 'holdLow' }, { idle: 38 }, { move: 'pip' },
        { idle: 22 }, { move: 'blat' }, { idle: 46 },
      ],
    },
  ],

  // her super: thrown once or twice a round after she backs off and taunts (super.js)
  super: { hit: 'body', move: 'heraldBlast', golden: 'windup', window: [11, 14], taunt: 48, shout: 'HERALD\'S BLAST!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (spec §17) ---
  exploits: [
    {
      id: 'outOfBreath', type: 'stunTrigger', name: 'OUT OF BREATH',
      trigger: { state: 'windup', move: ['holdHigh', 'holdLow'], counter: true, frames: [10, 15] },
      effect: { stun: 96, hits: 6, say: 'SHE RAN OUT OF AIR!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'THE LONG NOTES WOBBLE AT THE END: SHE\'S RUNNING OUT OF BREATH.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF A LONG NOTE (HIGH OR LOW) KNOCKS THE BREATH OUT OF HER: STUNNED FOR 6 HITS.',
    },
    {
      id: 'sourNote', type: 'quirk', name: 'A SOUR NOTE',
      trigger: { on: 'resolved', move: 'holdHigh', result: 'ducked' },
      effect: { open: { frames: 84, anim: 'winded', comboLimit: 7, star: [0, 36] }, say: 'A SOUR NOTE!', sfx: 'pant' },
      hint: { kind: 'visual', text: 'HER LONG NOTE GOES OVER YOUR HEAD, AND SHE GOES WITH IT.', hidden: true },
      scout: 'DUCK THE LONG HIGH NOTE: SHE OVERBLOWS AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'knowsYourSide', type: 'dodgeBias', name: 'SHE KNOWS YOUR SIDE', moves: ['trill'], min: 6, share: 0.75, say: 'SHE KNOWS YOUR SIDE!',
      scout: 'SLIP TO THE SAME SIDE AGAIN AND AGAIN AND HER HIGH NOTES COME FROM THAT SIDE: SLIP THE OTHER WAY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'encore', name: 'ENCORE', when: { left: 75 }, say: 'ENCORE!',
      steps: [{ idle: 20 }, { move: 'trill' }, { move: 'blat' }, { move: 'trill' }, { idle: 50 }, { move: 'holdHigh' }],
    },
  ],
  special: [{ type: 'fanfare', at: [24, -80] }],
  titleDefense: null,
  gallery: 'THE HERALD OF THE PANTHEON. EVERY BLAST OF HER TRUMPET IS A PUNCH: THE PITCH TELLS YOU WHERE IT LANDS.', // bio for the fighter gallery (§16)
  medals: { signature: { text: 'DUCK THE LONG HIGH NOTE TWICE.', check: 'moveResult', move: 'holdHigh', result: 'ducked', n: 2 } },
  music: 'larkWalkup', // her walk-up jingle (data/music/walkups.js)
};
