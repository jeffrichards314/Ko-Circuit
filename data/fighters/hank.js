// #27 Hurricane Hank — World Circuit. Category five.
// He winds both arms like a pinwheel and roars; then EIGHT punches come in a
// steady rhythm, left, right, left, right... and a closing uppercut. Every one
// of the eight straights has to be slipped AWAY from its glove (glove on your
// left, slip right; glove on your right, slip left); a clean slip lets you slip
// again straight away, so it's one long dance. Miss ONE and you're caught in
// the storm: the rest of the flurry lands while you're still reeling, and the
// Eye Wall uppercut at the end becomes a one-hit knockdown.
// Counter the wind-up and the whole flurry is off (star if you're early, and
// the glint drops him). Slip the Eye Wall and the first shot back is a star.

const L = (n) => ({
  name: `FLURRY ${n}`,
  windupFrames: 12, activeFrames: 4, recoveryFrames: 2,
  damage: 7,
  avoidBy: ['dodgeR'],
  counterWindow: null, starWindow: null,
  flurry: true, noFake: true,
  sfx: { tell: 'tick', swing: 'whiff' },
  animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
});
const R = (n) => ({
  name: `FLURRY ${n}`,
  windupFrames: 12, activeFrames: 4, recoveryFrames: 2,
  damage: 7,
  avoidBy: ['dodgeL'],
  counterWindow: null, starWindow: null,
  flurry: true, noFake: true,
  sfx: { tell: 'tick', swing: 'whiff' },
  animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
});
const FLURRY = [
  { move: 'hurricane' },
  { move: 'f1' }, { move: 'f2' }, { move: 'f3' }, { move: 'f4' }, { move: 'f5' },
  { move: 'f6' }, { move: 'f7' }, { move: 'f8' }, { move: 'eyeWall' },
];

export default {
  id: 'hank',
  name: 'HURRICANE HANK',
  short: 'HANK',
  nickname: 'CATEGORY FIVE',
  circuit: 'world',
  rank: 2,
  isChampion: false,
  card: {
    age: 35,
    weight: 189,
    record: '38-4 27KO',
    hometown: 'TORNADO ALLEY',
    quote: 'THEY NAME STORMS AFTER ME. THEY RETIRE THE NAMES.',
  },
  lines: {
    win: 'HOW\'S THE WEATHER DOWN THERE?',
    lose: 'DOWNGRADED... TO A... TROPICAL... DEPRESSION...',
  },

  build: 'medium',
  palette: 'hank',
  spriteLayers: 'hank',

  stats: {
    health: 200,
    damageMult: 1.35,
    stunResistance: 3,
    heartDrainOnBlock: 2,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 46,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 12 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 12 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['pinwheel1', 'pinwheel2'], rate: 6 },
    victory: ['victory'],
  },

  moves: {
    gust: {
      name: 'GUST',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 9],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    downdraft: {
      name: 'DOWNDRAFT',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 24,
      damage: 14,
      height: 'low',
      avoidBy: ['block', 'dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    shear: {
      name: 'WIND SHEAR',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [3, 11],
      starWindow: null,
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the wind-up: arms windmilling. Counter it and the flurry never comes.
    hurricane: {
      name: 'CATEGORY FIVE',
      feint: true, call: true,
      windupFrames: 30, activeFrames: 0, recoveryFrames: 6,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 26],
      starWindow: [3, 6],
      kdWindow: [18, 21],
      cancels: 11,
      sfx: { tell: 'gust' },
      animation: { windup: ['pinwheel1', 'pinwheel2'], windupRate: 4, active: ['pinwheel2'], recovery: ['crouchTell'] },
    },
    f1: L(1), f2: R(2), f3: L(3), f4: R(4), f5: L(5), f6: R(6), f7: L(7), f8: R(8), f9: L(9), f10: R(10),
    eyeWall: {
      name: 'EYE WALL',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 46,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      flurry: true, flurryEnd: true, noFake: true,
      punishStar: ['dodged'],
      sfx: { tell: 'roar', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'tropicalStorm', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'gust' }, { idle: 40 }, { move: 'downdraft' }, { idle: 40 }, { move: 'shear' },
        { idle: 50 }, ...FLURRY, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'squalls', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'shear' }, { idle: 30 }, { move: 'gust' }, { idle: 30 }, { move: 'downdraft' },
        { idle: 30 }, { move: 'shear' }, { idle: 44 }, { taunt: 40 },
      ],
    },
    {
      id: 'landfall', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 34 }, { move: 'gust' }, { idle: 20 }, { move: 'shear' }, { idle: 30 }, ...FLURRY,
        { idle: 30 }, { move: 'downdraft' }, { idle: 20 }, { move: 'gust' }, { idle: 34 }, { taunt: 36 },
      ],
    },
    {
      id: 'stormSurge', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'downdraft' }, { idle: 20 }, { move: 'shear' }, { idle: 20 }, { move: 'gust' },
        { idle: 16 }, { move: 'shear' }, { idle: 36 }, { taunt: 36 },
      ],
    },
    {
      id: 'eyeOfIt', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, ...FLURRY, { idle: 24 }, { move: 'shear' }, { idle: 16 }, { move: 'downdraft' },
        { idle: 20 }, ...FLURRY, { idle: 30 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'hurricane', then: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'eyeWall'], keep: true, golden: 'windup', taunt: 42, shout: 'CATEGORY FIVE!', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'windKnockedOut', type: 'stunTrigger', name: 'WIND KNOCKED OUT',
      trigger: { state: 'windup', move: 'gust', counter: true, height: 'low' },
      effect: { stun: 96, hits: 9, say: 'KNOCKED THE WIND OUT!', sfx: 'oof' },
      hint: { kind: 'trainer', text: 'A HURRICANE NEEDS AIR. GUT HIM.' },
      scout: 'A BODY-SHOT COUNTER ON THE GUST KNOCKS THE WIND OUT OF HIM: STUNNED FOR 9 HITS.',
    },
    {
      id: 'blownOut', type: 'quirk', name: 'BLOWN OUT',
      trigger: { on: 'resolved', move: 'eyeWall', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 7, star: [0, 30] }, say: 'HE\'S BLOWN OUT!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'AFTER THE EYE WALL HE\'S PANTING LIKE A BELLOWS.' },
      scout: 'SLIP THE EYE WALL UPPERCUT: HE\'S BLOWN OUT AND OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'eyeSwallows', type: 'starHoard', name: 'THE EYE SWALLOWS', hold: 420, moves: ['shear', 'eyeWall', 'downdraft'], say: 'STAR SWALLOWED!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS WIND SHEAR, EYE WALL OR DOWNDRAFT SUCKS ONE OUT OF YOUR HAND, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'stormLandfall', name: 'LANDFALL', when: { health: 0.4 }, say: 'THE STORM MAKES LANDFALL!',
      steps: [
        { idle: 20 }, { move: 'hurricane' },
        { move: 'f1' }, { move: 'f2' }, { move: 'f3' }, { move: 'f4' }, { move: 'f5' }, { move: 'f6' }, { move: 'f7' }, { move: 'f8' }, { move: 'eyeWall' },
      ],
    },
  ],
  special: [{ type: 'hurricane' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A STORM CHASER WHO BECAME THE STORM. HIS FLURRIES DON\'T STOP UNTIL YOU MAKE A MISTAKE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DON\'T BLOCK ONCE: SLIP THE WHOLE STORM.', check: 'never', defense: 'blocked' } },
  music: 'hankWalkup', // his walk-up jingle (data/music/walkups.js)
};
