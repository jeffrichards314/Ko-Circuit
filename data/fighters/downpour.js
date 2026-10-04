// #31 Downpour — Storm Circuit. It never stops raining on Downpour.
// A sheet of rain falls between you and him, streaking across his tells, and it
// gets heavier every round. You won't always see the windup clearly, so LISTEN:
// every punch has its own sound, and it's the same sound every time.
//   drip             Drizzle jab          (anything works)
//   splash           Sheet hook           (slip or duck)
//   thud             Puddle, to the body  (block)
//   splash + splash  Flash Flood: a hook from each side (slip, then slip back)
//   thunder          Cloudburst overhead  (slip) - a one-hit knockdown
// Perfect hit: when he stops to wring out his soaked hood (the taunt), one
// punch on the glint puts him down.

export default {
  id: 'downpour',
  name: 'DOWNPOUR',
  short: 'DOWNPOUR',
  nickname: 'THE WET BLANKET',
  circuit: 'storm',
  rank: 2,
  isChampion: false,
  card: {
    age: 33,
    weight: 176,
    record: '28-5 19KO',
    hometown: 'A GREY TOWN WHERE IT ALWAYS RAINS',
    quote: 'EVERY PARADE. EVERY PICNIC. EVERY FIGHT.',
  },
  lines: {
    win: 'SORRY ABOUT YOUR WEEKEND.',
    lose: 'CLEARING UP... LATER...',
  },

  build: 'medium',
  palette: 'downpour',
  spriteLayers: 'downpour',

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
    idle: { frames: ['idle1', 'idle2'], rate: 30 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['wring1', 'wring2'], rate: 10 },
    victory: ['wring1'],
  },

  moves: {
    drizzle: {
      name: 'DRIZZLE',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'drip', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    sheet: {
      name: 'SHEET',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 26,
      damage: 16,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'splash', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    puddle: {
      name: 'PUDDLE',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 24,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'thud', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    flood1: {
      name: 'FLASH FLOOD',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 4,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'splash', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    flood2: {
      name: 'FLASH FLOOD (2)',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 32,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'splash', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    cloudburst: {
      name: 'CLOUDBURST',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 14],
      starWindow: [3, 5],
      noFake: true,
      sfx: { tell: 'thunder', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'overcast', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 46 }, { move: 'drizzle' }, { idle: 36 }, { move: 'sheet' }, { idle: 36 }, { move: 'puddle' },
        { idle: 36 }, { move: 'flood1' }, { move: 'flood2' }, { idle: 36 }, { move: 'cloudburst' }, { idle: 44 }, { taunt: 60 },
      ],
    },
    {
      id: 'showers', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'puddle' }, { idle: 30 }, { move: 'drizzle' }, { idle: 26 }, { move: 'sheet' },
        { idle: 30 }, { move: 'drizzle' }, { idle: 40 }, { taunt: 60 },
      ],
    },
    {
      id: 'deluge', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'sheet' }, { idle: 20 }, { move: 'flood1' }, { move: 'flood2' }, { idle: 24 },
        { move: 'cloudburst' }, { idle: 26 }, { move: 'puddle' }, { idle: 16 }, { move: 'drizzle' }, { idle: 30 }, { taunt: 50 },
      ],
    },
    {
      id: 'monsoon', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 26 }, { move: 'drizzle' }, { idle: 16 }, { move: 'puddle' }, { idle: 16 }, { move: 'sheet' }, { idle: 20 },
        { move: 'flood1' }, { move: 'flood2' }, { idle: 20 }, { move: 'cloudburst' }, { idle: 30 }, { taunt: 50 },
      ],
    },
    {
      id: 'floodWatch', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 22 }, { move: 'cloudburst' }, { idle: 20 }, { move: 'flood1' }, { move: 'flood2' }, { idle: 16 },
        { move: 'sheet' }, { idle: 14 }, { move: 'puddle' }, { idle: 16 }, { move: 'cloudburst' }, { idle: 26 }, { taunt: 44 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'cloudburst', golden: 'taunt', window: [18, 21], taunt: 40, shout: 'CLOUDBURST!', times: [1, 2] },

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.45 },
    { upAt: null },
  ],



  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'slippedInPuddle', type: 'environment', name: 'SLIPPED IN THE PUDDLE',
      trigger: { on: 'resolved', move: 'puddle', result: 'blocked' },
      effect: { open: { frames: 72, anim: 'stunned', comboLimit: 5 }, say: 'HE SLIPPED IN HIS OWN PUDDLE!', sfx: 'splash' },
      hint: { kind: 'audio', text: 'THUD, THEN A SPLASH AS HIS FOOT COMES DOWN.' },
      scout: 'BLOCK THE PUDDLE, HIS BODY SHOT: HE SLIPS ON THE WET CANVAS AND IS OPEN FOR 5 HITS.',
    },
    {
      id: 'floodGates', type: 'patternBreak', name: 'FLOOD GATES SHUT',
      trigger: { state: 'windup', move: 'flood1', counter: true },
      effect: { cancelMoves: ['flood2'], stun: 85, hits: 7, say: 'THE FLOOD GATES SHUT!', sfx: 'splash' },
      hint: { kind: 'audio', text: 'TWO SPLASHES: THE FLASH FLOOD.' },
      scout: 'COUNTER THE FIRST HOOK OF THE FLASH FLOOD: NO SECOND HOOK, AND STUNNED FOR 7 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'wringsHood', type: 'passivity', name: 'WRINGS OUT HIS HOOD', response: 'snack', frames: 300, limit: 1, say: 'HE WRINGS OUT HIS HOOD!',
      step: { open: 60, anim: 'taunt', id: 'wring', heal: 0.06, star: [0, 60], interrupt: true, stunOnInterrupt: 40, sfx: 'drip' },
      scout: 'STAND AROUND FOR 5 SECONDS AND HE WRINGS OUT HIS SOAKED HOOD TO HEAL A LITTLE (ONCE A ROUND). HIT HIM WHILE HE DOES IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'cloudBreak', name: 'CLOUDBREAK', when: { left: 75 }, say: 'THE CLOUDS BREAK OPEN!',
      steps: [{ idle: 20 }, { move: 'drizzle' }, { idle: 14 }, { move: 'flood1' }, { move: 'flood2' }, { idle: 24 }, { move: 'cloudburst' }],
    },
  ],
  special: [{ type: 'rain', density: [70, 120, 180] }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'HE FIGHTS IN THE RAIN AND LIKES IT. EVERY ROUND THE RAIN GETS HEAVIER AND HIS TELLS HARDER TO SEE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'KO HIM IN ROUND 1, BEFORE THE RAIN GETS HEAVY.', check: 'round1' } },
  music: 'downpourWalkup', // his walk-up jingle (data/music/walkups.js)
};
