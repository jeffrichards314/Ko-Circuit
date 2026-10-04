// #14 Admiral Anchor — Major Circuit. The anchor uppercut is a ONE-HIT KNOCKDOWN.
// It has the longest tell on the circuit (44 frames) and the quietest: his
// right glove sags a little below his guard, then that shoulder sinks, with
// the faint creak of a mooring line. No shout, no wind-up flourish. If it
// lands you're on the canvas. Slip it. Everything else is loud and honest:
// broadside hooks from both sides, a depth charge to the body, the keelhaul.
// Perfect hit: counter the anchor on exactly the right frames at the end of the tell.

export default {
  id: 'anchor',
  name: 'ADMIRAL ANCHOR',
  short: 'ANCHOR',
  nickname: 'THE OLD SALT',
  circuit: 'major',
  rank: 2,
  isChampion: false,
  card: {
    age: 61,
    weight: 248,
    record: '40-11 31KO',
    hometown: 'PIER 7',
    quote: 'I\'VE SUNK BIGGER SHIPS THAN YOU, SAILOR.',
  },
  lines: {
    win: 'MAN OVERBOARD! HAR HAR!',
    lose: 'ABANDON... SHIP...',
  },

  build: 'heavy',
  palette: 'anchor',
  spriteLayers: 'anchor',

  stats: {
    health: 180,
    damageMult: 1.25,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 56,
    hitstun: 14,
    betweenRoundHeal: 0.2,
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
    taunt: ['salute'],
    victory: { frames: ['victory', 'salute'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
  },

  moves: {
    torpedo: {
      name: 'TORPEDO',
      windupFrames: 20, activeFrames: 8, recoveryFrames: 22,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [6, 17],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    broadsideR: {
      name: 'BROADSIDE',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 6,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [6, 19],
      starWindow: null,
      sfx: { tell: 'foghorn', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    broadsideL: {
      name: 'BROADSIDE (2)',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 32,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    depthCharge: {
      name: 'DEPTH CHARGE',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 26,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [6, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    keelhaul: {
      name: 'KEELHAUL',
      windupFrames: 26, activeFrames: 10, recoveryFrames: 40,
      damage: 17,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 23],
      starWindow: [10, 20],
      sfx: { tell: 'foghorn', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // the one-hit knockdown: long, quiet tell
    anchorsAweigh: {
      name: 'ANCHORS AWEIGH',
      knockdown: true,
      windupFrames: 44, activeFrames: 10, recoveryFrames: 50,
      damage: 30,
      // blocking it stops the knockdown, but it breaks your guard for 2 seconds (knowledge spec K3/K6)
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      defenseCost: { block: { guardBreak: 120, hearts: 3, say: 'GUARD BROKEN!' } },
      counterWindow: [10, 41],
      starWindow: [18, 32],
      kdWindow: [36, 39],  // perfect hit
      sfx: { tell: 'creak', swing: 'swingHeavy' },
      animation: { windup: ['anchorTell1', 'anchorTell2'], windupRate: 22, active: ['anchorUp'], recovery: ['anchorUp', 'overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'shoreLeave', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'torpedo' }, { idle: 50 }, { move: 'broadsideR' }, { move: 'broadsideL' },
        { idle: 50 }, { move: 'depthCharge' }, { idle: 50 }, { move: 'anchorsAweigh' }, { idle: 50 },
        { move: 'keelhaul' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'squall', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'depthCharge' }, { idle: 30 }, { move: 'torpedo' }, { idle: 40 },
        { move: 'keelhaul' }, { idle: 50 }, { move: 'anchorsAweigh' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'fullSail', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'broadsideR' }, { move: 'broadsideL' }, { idle: 30 }, { move: 'torpedo' },
        { idle: 16 }, { move: 'anchorsAweigh' }, { idle: 30 }, { move: 'depthCharge' }, { idle: 24 },
        { move: 'keelhaul' }, { idle: 36 }, { move: 'torpedo' }, { idle: 20 }, { move: 'anchorsAweigh' },
        { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'mutiny', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'anchorsAweigh' }, { idle: 24 }, { move: 'broadsideR' }, { move: 'broadsideL' },
        { idle: 30 }, { move: 'depthCharge' }, { idle: 16 }, { move: 'torpedo' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'goingDown', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 }, { move: 'anchorsAweigh' }, { idle: 20 }, { move: 'torpedo' }, { idle: 12 }, { move: 'depthCharge' },
        { idle: 24 }, { move: 'broadsideR' }, { move: 'broadsideL' }, { idle: 20 }, { move: 'anchorsAweigh' },
        { idle: 30 }, { move: 'keelhaul' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'anchorsAweigh', golden: 'windup', window: [22, 24], hit: 'body', from: 'belowWaterline', taunt: 46, shout: 'ANCHORS AWEIGH!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
  ],
  antiStrategies: [
    {
      id: 'dropsAnchor', type: 'turtling', name: 'DROPS ANCHOR ON TURTLES', response: 'move', move: 'anchorsAweigh', share: 0.35, span: 480, cooldown: 900, say: 'ANCHORS AWAY!',
      scout: 'HIDE BEHIND YOUR GUARD AND HE DROPS THE ANCHOR ON YOU. BLOCK IT AND YOUR GUARD BREAKS FOR TWO SECONDS.',
    },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A NAVY ADMIRAL WITH ONE PUNCH THAT HAS SUNK SIXTEEN CAREERS. THE TELL IS LONG. THE LANDING IS FINAL.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DROP HIM WITH A PERFECT HIT.', check: 'kdBy', by: 'perfect' } },
  music: 'anchorWalkup', // his walk-up jingle (data/music/walkups.js)
};
