// #22 "Big Rig" Rusty — Continental Circuit. Eighteen wheels of bad attitude.
// His big one is the BULL RUSH: he drops his head, paws the canvas and his
// air horn goes HONK... HONNNK. Then he charges. It's a one-hit knockdown if it
// lands, it can't be blocked or ducked, but slip it (either side) and he
// ploughs straight into the ropes and hangs there dazed: free shots, and the
// first one is a star. Counter him while he's pawing the canvas for a star,
// or right as he lowers his head (the glint) to flip the whole truck over.
// Everything else is honest trucker boxing: a jab, a jackknife hook (sometimes
// doubled back from the other side), a low tailgate to the body and the
// gear-grinder overhead.

export default {
  id: 'rusty',
  name: '"BIG RIG" RUSTY',
  short: 'RUSTY',
  nickname: 'THE EIGHTEEN-WHEELER',
  circuit: 'continental',
  rank: 3,
  isChampion: false,
  card: {
    age: 44,
    weight: 262,
    record: '29-9 24KO',
    hometown: 'MILE MARKER 318',
    quote: 'I DON\'T BRAKE FOR ROOKIES.',
  },
  lines: {
    win: 'HONK HONK! THAT\'S A WIDE LOAD COMIN\' THROUGH!',
    lose: 'JACKKNIFED... ON THE... ON-RAMP...',
  },

  build: 'heavy',
  palette: 'rusty',
  spriteLayers: 'rusty',

  stats: {
    health: 200,
    damageMult: 1.3,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 50,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['hornPull1', 'hornPull2'], rate: 12 },
    victory: { frames: ['victory', 'hornPull1'], rate: 40 }, // arms up, then his taunt pose (§2: its own frame)
    crash: { frames: ['crash1', 'crash2'], rate: 16 },
  },

  moves: {
    hornJab: {
      name: 'HONK JAB',
      windupFrames: 16, activeFrames: 6, recoveryFrames: 22,
      damage: 12,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 12],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    jackknife: {
      name: 'JACKKNIFE',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // the double clutch: jackknife, then straight back from the other side
    clutch1: {
      name: 'DOUBLE CLUTCH',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 6,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 14],
      starWindow: null,
      cancels: 1,
      sfx: { tell: 'engine', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
    },
    clutch2: {
      name: 'DOUBLE CLUTCH (2)',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 32,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    tailgate: {
      name: 'TAILGATE',
      windupFrames: 18, activeFrames: 8, recoveryFrames: 26,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 14],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    gearGrinder: {
      name: 'GEAR GRINDER',
      windupFrames: 22, activeFrames: 10, recoveryFrames: 40,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 18],
      starWindow: [6, 12],
      sfx: { tell: 'engine', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // the bull rush: a one-hit knockdown. Dodge it and he eats the ropes.
    bullRush: {
      name: 'BULL RUSH',
      knockdown: true,
      windupFrames: 36, activeFrames: 10, recoveryFrames: 40,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [6, 30],
      starWindow: [8, 18],
      kdWindow: [24, 27],  // perfect hit: as his head goes down
      noFake: true,
      openAfter: { when: ['dodged'], open: 96, anim: 'crash', id: 'crash', star: [0, 60], comboLimit: 8, sfx: 'crash', shake: 10 },
      sfx: { tell: 'truckHorn', swing: 'swingHeavy' },
      animation: { windup: ['paw1', 'paw2', 'paw1', 'chargeTell', 'chargeTell'], windupRate: 8, active: ['charge'], recovery: ['charge', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'firstGear', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 56 }, { move: 'hornJab' }, { idle: 40 }, { move: 'jackknife' }, { idle: 40 }, { move: 'tailgate' },
        { idle: 44 }, { move: 'bullRush' }, { idle: 50 }, { taunt: 56 },
      ],
    },
    {
      id: 'deadhead', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'tailgate' }, { idle: 36 }, { move: 'clutch1' }, { move: 'clutch2' }, { idle: 40 },
        { move: 'gearGrinder' }, { idle: 50 }, { taunt: 50 },
      ],
    },
    {
      id: 'overdrive', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'hornJab' }, { idle: 24 }, { move: 'clutch1' }, { move: 'clutch2' }, { idle: 30 },
        { move: 'bullRush' }, { idle: 36 }, { move: 'tailgate' }, { idle: 28 }, { move: 'gearGrinder' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'convoy', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'bullRush' }, { idle: 30 }, { move: 'jackknife' }, { idle: 20 }, { move: 'hornJab' },
        { idle: 24 }, { move: 'tailgate' }, { idle: 30 }, { move: 'bullRush' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'runaway', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 26 }, { move: 'bullRush' }, { idle: 24 }, { move: 'clutch1' }, { move: 'clutch2' }, { idle: 20 },
        { move: 'hornJab' }, { idle: 16 }, { move: 'gearGrinder' }, { idle: 24 }, { move: 'bullRush' }, { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'bullRush', golden: 'advance', window: [6, 9], taunt: 44, shout: 'HONK HONK!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'blownGasket', type: 'stunTrigger', name: 'BLOWN GASKET',
      trigger: { state: 'windup', move: 'gearGrinder', counter: true, height: 'low' },
      effect: { stun: 90, hits: 8, say: 'BLOWN GASKET!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE GEAR GRINDER SOUNDS LIKE AN ENGINE ABOUT TO SEIZE.' },
      scout: 'A BODY-SHOT COUNTER ON THE GEAR GRINDER BLOWS HIS GASKET: STUNNED FOR 8 HITS.',
    },
    {
      id: 'deadEnd', type: 'environment', name: 'DEAD END',
      trigger: { on: 'resolved', move: 'bullRush', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 150, anim: 'crash', comboLimit: 12, star: [0, 60] }, say: 'DEAD END!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE TIRE STACK IS PILED UP IN THE RIGHT-HAND CORNER.' },
      scout: 'SLIP THE BULL RUSH TO THE RIGHT: HE CRASHES INTO THE TIRES AND STAYS HUNG UP FOR 12 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'holdsTheLine', type: 'earlyDodge', name: 'HOLDS THE LINE', response: 'hold', moves: ['jackknife', 'gearGrinder'], say: 'HE HELD THE PUNCH!',
      scout: 'SLIP A JACKKNIFE OR GEAR GRINDER TOO EARLY AND HE HOLDS IT UNTIL YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    { id: 'convoy', name: 'CONVOY', when: { left: 60 }, say: 'HERE COMES THE CONVOY!', steps: [{ move: 'bullRush' }, { idle: 34 }, { move: 'bullRush' }] },
  ],
  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A LONG-HAUL TRUCKER WHO FIGHTS LIKE HE DRIVES: STRAIGHT AHEAD, HORN BLASTING, NO BRAKES.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'CRASH HIM INTO THE ROPES TWICE.', check: 'openCount', id: 'crash', n: 2 } },
  music: 'rustyWalkup', // his walk-up jingle (data/music/walkups.js)
};
