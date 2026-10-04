// #23 Tempest Tia — Continental Circuit. The wind changes.
// A few times a round she hops and switches stance, orthodox to southpaw and
// back: everything she throws comes from the other side, and every dodge
// flips with it. The rule never changes: DODGE AWAY FROM THE GLOVE. Her crosswind
// hook (glove cocked out on one side) can only be slipped away from that
// glove; her rip (the other hand, low and hooking up) the same. Only the jab and
// the body shot don't care which way you go.
// The switch itself is her opening: the hop leaves her floating. Hit her at the
// top of it (the glint) and she goes straight down. The badge under the clock
// always shows her current stance.

export default {
  id: 'tia',
  name: 'TEMPEST TIA',
  short: 'TIA',
  nickname: 'THE CHANGING WIND',
  circuit: 'continental',
  rank: 2,
  isChampion: false,
  card: {
    age: 27,
    weight: 136,
    record: '26-3 12KO',
    hometown: 'THE HARBOUR LIGHT',
    quote: 'YOU CAN\'T FIGHT THE WEATHER. YOU CAN ONLY GUESS.',
  },
  lines: {
    win: 'STORM\'S PASSED. YOU DIDN\'T.',
    lose: 'DEAD... CALM...',
  },

  build: 'lean',
  palette: 'tia',
  spriteLayers: 'tia',

  stats: {
    health: 170,
    damageMult: 1.25,
    stunResistance: 2,
    heartDrainOnBlock: 2,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 46,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 16 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['weathervane'],
    victory: ['windswept'],
    switch: { frames: ['hop1', 'hop2', 'hop2', 'hop1'], rate: 9 },
  },

  moves: {
    squall: {
      name: 'SQUALL JAB',
      windupFrames: 16, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 12],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    // glove cocked out on the viewer's right: slip LEFT (away from it)
    crosswind: {
      name: 'CROSSWIND',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the other hand, low and ripping up: slip RIGHT (away from it)
    riptide: {
      name: 'RIPTIDE',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeR'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'splash', swing: 'swingHeavy' },
      animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
    },
    undertow: {
      name: 'UNDERTOW',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 24,
      damage: 14,
      height: 'low',
      avoidBy: ['block', 'dodgeL', 'dodgeR'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // eye of the storm: a hook from each side, one after the other
    eye1: {
      name: 'EYE OF THE STORM',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 6,
      damage: 14,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [4, 16],
      starWindow: [6, 12],
      cancels: 1,
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    eye2: {
      name: 'EYE OF THE STORM (2)',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 34,
      damage: 14,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
  },

  // The stance switch: a hop on the spot. She's open all the way through it,
  // and the top of the hop is her perfect-hit moment.
  patterns: [
    {
      id: 'lightBreeze', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'squall' }, { idle: 40 }, { move: 'crosswind' }, { idle: 40 }, { move: 'riptide' },
        { idle: 36 }, { open: 36, anim: 'switch', id: 'switch', kd: [14, 17], star: [2, 12], comboLimit: 2 },
        { idle: 40 }, { move: 'crosswind' }, { idle: 36 }, { move: 'undertow' }, { idle: 40 }, { taunt: 50 },
      ],
    },
    {
      id: 'galeWarning', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 44 }, { move: 'riptide' }, { idle: 36 }, { move: 'eye1' }, { move: 'eye2' }, { idle: 40 },
        { open: 36, anim: 'switch', id: 'switch', kd: [14, 17], star: [2, 12], comboLimit: 2 },
        { idle: 36 }, { move: 'riptide' }, { idle: 36 }, { move: 'squall' }, { idle: 46 }, { taunt: 50 },
      ],
    },
    {
      id: 'squallLine', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 34 }, { move: 'crosswind' }, { idle: 24 }, { move: 'riptide' }, { idle: 28 },
        { open: 32, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 },
        { idle: 26 }, { move: 'crosswind' }, { idle: 20 }, { move: 'squall' }, { idle: 24 }, { move: 'eye1' }, { move: 'eye2' },
        { idle: 30 }, { move: 'undertow' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'whiteSquall', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'eye1' }, { move: 'eye2' }, { idle: 26 },
        { open: 32, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 },
        { idle: 22 }, { move: 'riptide' }, { idle: 22 }, { move: 'crosswind' }, { idle: 26 },
        { open: 32, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 },
        { idle: 22 }, { move: 'undertow' }, { idle: 20 }, { move: 'riptide' }, { idle: 36 }, { taunt: 40 },
      ],
    },
    {
      id: 'eyeWall', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 24 }, { move: 'riptide' }, { idle: 20 }, { move: 'crosswind' }, { idle: 20 },
        { open: 30, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 },
        { idle: 20 }, { move: 'eye1' }, { move: 'eye2' }, { idle: 20 }, { move: 'crosswind' }, { idle: 18 }, { move: 'riptide' },
        { idle: 26 }, { move: 'squall' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'eye1', then: ['eye2'], golden: 'windup', window: [10, 13], taunt: 40, shout: 'EYE OF THE STORM!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'wrongFooted', type: 'stunTrigger', name: 'WRONG-FOOTED',
      trigger: { state: 'open', open: 'switch', height: 'low', frames: [19, 30] },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 5 }, say: 'SHE LANDS WRONG-FOOTED!' },
      hint: { kind: 'visual', text: 'SHE TOUCHES DOWN ON HER HEELS AFTER EVERY HOP.' },
      scout: 'A BODY SHOT AS SHE LANDS FROM THE STANCE HOP LEAVES HER OPEN FOR 5 HITS.',
    },
    {
      id: 'underTheGale', type: 'quirk', name: 'UNDER THE GALE',
      trigger: { on: 'resolved', move: 'crosswind', result: 'ducked' },
      effect: { open: { frames: 60, anim: 'stunned', comboLimit: 4 }, say: 'THE GALE PASSES OVER!' },
      hint: { kind: 'trainer', text: 'YOU CAN DUCK THE CROSSWIND, TOO.' },
      scout: 'DUCK THE CROSSWIND HOOK: IT SPINS HER OFF BALANCE FOR 4 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'undertow', type: 'turtling', name: 'THE UNDERTOW', response: 'unblockable', moves: ['undertow'], cue: 'NO BLOCK!', say: 'THE UNDERTOW PULLS!',
      scout: 'HIDE BEHIND YOUR GUARD AND THE UNDERTOW DRAGS IT AWAY: IT CAN\'T BE BLOCKED, ONLY SLIPPED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'stormFront', name: 'STORM FRONT', when: { health: 0.5 }, say: 'THE STORM FRONT ARRIVES!',
      steps: [
        { open: 32, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 }, { idle: 14 }, { move: 'eye1' }, { move: 'eye2' }, { idle: 24 },
        { open: 32, anim: 'switch', id: 'switch', kd: [12, 15], star: [2, 10], comboLimit: 2 }, { idle: 14 }, { move: 'riptide' },
      ],
    },
  ],
  special: [{ type: 'stance', step: 'switch' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A SAILOR WHO SWITCHES STANCE WITH THE WIND. EVERY PATTERN YOU LEARNED FLIPS LEFT FOR RIGHT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER PUNCH INTO HER GUARD.', check: 'noGuarded' } },
  music: 'tiaWalkup', // his walk-up jingle (data/music/walkups.js)
};
