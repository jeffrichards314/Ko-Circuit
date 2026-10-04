// #11 Skyline Sam — Metro Circuit. The squeegee swipe must be DUCKED.
// He pulls the squeegee off his belt and cocks it way out wide: the swipe
// sweeps the whole ring at head height, so a side-step walks right into it
// and a block gets wiped away. Duck (down, down). Everything else is honest
// work: a spray jab, a low "drip" to the body (block it), a rappelling
// overhead (dodge it), and the High Rise uppercut.
// Perfect hit: counter the squeegee windup on exactly the right frames.

export default {
  id: 'sam',
  name: 'SKYLINE SAM',
  short: 'SAM',
  nickname: 'SQUEAKY CLEAN',
  circuit: 'metro',
  rank: 1,
  isChampion: false,
  card: {
    age: 34,
    weight: 181,
    record: '19-5 11KO',
    hometown: '40TH FLOOR, OUTSIDE',
    quote: 'I WORK 600 FEET UP ON A PLANK. YOU DON\'T SCARE ME.',
  },
  lines: {
    win: 'SPOTLESS. NEXT WINDOW!',
    lose: 'I THINK I\'LL TAKE THE ELEVATOR DOWN TODAY.',
  },

  build: 'medium',
  palette: 'sam',
  spriteLayers: 'sam',

  stats: {
    health: 160,
    damageMult: 1.2,
    stunResistance: 0,
    heartDrainOnBlock: 1,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 54,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 22 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['wipe1', 'wipe2'], rate: 8 },
    victory: ['victory'],
  },

  moves: {
    spray: {
      name: 'SPRAY JAB',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 22,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    drip: {
      name: 'DRIP',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 24,
      damage: 11,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    squeegee: {
      name: 'SQUEEGEE SWIPE',
      windupFrames: 26, activeFrames: 12, recoveryFrames: 36,
      damage: 16,
      avoidBy: ['duck'],   // dodging and blocking both fail
      counterWindow: [8, 23],
      starWindow: [12, 20],
      kdWindow: [20, 23],  // perfect hit
      sfx: { tell: 'squeegee', swing: 'swingHeavy' },
      animation: { windup: ['squeegeeTell'], active: ['squeegee1', 'squeegee2'], recovery: ['squeegee2', 'idle1'] },
    },
    rappel: {
      name: 'RAPPEL DROP',
      windupFrames: 26, activeFrames: 10, recoveryFrames: 36,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 23],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    highRise: {
      name: 'HIGH RISE',
      windupFrames: 24, activeFrames: 8, recoveryFrames: 30,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 21],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'morningShift', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'spray' }, { idle: 50 }, { move: 'squeegee' }, { idle: 50 },
        { move: 'drip' }, { idle: 40 }, { move: 'spray' }, { idle: 50 }, { move: 'rappel' },
        { idle: 50 }, { move: 'squeegee' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'topFloor', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'drip' }, { idle: 30 }, { move: 'highRise' }, { idle: 50 },
        { move: 'squeegee' }, { idle: 50 }, { move: 'spray' }, { idle: 40 }, { taunt: 60 },
      ],
    },
    {
      id: 'overtime', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'spray' }, { idle: 20 }, { move: 'squeegee' }, { idle: 36 },
        { move: 'drip' }, { idle: 20 }, { move: 'highRise' }, { idle: 36 }, { move: 'rappel' },
        { idle: 30 }, { move: 'spray' }, { idle: 16 }, { move: 'squeegee' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'streakFree', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'squeegee' }, { idle: 30 }, { move: 'drip' }, { idle: 18 }, { move: 'spray' },
        { idle: 30 }, { move: 'rappel' }, { idle: 36 }, { move: 'highRise' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'windyDay', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 }, { move: 'squeegee' }, { idle: 24 }, { move: 'spray' }, { idle: 14 }, { move: 'drip' },
        { idle: 24 }, { move: 'squeegee' }, { idle: 30 }, { move: 'rappel' }, { idle: 24 },
        { move: 'highRise' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'squeegee', golden: 'taunt', window: [14, 17], taunt: 44, shout: 'SQUEAKY CLEAN!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 6], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'tangledLine', type: 'stunTrigger', name: 'TANGLED IN HIS LINE',
      trigger: { on: 'resolved', move: 'rappel', result: 'dodged', dir: 'L' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5 }, say: 'TANGLED IN HIS LINE!', sfx: 'zip' },
      hint: { kind: 'trainer', text: 'HIS SAFETY LINE HANGS OFF TO YOUR LEFT.' },
      scout: 'SLIP THE RAPPEL DROP TO THE LEFT AND HE TANGLES IN HIS LINE: 5 FREE HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'squirt', type: 'turtling', name: 'SQUIRT IN THE EYES', response: 'unblockable', moves: ['spray'], share: 0.3, span: 480, cue: 'SQUIRT!',
      scout: 'HIDE BEHIND YOUR GLOVES TOO LONG AND HIS SPRAY JAB SQUIRTS RIGHT OVER THEM: SLIP OR DUCK IT.',
    },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'WASHES WINDOWS FORTY FLOORS UP. THE SQUEEGEE SWIPE COMES LOW AND WIDE: THERE\'S ONLY ONE WAY UNDER IT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DUCK THE SQUEEGEE TWICE.', check: 'moveResult', move: 'squeegee', result: 'ducked', n: 2 } },
  music: 'samWalkup', // his walk-up jingle (data/music/walkups.js)
};
