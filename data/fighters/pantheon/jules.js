// #60 Gentleman Jules — Pantheon III, the Hall of Heroes. A showman from the 1920s, in
// the grey of a silent film. His bows and flourishes are OPENINGS: a man who stops to
// take a bow can be hit. But his CANE TWIRL is a FEINT: a windup with no punch at the
// end of it, put there to make you waste a defense. A real cane thrust is quick and
// straight; the twirl spins the cane and takes its time.
// His super is the GRAND FLOURISH: a sweeping bow, then the cane comes round like a
// scythe, a knockdown: slip it. Hit him as he steps back in and he takes his bow on the canvas.
// Pantheon III difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

const W = 6;

export default {
  id: 'jules',
  name: 'GENTLEMAN JULES',
  short: 'JULES',
  nickname: 'THE SHOWMAN',
  circuit: 'p3',
  rank: 3,
  isChampion: false,
  card: { age: 41, weight: 149, record: '87-4 55KO', hometown: 'THE MOVIES, 1926', quote: 'THE SHOW MUST GO ON. IT ALWAYS DOES.' },
  lines: { win: 'AND SCENE.', lose: 'THE CURTAIN... FALLS...' },

  build: 'lean',
  palette: 'jules',
  spriteLayers: 'jules',

  stats: {
    health: 290, damageMult: 1.85, stunResistance: 3, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 12 },
    block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'],
    taunt: { frames: ['twirl1', 'twirl2'], rate: 8 }, victory: ['victory'],
    bow: { frames: ['bow'], rate: 30 },
  },

  moves: {
    jab: {
      name: 'SILK JAB',
      windupFrames: W, activeFrames: 5, recoveryFrames: 20, damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1], starWindow: null,
      sfx: { tell: 'whip', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    cane: {
      name: 'CANE THRUST',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 22, damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [2, W], starWindow: [2, 4],
      sfx: { tell: 'whip', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    hook: {
      name: 'MUSIC-HALL HOOK',
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26, damage: 14,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W + 1], starWindow: [3, 5],
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the cane twirl: a windup with nothing at the end of it (a feint), slower than any real thrust
    twirl: {
      name: 'CANE TWIRL', feint: true, noFake: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 24, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 12], starWindow: [2, 5],
      sfx: { tell: 'baton' },
      animation: { windup: ['twirl1', 'twirl2'], windupRate: 4, active: ['twirl2'], recovery: ['twirl1', 'idle1'] },
    },
    grandFlourish: {
      name: 'GRAND FLOURISH', knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 48, damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 16], starWindow: [2, 7], punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['twirl1', 'twirl2'], windupRate: 5, active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    { id: 'overture', weight: 3, when: { rounds: [1] }, steps: [
      { idle: 30 }, { move: 'jab' }, { idle: 18 }, { move: 'cane' }, { idle: 26 }, { move: 'twirl' }, { idle: 22 },
      { open: 46, anim: 'bow', id: 'bow', comboLimit: 5, star: [0, 20] }, { idle: 30 }, { move: 'hook' }, { idle: 24 }, { move: 'jab' }, { idle: 44 } ] },
    { id: 'intermission', weight: 3, steps: [
      { idle: 26 }, { move: 'cane' }, { idle: 18 }, { move: 'cane' }, { idle: 24 }, { move: 'twirl' }, { idle: 20 },
      { move: 'hook' }, { idle: 28 }, { open: 46, anim: 'bow', id: 'bow', comboLimit: 5, star: [0, 20], limit: 3 }, { idle: 26 }, { move: 'jab' }, { idle: 42 } ] },
    { id: 'finale', weight: 2, when: { rounds: [2, 3] }, steps: [
      { idle: 24 }, { move: 'twirl' }, { idle: 20 }, { move: 'jab' }, { idle: 16 }, { move: 'cane' }, { idle: 22 },
      { move: 'twirl' }, { idle: 18 }, { move: 'hook' }, { idle: 26 }, { move: 'cane' }, { idle: 40 } ] },
  ],

  super: { hit: 'head', move: 'grandFlourish', golden: 'advance', window: [3, 7], taunt: 44, shout: 'GRAND FLOURISH!', times: [1, 2] },

  getUpTable: [ { upAt: [9, 9], health: 0.5 }, { upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.3, health: 0.4 }, { upAt: null } ],


  exploits: [
    {
      id: 'hatTrick', type: 'stunTrigger', name: 'HAT TRICK',
      trigger: { state: 'open', open: 'bow', height: 'high', frames: [0, 12], clean: 24 },
      effect: { stun: 90, hits: 5, star: true, say: 'THE HAT FLIES OFF!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'HE BOWS WITH THE HAT ON, NOT IN HIS HAND.' },
      scout: 'A HEAD PUNCH DURING THE FIRST FRAMES OF HIS BOW KNOCKS HIS HAT OFF: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'caneCaught', type: 'patternBreak', name: 'CANE CAUGHT',
      trigger: { state: 'windup', move: 'cane', counter: true, frames: [4, 7] },
      effect: { stun: 80, hits: 4, cancelMoves: ['hook', 'jab'], say: 'YOU CAUGHT HIS CANE!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'A REAL THRUST WHIPS THE AIR. THE TWIRL DOESN\'T.' },
      scout: 'A COUNTER ON THE CANE THRUST STUNS HIM FOR 4 HITS AND THE HOOK OR JAB HE MEANT TO THROW NEXT NEVER COMES.',
    },
  ],
  antiStrategies: [
    {
      id: 'readsYourSide', type: 'dodgeBias', name: 'READS YOUR SIDE', moves: ['jab', 'cane'], min: 6, share: 0.75, say: 'THE CANE FOLLOWS YOU!',
      scout: 'SLIP TO THE SAME SIDE AGAIN AND AGAIN AND HIS JABS AND CANE THRUSTS COME FROM THAT SIDE.',
    },
  ],
  scriptedMoments: [
    { id: 'curtainCall', name: 'CURTAIN CALL', when: { left: 60 }, say: 'CURTAIN CALL!', steps: [{ idle: 18 }, { move: 'twirl' }, { idle: 20 }, { move: 'cane' }, { idle: 20 }, { move: 'twirl' }, { idle: 20 }, { move: 'hook' }] },
  ],
  special: [{ type: 'era', look: 'film', label: '1920S', color: [26, 26, 30], dust: [28, 28, 30], dustDk: [5, 5, 8] }],
  titleDefense: null,
  gallery: 'A SHOWMAN FROM THE SILENT-FILM ERA. HIS BOWS ARE OPENINGS AND HIS CANE-TWIRL IS A FEINT.',
  medals: { signature: { text: 'KNOCK HIS HAT OFF TWICE.', check: 'cueCount', cue: '!exploit:hatTrick', n: 2 } },
  music: 'julesWalkup',
};
