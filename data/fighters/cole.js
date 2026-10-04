// #32 Cyclone Cole — Storm Circuit. Count the turns.
// Before a combo he spins on the spot. However many times he turns all the way
// round (you'll see his back each time, hear a whoosh, and an arrow ticks up
// over his head), that's how many hooks follow: one, two, three or four. They
// come one side then the other, always starting from the glove on YOUR right,
// and each has to be slipped AWAY from its glove: glove on your right, go left;
// glove on your left, go right.
// Hit him while he's spinning and the combo never comes. Catch him the moment
// he's facing you again at the end of his first turn (the glint) and he spins
// right down to the canvas. After a big four-spin combo he's dizzy: free shots.

const spin = (n) => ({
  name: `CYCLONE x${n}`,
  feint: true, call: true, spins: n,
  windupFrames: 12 * n + 3, activeFrames: 0, recoveryFrames: 3,
  damage: 0,
  avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
  counterWindow: [2, 12 * n],
  starWindow: n === 4 ? [2, 6] : null,
  kdWindow: n >= 2 ? [12, 15] : null,
  cancels: n,
  sfx: {},
  animation: { windup: [...Array(n).fill(['spinA', 'spinB', 'spinC', 'spinD']).flat(), 'spinSet'], windupRate: 3, active: ['spinSet'], recovery: ['spinSet'] },
});
// the hooks after a spin: the glove on the viewer's right first (slip LEFT), then alternating
const hookR = (last) => ({
  name: 'WHIRL',
  windupFrames: 10, activeFrames: 6, recoveryFrames: last ? 34 : 3,
  damage: 12,
  avoidBy: ['dodgeL'],
  counterWindow: null, starWindow: null,
  noFake: true,
  punishStar: undefined,
  sfx: { swing: 'swingHeavy' },
  animation: { windup: ['hookTell'], active: ['hook'], recovery: last ? ['hookTell', 'idle1'] : ['hook'] },
});
const hookL = (last) => ({
  ...hookR(last),
  avoidBy: ['dodgeR'],
  animation: { windup: ['hookLTell'], active: ['hookL'], recovery: last ? ['hookLTell', 'idle1'] : ['hookL'] },
});

export default {
  id: 'cole',
  name: 'CYCLONE COLE',
  short: 'COLE',
  nickname: 'THE WHIRLWIND',
  circuit: 'storm',
  rank: 1,
  isChampion: false,
  card: {
    age: 29,
    weight: 171,
    record: '32-3 21KO',
    hometown: 'THE DUST BOWL',
    quote: 'ROUND AND ROUND AND ROUND AND... WHERE WAS I?',
  },
  lines: {
    win: 'WHEEEE! YOU WANNA GO AGAIN?',
    lose: 'THE ROOM... IS... SPINNING...',
  },

  build: 'medium',
  palette: 'cole',
  spriteLayers: 'cole',

  stats: {
    health: 210,
    damageMult: 1.45,
    stunResistance: 3,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 2,
    stunComboLimit: 5,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.22,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 14 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 8 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['spinA', 'spinB', 'spinC', 'spinD'], rate: 4 },
    victory: { frames: ['victory', 'spinA'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
    dizzy: { frames: ['stunned1', 'stunned2'], rate: 6 },
  },

  moves: {
    dustJab: {
      name: 'DUST DEVIL',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    downburst: {
      name: 'DOWNBURST',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 24,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    spin1: spin(1), spin2: spin(2), spin3: spin(3), spin4: spin(4),
    w1: hookR(false), w2: hookL(false), w3: hookR(false),
    e1: hookR(true), e2: hookL(true), e3: hookR(true), e4: { ...hookL(true), punishStar: ['dodged'] },
  },

  patterns: [
    {
      id: 'dustDevil', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'dustJab' }, { idle: 36 }, { move: 'spin1' }, { move: 'e1' }, { idle: 36 }, { move: 'downburst' },
        { idle: 36 }, { move: 'spin2' }, { move: 'w1' }, { move: 'e2' }, { idle: 44 }, { taunt: 40 },
      ],
    },
    {
      id: 'waterspout', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'spin3' }, { move: 'w1' }, { move: 'w2' }, { move: 'e3' }, { idle: 36 }, { move: 'dustJab' },
        { idle: 30 }, { move: 'downburst' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'twister', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'spin2' }, { move: 'w1' }, { move: 'e2' }, { idle: 24 }, { move: 'downburst' }, { idle: 20 },
        { move: 'spin4' }, { move: 'w1' }, { move: 'w2' }, { move: 'w3' }, { move: 'e4' },
        { open: 70, anim: 'dizzy', id: 'dizzy', star: [0, 40], comboLimit: 5 },
        { idle: 20 }, { move: 'dustJab' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'funnelCloud', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 26 }, { move: 'spin1' }, { move: 'e1' }, { idle: 20 }, { move: 'spin3' }, { move: 'w1' }, { move: 'w2' }, { move: 'e3' },
        { idle: 22 }, { move: 'dustJab' }, { idle: 16 }, { move: 'downburst' }, { idle: 30 }, { taunt: 36 },
      ],
    },
    {
      id: 'f5', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 20 }, { move: 'spin4' }, { move: 'w1' }, { move: 'w2' }, { move: 'w3' }, { move: 'e4' },
        { open: 60, anim: 'dizzy', id: 'dizzy', star: [0, 34], comboLimit: 5 },
        { idle: 16 }, { move: 'spin2' }, { move: 'w1' }, { move: 'e2' }, { idle: 16 }, { move: 'downburst' },
        { idle: 16 }, { move: 'spin3' }, { move: 'w1' }, { move: 'w2' }, { move: 'e3' }, { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'spin4', then: ['w1', 'w2', 'w3'], keep: true, golden: 'windup', taunt: 40, shout: 'F5!', times: [1, 2] },

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.45 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'tooDizzy', type: 'instantKd', name: 'TOO DIZZY TO STAND',
      trigger: { state: 'open', open: 'dizzy', star: true },
      effect: { knockdown: true, say: 'HE SPUN RIGHT DOWN!' },
      hint: { kind: 'visual', text: 'AFTER FOUR TURNS HE CAN\'T STAND STRAIGHT.', hidden: true },
      scout: 'A STAR PUNCH WHILE HE\'S DIZZY AFTER A FOUR-SPIN COMBO IS AN INSTANT KNOCKDOWN.',
    },
    {
      id: 'showOff', type: 'bait', name: 'SHOWING OFF', limit: 3,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ move: 'spin4' }, { open: 60, anim: 'dizzy', id: 'dizzy', star: [0, 34], comboLimit: 5 }], say: 'HE CAN\'T HELP SHOWING OFF!' },
      hint: { kind: 'trainer', text: 'GIVE HIM A CROWD AND NOTHING TO HIT.' },
      scout: 'STAND STILL FOR 5 SECONDS AND HE SPINS FOUR TIMES FOR NOTHING, THEN STANDS THERE DIZZY: FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'dustDeflect', type: 'jabSpam', name: 'DUST DEVIL DEFLECTS', streak: 3, delay: 14, counter: 'downburst', say: 'SWEPT ASIDE!',
      scout: 'THREE JABS IN A ROW AND THE DUST DEVIL SWEEPS THE THIRD ASIDE, THEN DOWNBURSTS YOU IN THE BODY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'whirlwindRound', name: 'WHIRLWIND', when: { left: 90 }, say: 'THE WHIRLWIND!',
      steps: [{ idle: 20 }, { move: 'spin3' }, { move: 'w1' }, { move: 'w2' }, { move: 'e3' }],
    },
  ],
  special: [{ type: 'spinCount', rot: 12, arrows: true }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A TWISTER IN TRUNKS. COUNT HIS SPINS: THAT\'S HOW MANY PUNCHES ARE COMING.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'LAND 10 COUNTERS.', check: 'counters', n: 10 } },
  music: 'coleWalkup', // his walk-up jingle (data/music/walkups.js)
};
