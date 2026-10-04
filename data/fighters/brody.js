// #8 Brick Wall Brody — Minor Circuit champion. Only counters open him up.
// Jabs never stagger him: every punch that isn't a counter thuds off him with
// no flinch at all (and costs you hearts like a block). Hit him DURING a
// windup and he's stunned, and then the wall comes down. Star punches still land.

export default {
  id: 'brody',
  name: 'BRICK WALL BRODY',
  short: 'BRODY',
  nickname: 'THE WALL',
  circuit: 'minor',
  rank: 0,
  isChampion: true,
  card: {
    age: 36,
    weight: 256,
    record: '24-2 18KO',
    hometown: 'QUARRY ROAD',
    quote: '...',
  },
  lines: {
    win: '...',
    lose: '...HUH.',
  },

  build: 'heavy',
  palette: 'brody',
  spriteLayers: 'brody',

  stats: {
    health: 150,
    damageMult: 1.2,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 7,     // once the wall comes down, it comes down hard
    idleHitLimit: 1,
    idleGuard: 'none',
    stunFrames: 64,
    hitstun: 14,
    betweenRoundHeal: 0.15,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 30 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 20 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['stoic'],
    victory: { frames: ['victory', 'stoic'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
  },

  moves: {
    mortarJab: {
      name: 'MORTAR JAB',
      windupFrames: 26, activeFrames: 8, recoveryFrames: 22,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [10, 23],
      starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    foundation: {
      name: 'FOUNDATION',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 26,
      damage: 11,
      avoidBy: ['block'],
      counterWindow: [10, 25],
      starWindow: null,
      height: 'low',
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    wreckingBall: {
      name: 'WRECKING BALL',
      windupFrames: 34, activeFrames: 10, recoveryFrames: 40,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [10, 31],
      starWindow: [14, 28],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    brickLayer1: {
      name: 'BRICKLAYER',
      windupFrames: 28, activeFrames: 8, recoveryFrames: 6,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [10, 25],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    brickLayer2: {
      name: 'BRICKLAYER (2)',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 34,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null,
      starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    cementMixer: {
      name: 'CEMENT MIXER',
      windupFrames: 36, activeFrames: 8, recoveryFrames: 44,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 33],
      starWindow: [16, 30],
      kdWindow: [26, 29],  // perfect hit: a counter on exactly these frames drops him
      sfx: { tell: 'thud', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'groundwork', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 70 }, { move: 'mortarJab' }, { idle: 60 }, { move: 'foundation' }, { idle: 60 },
        { move: 'wreckingBall' }, { idle: 60 }, { move: 'brickLayer1' }, { move: 'brickLayer2' },
        { idle: 60 }, { move: 'cementMixer' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'loadBearing', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'foundation' }, { idle: 24 }, { move: 'mortarJab' }, { idle: 40 },
        { move: 'cementMixer' }, { idle: 40 }, { move: 'brickLayer1' }, { move: 'brickLayer2' }, { idle: 36 },
        { move: 'wreckingBall' }, { idle: 30 }, { move: 'foundation' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'demolition', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 40 }, { move: 'wreckingBall' }, { idle: 30 }, { move: 'foundation' }, { idle: 20 },
        { move: 'mortarJab' }, { idle: 30 }, { move: 'cementMixer' }, { idle: 30 },
        { move: 'brickLayer1' }, { move: 'brickLayer2' }, { idle: 50 }, { taunt: 40 },
      ],
    },
    // his scripted moment under 30% (RUBBLE): all-out, and the Foundation (his crumbling exploit) comes often
    {
      id: 'rubble', script: 'rubble',
      steps: [
        { idle: 30 }, { move: 'foundation' }, { idle: 24 }, { move: 'wreckingBall' }, { idle: 24 },
        { move: 'foundation' }, { idle: 20 }, { move: 'mortarJab' }, { idle: 30 }, { move: 'brickLayer1' }, { move: 'brickLayer2' }, { idle: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'cementMixer', golden: 'recovery', window: [10, 13], taunt: 46, shout: '...', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'weakBrick', type: 'guardBreak', name: 'THE WEAK BRICK', limit: 1,
      trigger: { counter: true, height: 'low', count: 3, notFlag: 'cracked' },
      effect: { keep: true, flag: 'cracked', say: 'THE WALL CRACKS!', sfx: 'crunch' },
      hint: { kind: 'trainer', text: 'EVERY WALL HAS A WEAK BRICK.' },
      scout: 'THREE BODY-SHOT COUNTERS CRACK THE WALL: FROM THEN ON YOUR JABS STAGGER HIM.',
    },
    {
      id: 'droppedBrick', type: 'patternBreak', name: 'DROPPED BRICK',
      trigger: { state: 'windup', move: 'brickLayer1', counter: true },
      effect: { cancelMoves: ['brickLayer2'], stun: 80, hits: 9, say: 'HE DROPPED THE BRICK!' },
      hint: { kind: 'trainer', text: 'STOP THE BRICKLAYER BEFORE THE SECOND HOOK.' },
      scout: 'COUNTER THE FIRST BRICKLAYER HOOK: NO SECOND HOOK, AND 9 HITS INSTEAD OF 7.',
    },
    {
      id: 'crumbling', type: 'quirk', name: 'CRUMBLING FOUNDATION',
      trigger: { on: 'resolved', move: 'foundation', result: 'blocked', health: [0, 0.35] },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 4 }, say: 'THE FOUNDATION CRUMBLES!', sfx: 'crunch' },
      hint: { kind: 'trainer', text: 'BLOCK THE FOUNDATION WHEN HE\'S HURT.' },
      scout: 'UNDER A THIRD OF HIS HEALTH, BLOCKING THE FOUNDATION LEAVES HIM OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'pushesBack', type: 'jabSpam', name: 'THE WALL PUSHES BACK', streak: 3, counter: 'mortarJab', say: 'PUSHED BACK!',
      scout: 'THREE JABS IN A ROW AND HE SHOVES THE THIRD ASIDE AND FIRES A MORTAR JAB.',
    },
    {
      id: 'smellsBlood', type: 'getUpMash', name: 'SMELLS BLOOD', response: 'harder', mult: 1.35, punches: 3, say: 'HE SMELLS BLOOD!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT THREE PUNCHES HIT HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'setInStone', name: 'SET IN STONE', when: { left: 90 }, say: 'BRODY PLANTS HIS FEET...',
      steps: [{ block: 60 }, { move: 'wreckingBall' }, { idle: 40 }, { move: 'wreckingBall' }],
    },
    { id: 'rubble', name: 'RUBBLE', when: { health: 0.3 }, patterns: 'rubble', say: 'THE WALL IS CRUMBLING!' },
  ],
  special: [{ type: 'unstaggerable' }],
  // Title Defense remix: the second storey.
  titleDefense: {
    nickname: 'LOAD BEARING',
    quote: 'I ADDED A FLOOR. NOW I\'M TWICE AS HARD TO KNOCK DOWN.',
    lines: { win: 'BUILT TO CODE. UNLIKE YOU.', lose: 'CONDEMNED...' },
    tell: 0.72,
    costume: { B: { brickHi: [14, 16, 20], brick: [9, 10, 14], brickSh: [5, 5, 8], mortar: [22, 22, 24] } },
    moves: {
      // new: a left uppercut from the rebar (slip it)
      rebar: {
        name: 'REBAR',
        windupFrames: 30, activeFrames: 8, recoveryFrames: 36,
        damage: 14,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [10, 27],
        starWindow: [14, 24],
        sfx: { tell: 'crunch', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new: both fists overhead, straight down (slip it)
      sledge: {
        name: 'SLEDGEHAMMER',
        windupFrames: 36, activeFrames: 10, recoveryFrames: 44,
        damage: 17,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [10, 33],
        starWindow: [16, 28],
        sfx: { tell: 'groan', swing: 'swingHeavy' },
        animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 18, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'skyscraper', weight: 1,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 64 }, { move: 'mortarJab' }, { idle: 50 }, { move: 'rebar' }, { idle: 50 }, { move: 'foundation' },
          { idle: 50 }, { move: 'sledge' }, { idle: 56 }, { move: 'brickLayer1' }, { move: 'brickLayer2' },
          { idle: 50 }, { move: 'cementMixer' }, { idle: 50 }, { taunt: 56 },
        ],
      },
      {
        id: 'renovation', weight: 1,
        when: { rounds: [2, 3], health: [0.5, 1] },
        steps: [
          { idle: 46 }, { move: 'sledge' }, { idle: 36 }, { move: 'foundation' }, { idle: 24 }, { move: 'mortarJab' },
          { idle: 36 }, { move: 'rebar' }, { idle: 36 }, { move: 'brickLayer1' }, { move: 'brickLayer2' },
          { idle: 30 }, { move: 'cementMixer' }, { idle: 44 }, { taunt: 48 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE MINOR CHAMPION. THEY SAY HE HAS NEVER TAKEN A STEP BACKWARD, AND NOBODY HAS MADE HIM.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'PUT HIM DOWN WITH A STAR PUNCH.', check: 'kdBy', by: 'star' } },
  music: 'brodyEntrance',
};
