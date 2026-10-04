// #28 Glacier — World Circuit. He barely moves. He doesn't need to.
// Seven and a half feet of ice. Every punch you throw bounces off him (and
// costs hearts like a block) and he answers it with the Ice Shard, a counter
// that hits VERY hard. Slip or duck it and try again later.
// He can only be hurt inside a 4-frame window near the end of each of his
// windups. The ice gives it away: his whole body FLASHES pale blue for exactly
// those frames (the flash is timed for your punch to land in the window, so
// press on the flash). Land it and he's stunned: now the ice is cracked and
// every punch lands until he shakes it off. Star punches break through anytime.
// Ice Age is a one-hit knockdown overhead: slip it. The same flash on Ice Age,
// timed on the glint, brings the whole glacier down.

export default {
  id: 'glacier',
  name: 'GLACIER',
  short: 'GLACIER',
  nickname: 'THE ICE AGE',
  circuit: 'world',
  rank: 1,
  isChampion: false,
  card: {
    age: 41,
    weight: 362,
    record: '27-0 27KO',
    hometown: 'THE FAR NORTH',
    quote: '...',
  },
  lines: {
    win: '...MELT.',
    lose: '...THAW...',
  },

  build: 'giant',
  palette: 'glacier',
  spriteLayers: 'glacier',

  stats: {
    health: 230,
    damageMult: 1.45,
    stunResistance: 0,
    heartDrainOnBlock: 2,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 8,
    idleHitLimit: 0,
    idleGuard: 'none',
    stunFrames: 64,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 60 },
    block: ['idle1'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 22 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['exhale'],
    victory: { frames: ['victory', 'exhale'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
  },

  // counter windows are 4 frames, near the end of each windup
  moves: {
    floeJab: {
      name: 'FLOE',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 26,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [5, 8],
      starWindow: null,
      sfx: { tell: 'groan', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    calving: {
      name: 'CALVING',
      windupFrames: 13, activeFrames: 8, recoveryFrames: 28,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 9],
      starWindow: null,
      sfx: { tell: 'groan', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    permafrost: {
      name: 'PERMAFROST',
      windupFrames: 13, activeFrames: 8, recoveryFrames: 28,
      damage: 18,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 9],
      starWindow: null,
      sfx: { tell: 'groan', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // the one-hit knockdown
    iceAge: {
      name: 'ICE AGE',
      knockdown: true,
      windupFrames: 26, activeFrames: 10, recoveryFrames: 48,
      damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [10, 13],
      starWindow: [10, 11],
      kdWindow: [12, 13],  // perfect hit: the last two frames of the flash
      noFake: true,
      sfx: { tell: 'groan', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 13, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // the answer to every punch that bounces off him
    shard: {
      name: 'ICE SHARD',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 30,
      damage: 26,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'shatter', swing: 'swingHeavy' },
      animation: { windup: ['shardTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'drift', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 49 }, { move: 'floeJab' }, { idle: 42 }, { move: 'permafrost' }, { idle: 42 }, { move: 'calving' },
        { idle: 42 }, { move: 'iceAge' }, { idle: 49 }, { taunt: 60 },
      ],
    },
    {
      id: 'stillness', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 63 }, { move: 'calving' }, { idle: 35 }, { move: 'floeJab' }, { idle: 35 }, { move: 'floeJab' },
        { idle: 42 }, { move: 'permafrost' }, { idle: 56 }, { taunt: 60 },
      ],
    },
    {
      id: 'advance', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 35 }, { move: 'permafrost' }, { idle: 28 }, { move: 'calving' }, { idle: 28 }, { move: 'iceAge' },
        { idle: 35 }, { move: 'floeJab' }, { idle: 12 }, { move: 'floeJab' }, { idle: 25 }, { move: 'calving' }, { idle: 39 }, { taunt: 50 },
      ],
    },
    {
      id: 'crevasse', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 32 }, { move: 'iceAge' }, { idle: 28 }, { move: 'floeJab' }, { idle: 21 }, { move: 'permafrost' },
        { idle: 28 }, { move: 'floeJab' }, { idle: 39 }, { taunt: 50 },
      ],
    },
    {
      id: 'meltwater', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 25 }, { move: 'calving' }, { idle: 21 }, { move: 'iceAge' }, { idle: 21 }, { move: 'permafrost' },
        { idle: 18 }, { move: 'floeJab' }, { idle: 21 }, { move: 'iceAge' }, { idle: 32 }, { taunt: 40 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'iceAge', golden: 'windup', taunt: 42, shout: '...', times: [1, 2] },

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'thinIce', type: 'stunTrigger', name: 'THIN ICE',
      trigger: { state: 'windup', move: 'calving', counter: true, height: 'low' },
      effect: { stun: 100, hits: 10, say: 'THIN ICE!', sfx: 'shatter' },
      hint: { kind: 'visual', text: 'HIS BELLY IS THE CLEAREST ICE ON HIM.' },
      scout: 'A BODY-SHOT COUNTER ON THE FLASH OF A CALVING CRACKS HIM WIDE OPEN: STUNNED FOR 10 HITS.',
    },
    {
      id: 'iceAgeThaw', type: 'quirk', name: 'THE ICE AGE THAWS',
      trigger: { on: 'resolved', move: 'iceAge', result: 'dodged' },
      effect: { stun: 110, hits: 9, say: 'THE ICE AGE THAWS!', sfx: 'shatter' },
      hint: { kind: 'audio', text: 'THE ICE AGE COMES DOWN WITH A CRACK LIKE A RIVER BREAKING UP.' },
      scout: 'SLIP THE ICE AGE: HE CRACKS AND STAYS STUNNED FOR 9 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'deepFreeze', type: 'turtling', name: 'DEEP FREEZE', response: 'drain', share: 0.4, span: 480, every: 60, say: 'THE COLD SEEPS IN!',
      scout: 'KEEP YOUR GUARD UP AND THE COLD SEEPS THROUGH IT: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'coldSnap', name: 'COLD SNAP', when: { left: 75 }, say: 'A COLD SNAP!',
      steps: [{ idle: 20 }, { move: 'floeJab' }, { idle: 24 }, { move: 'calving' }, { idle: 24 }, { move: 'iceAge' }],
    },
  ],
  special: [{ type: 'frozen', move: 'shard', flash: 'glacier.thaw', lead: 4 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'SEVEN AND A HALF FEET OF ICE. HE BARELY MOVES AND ONLY CRACKS FOR AN INSTANT MID-WINDUP.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'KNOCK HIM DOWN WITH COUNTERS ONLY.', check: 'kdOnly', by: 'counter' } },
  music: 'glacierWalkup', // his walk-up jingle (data/music/walkups.js)
};
