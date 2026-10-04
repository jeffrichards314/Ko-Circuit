// #39 Goliath Gunn — Grand Prix. Eight feet of retired artillery sergeant.
// You can't reach his head: every head shot whiffs ("TOO TALL!", no hearts
// lost), so fight him at belt height. Even his counters have to go to the body.
// Every body punch that lands fills his KNEE meter; when it's full he drops to
// one knee, and for a few seconds his head is right there: head shots land, the
// first one is a star, and there's a moment (the glint) where one punch
// finishes the job (perfect hit). Then he's back up and the meter starts over.
// Star Punches always reach (you jump for it).
// Artillery is his one-hit knockdown: both fists come down like a shell. Slip
// it. The Barrage sweeps across at head height: duck it.

export default {
  id: 'goliath',
  name: 'GOLIATH GUNN',
  short: 'GOLIATH',
  nickname: 'THE HOWITZER',
  circuit: 'grandprix',
  rank: 3,
  isChampion: false,
  card: {
    age: 34,
    weight: 388,
    record: '40-1 39KO',
    hometown: 'FORT GRANITE',
    quote: 'DOWN HERE, PRIVATE! OH WAIT. YOU CAN\'T REACH UP HERE.',
  },
  lines: {
    win: 'DISMISSED!',
    lose: 'TIMBERRR... WRONG GUY... BUT TIMBERRR...',
  },

  build: 'giant',
  palette: 'goliath',
  spriteLayers: 'goliath',

  stats: {
    health: 280,
    damageMult: 1.7,
    stunResistance: 6,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 30 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['salute1', 'salute2'], rate: 16 },
    victory: ['flex'],
    kneel: { frames: ['kneel1', 'kneel2'], rate: 20 },
  },

  moves: {
    ramrod: {
      name: 'RAMROD',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 5],
      counterWith: 'low',
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    mortar: {
      name: 'MORTAR',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 24,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 7],
      counterWith: 'low',
      starWindow: [2, 3],
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    trench: {
      name: 'TRENCH SHOT',
      windupFrames: 8, activeFrames: 7, recoveryFrames: 22,
      damage: 16,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 6],
      counterWith: 'low',
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // a flat sweep at head height: duck it
    barrage: {
      name: 'BARRAGE',
      windupFrames: 11, activeFrames: 8, recoveryFrames: 30,
      damage: 18,
      avoidBy: ['duck'],
      counterWindow: [2, 8],
      counterWith: 'low',
      starWindow: null,
      punishStar: ['ducked'],
      sfx: { tell: 'creakBig', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
    },
    // one-hit knockdown
    artillery: {
      name: 'ARTILLERY',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 46,
      damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 12],
      counterWith: 'low',
      starWindow: [3, 5],
      noFake: true,
      sfx: { tell: 'whistleDown', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'drill', weight: 3,
      steps: [
        { idle: 26 }, { move: 'ramrod' }, { idle: 20 }, { move: 'trench' }, { idle: 20 }, { move: 'mortar' },
        { idle: 22 }, { move: 'ramrod' }, { idle: 26 }, { taunt: 34 },
      ],
    },
    {
      id: 'bombardment', weight: 2,
      steps: [
        { idle: 24 }, { move: 'mortar' }, { idle: 20 }, { move: 'artillery' }, { idle: 24 }, { move: 'barrage' },
        { idle: 22 }, { move: 'trench' }, { idle: 26 }, { taunt: 34 },
      ],
    },
    {
      id: 'lastStand', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 20 }, { move: 'barrage' }, { idle: 18 }, { move: 'artillery' }, { idle: 20 }, { move: 'ramrod' },
        { idle: 16 }, { move: 'mortar' }, { idle: 18 }, { move: 'artillery' }, { idle: 24 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'artillery', golden: 'recovery', window: [12, 15], taunt: 38, shout: 'FIRE FOR EFFECT!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'buckledKnee', type: 'guardBreak', name: 'BUCKLED KNEE',
      trigger: { state: 'windup', move: 'trench', counter: true, height: 'low' },
      effect: { keep: true, mod: { kneelQ: 1 }, say: 'HIS KNEE BUCKLES!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HE PLANTS ALL HIS WEIGHT ON HIS FRONT KNEE FOR THE TRENCH SHOT.' },
      scout: 'A BODY-SHOT COUNTER ON THE TRENCH SHOT BUCKLES HIS KNEE AT ONCE: HE DROPS TO ONE KNEE WITHOUT FILLING THE METER.',
    },
    {
      id: 'barrageSweep', type: 'quirk', name: 'THE SWEEP TURNS HIM',
      trigger: { on: 'resolved', move: 'barrage', result: 'ducked' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6 }, say: 'THE SWEEP TURNS HIM ROUND!', sfx: 'whoosh' },
      hint: { kind: 'audio', text: 'THE BARRAGE SWEEPS ACROSS AT HEAD HEIGHT: DUCK IT.' },
      scout: 'DUCK THE BARRAGE: THE SWEEP TURNS HIM ROUND AND HE\'S OPEN FOR 6 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'swattedLikeAFly', type: 'jabSpam', name: 'SWATTED LIKE A FLY', streak: 3, delay: 14, counter: 'ramrod', say: 'SWATTED!',
      scout: 'THREE JABS IN A ROW AND HE SWATS THE THIRD ASIDE LIKE A FLY, THEN RAMRODS YOU.',
    },
  ],
  scriptedMoments: [
    {
      id: 'heavyArtillery', name: 'HEAVY ARTILLERY', when: { left: 75 }, say: 'HEAVY ARTILLERY!',
      steps: [{ idle: 20 }, { move: 'barrage' }, { idle: 24 }, { move: 'artillery' }],
    },
  ],
  special: [{
    type: 'kneel', meter: 48,
    step: { open: 110, anim: 'kneel', id: 'kneel', star: [2, 44], comboLimit: 99 },
  }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'EIGHT FEET TALL. YOU CAN\'T REACH HIS HEAD UNTIL YOU BRING HIM DOWN TO ONE KNEE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'BRING HIM DOWN TO ONE KNEE 3 TIMES.', check: 'cueCount', cue: '!kneel', n: 3 } },
  music: 'goliathWalkup', // his walk-up jingle (data/music/walkups.js)
};
