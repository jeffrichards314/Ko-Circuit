// #42 King Karver — Grand Prix champion. He held this belt for eleven years,
// lost it, and took it back. He doesn't have a fixed plan: he has YOU.
//   He smells weakness. His mood (under the clock) follows your hearts: PATIENT
//   while you have more than two-thirds of them, HUNGRY below that, RUTHLESS
//   under a third (or when you're pink). Hungrier means shorter pauses between
//   his punches, quicker recoveries and nastier patterns: the Decree and the
//   Bloodlust only come out when he's hungry. Keep your hearts up (don't get
//   hit, don't punch into his guard) and he stays patient.
//   He reads your slips. The Carve is a hook that comes from either arm. Slip
//   to the same side most of the time and he throws it from the arm that side
//   can't slip (a "!" over his crown when he does). Mix your slips, or duck it.
//   He reads your punches. Throw most of them at one height and he starts
//   guarding it while he's idle.
// The Guillotine is his one-hit knockdown: both fists raised over the crown.
// Slip it, or counter it on the glint (perfect hit).

const carve = (side, twin) => ({
  name: 'CARVE',
  twin,
  windupFrames: 9, activeFrames: 7, recoveryFrames: 24,
  damage: 17,
  avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL', 'duck'],
  counterWindow: [2, 7],
  starWindow: null,
  sfx: { tell: 'grunt', swing: 'swingHeavy' },
  animation: side < 0
    ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] }
    : { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
});
const scepter = (side, twin) => ({
  name: 'SCEPTER',
  twin,
  windupFrames: 8, activeFrames: 7, recoveryFrames: 22,
  damage: 16,
  height: 'low',
  avoidBy: ['block', side < 0 ? 'dodgeR' : 'dodgeL'],
  counterWindow: [2, 6],
  starWindow: null,
  sfx: { tell: 'grunt', swing: 'whiff' },
  animation: side < 0
    ? { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] }
    : { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
});

export default {
  id: 'karver',
  name: 'KING KARVER',
  short: 'KARVER',
  nickname: 'THE OLD KING',
  circuit: 'grandprix',
  rank: 0,
  isChampion: true,
  card: {
    age: 47,
    weight: 244,
    record: '77-5 60KO',
    hometown: 'THE THRONE ROOM',
    quote: 'I HAVE STUDIED A THOUSAND CHALLENGERS. YOU ARE NOT SPECIAL.',
  },
  lines: {
    win: 'KNEEL. THEY ALWAYS KNEEL, IN THE END.',
    lose: 'LONG... LIVE... THE KING...',
  },

  build: 'heavy',
  palette: 'karver',
  spriteLayers: 'karver',

  stats: {
    health: 280,
    damageMult: 1.7,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: null,
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['beckon1', 'beckon2'], rate: 14 },
    victory: ['throne'],
  },

  moves: {
    crownJab: {
      name: 'CROWN JAB',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 20,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: [2, 3],
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    carveL: carve(-1, 'carveR'),
    carveR: carve(1, 'carveL'),
    scepterL: scepter(-1, 'scepterR'),
    scepterR: scepter(1, 'scepterL'),
    // THE DECREE (hungry): a jab and a hook, no pause between
    decree1: {
      name: 'DECREE',
      windupFrames: 8, activeFrames: 5, recoveryFrames: 3,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 6],
      starWindow: null,
      cancels: 1,
      noFake: true,
      sfx: { tell: 'fanfare', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    decree2: {
      name: 'DECREE (2)',
      twin: 'decree2L',
      windupFrames: 8, activeFrames: 7, recoveryFrames: 36,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: null, starWindow: null,
      punishStar: ['dodged', 'ducked'],
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    decree2L: {
      name: 'DECREE (2)',
      twin: 'decree2',
      windupFrames: 8, activeFrames: 7, recoveryFrames: 36,
      damage: 17,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      punishStar: ['dodged', 'ducked'],
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    // one-hit knockdown
    guillotine: {
      name: 'GUILLOTINE',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 44,
      damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 12],
      starWindow: [3, 5],
      kdWindow: [7, 10],
      noFake: true,
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'court', weight: 3, aggro: [0, 1],
      steps: [
        { idle: 28 }, { move: 'crownJab' }, { idle: 22 }, { move: 'carveL' }, { idle: 22 }, { move: 'scepterR' },
        { idle: 22 }, { move: 'carveR' }, { idle: 26 }, { taunt: 34 },
      ],
    },
    {
      id: 'execution', weight: 2,
      steps: [
        { idle: 24 }, { move: 'carveR' }, { idle: 20 }, { move: 'guillotine' }, { idle: 24 }, { move: 'crownJab' },
        { idle: 20 }, { move: 'scepterL' }, { idle: 26 }, { taunt: 32 },
      ],
    },
    {
      id: 'decree', weight: 3, aggro: [1, 2], fixed: true,
      steps: [
        { idle: 20 }, { move: 'decree1' }, { move: 'decree2' }, { idle: 20 }, { move: 'carveL' }, { idle: 18 },
        { move: 'guillotine' }, { idle: 22 },
      ],
    },
    {
      id: 'bloodlust', weight: 3, aggro: [2], fixed: true,
      steps: [
        { idle: 16 }, { move: 'carveL' }, { idle: 16 }, { move: 'carveR' }, { idle: 16 }, { move: 'decree1' }, { move: 'decree2' },
        { idle: 18 }, { move: 'scepterL' }, { idle: 16 }, { move: 'guillotine' }, { idle: 20 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'guillotine', golden: 'advance', window: [3, 6], taunt: 36, shout: 'KNEEL!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'crownSlips', type: 'stunTrigger', name: 'THE CROWN SLIPS',
      trigger: { state: 'windup', move: ['scepterL', 'scepterR'], counter: true, height: 'high' },
      effect: { stun: 110, hits: 9, say: 'THE CROWN SLIPS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'HE BENDS HIS HEAD FORWARD FOR THE SCEPTER, AND THE CROWN TIPS.' },
      scout: 'A HEAD COUNTER ON EITHER SCEPTER STRIKE KNOCKS HIS CROWN: STUNNED FOR 9 HITS.',
    },
    {
      id: 'decreeWithdrawn', type: 'patternBreak', name: 'DECREE WITHDRAWN',
      trigger: { state: 'windup', move: 'decree1', counter: true },
      effect: { cancelMoves: ['decree2', 'decree2L'], star: true, say: 'DECREE WITHDRAWN!' },
      hint: { kind: 'audio', text: 'THE DECREE IS ISSUED IN TWO PARTS.' },
      scout: 'COUNTER THE FIRST PUNCH OF THE DECREE: NO SECOND PUNCH, AND A STAR.',
    },
    {
      id: 'ignoredKing', type: 'bait', name: 'IGNORED KING', limit: 3,
      trigger: { on: 'passive', frames: 420 },
      effect: { script: [{ open: 60, anim: 'taunt', id: 'demand', comboLimit: 4, star: [0, 30] }], say: 'THE KING WILL NOT BE IGNORED!' },
      hint: { kind: 'quote', text: 'KNEEL!', hidden: true },
      scout: 'STAND STILL FOR 7 SECONDS AND HE STOPS TO DEMAND ATTENTION, WIDE OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'tribute', type: 'starHoard', name: 'THE KING\'S TRIBUTE', hold: 420, moves: ['crownJab', 'carveL', 'carveR', 'scepterL', 'scepterR'], say: 'TRIBUTE!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT CROWN JAB, CARVE OR SCEPTER COLLECTS ONE AS TRIBUTE, EVEN BLOCKED.',
    },
    {
      id: 'taxOnGuard', type: 'turtling', name: 'A TAX ON THE GUARD', response: 'drain', share: 0.4, span: 480, every: 50, say: 'THE KING TAXES YOUR GUARD!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND THE KING TAXES IT: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'courtSession', name: 'COURT IN SESSION', when: { left: 90 }, say: 'COURT IS IN SESSION!',
      steps: [{ idle: 24 }, { move: 'crownJab' }, { idle: 14 }, { move: 'carveL' }, { idle: 14 }, { move: 'carveR' }],
    },
    {
      id: 'theExecution', name: 'THE EXECUTION', when: { health: 0.3 }, say: 'OFF WITH HIS HEAD!',
      steps: [{ idle: 20 }, { move: 'decree1' }, { move: 'decree2' }, { idle: 16 }, { move: 'guillotine' }],
    },
  ],
  special: [{
    type: 'adapt', memory: 8, habit: 0.7, minRecovery: 14,
    levels: [
      { name: 'PATIENT', min: 0.67, gap: 1, recovery: 1, color: [18, 24, 31], shout: '' },
      { name: 'HUNGRY', min: 0.34, gap: 0.75, recovery: 0.85, color: [31, 24, 6], shout: 'THE KING GETS HUNGRY!' },
      { name: 'RUTHLESS', min: 0, gap: 0.55, recovery: 0.7, color: [31, 8, 8], shout: 'THE KING SMELLS BLOOD!' },
    ],
  }],
  // Title Defense remix: the restoration.
  titleDefense: {
    nickname: 'THE RESTORATION',
    quote: 'KINGS ARE NEVER DEPOSED. MERELY... INTERRUPTED.',
    lines: { win: 'LONG LIVE THE KING.', lose: 'THE CROWN... PASSES...' },
    tell: 0.85,
    costume: { B: { capeHi: [9, 12, 28], cape: [4, 6, 19], capeDk: [2, 3, 10] } },
    moves: {
      // new: regicide, a left uppercut (slip it, punish for a star)
      regicide: {
        name: 'REGICIDE',
        windupFrames: 9, activeFrames: 7, recoveryFrames: 34,
        damage: 19,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [2, 7],
        starWindow: [2, 3],
        punishStar: ['dodged'],
        sfx: { tell: 'growl', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: the scythe, a sweep across the realm (duck it)
      scythe: {
        name: 'THE SCYTHE',
        windupFrames: 10, activeFrames: 9, recoveryFrames: 28,
        damage: 17,
        avoidBy: ['duck'],
        counterWindow: [2, 8],
        starWindow: null,
        sfx: { tell: 'whoosh', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'coronation', weight: 3,
        steps: [
          { idle: 26 }, { move: 'crownJab' }, { idle: 22 }, { move: 'regicide' }, { idle: 22 }, { move: 'scythe' },
          { idle: 24 }, { move: 'carveL' }, { idle: 22 }, { move: 'guillotine' }, { idle: 26 }, { taunt: 32 },
        ],
      },
      {
        id: 'purge', weight: 3, fixed: true,
        steps: [
          { idle: 18 }, { move: 'scythe' }, { idle: 18 }, { move: 'decree1' }, { move: 'decree2' }, { idle: 18 },
          { move: 'regicide' }, { idle: 18 }, { move: 'scepterR' }, { idle: 22 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE GRAND PRIX CHAMPION AND A FORMER KING. HE WATCHES YOUR HEARTS AND GETS MEANER AS THEY RUN OUT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER RUN OUT OF HEARTS.', check: 'noPink' } },
  music: 'karverEntrance',
};
