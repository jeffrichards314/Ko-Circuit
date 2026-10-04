// #20 Jester Jinx — Carnival Circuit. Spin the wheel!
// Before every round a prize wheel spins over the ring and lands on one of
// four slices. The slice decides his whole game plan for that round:
//   PRANKS   feint after feint (punch the fakes), with sneaky real ones mixed in
//   BLITZ    fast three-punch combos: slip, slip, then duck or slip the hook
//   JUGGLE   big overhead drops and low swings, slow and heavy
//   JACKPOT  lucky you: lazy attacks, lots of taunting. Pile on the points.
// The Jack-in-the-Box uppercut shows up in every plan; it's his perfect-hit move.

export default {
  id: 'jinx',
  name: 'JESTER JINX',
  short: 'JINX',
  nickname: 'THE WILD CARD',
  circuit: 'carnival',
  rank: 1,
  isChampion: false,
  card: {
    age: 33,
    weight: 149,
    record: '21-9 12KO',
    hometown: 'THE HALL OF MIRRORS',
    quote: 'LET\'S SPIN FOR IT! HEADS I WIN, TAILS YOU LOSE!',
  },
  lines: {
    win: 'THE WHEEL NEVER LIES! ...WELL. SOMETIMES.',
    lose: 'RIGGED! THE WHEEL WAS RIGGED!',
  },

  build: 'lean',
  palette: 'jinx',
  spriteLayers: 'jinx',

  stats: {
    health: 170,
    damageMult: 1.2,
    stunResistance: 2,
    heartDrainOnBlock: 2,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 50,
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
    taunt: { frames: ['nyah1', 'nyah2'], rate: 6 },
    victory: ['flourish'],
  },

  moves: {
    jab: {
      name: 'JOKER JAB',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 22,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [4, 11],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hook: {
      name: 'WILD CARD',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 26,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    fakeJab: {
      name: 'PRANK (JAB)',
      feint: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 18, // room to recover if you defended the prank
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 13],
      starWindow: [3, 8],
      animation: { windup: ['jabTell'], active: ['jabTell'], recovery: ['idle1'] },
    },
    fakeHook: {
      name: 'PRANK (HOOK)',
      feint: true,
      windupFrames: 16, activeFrames: 0, recoveryFrames: 18, // room to recover if you defended the prank
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 15],
      starWindow: [3, 9],
      animation: { windup: ['hookTell'], active: ['hookTell'], recovery: ['idle1'] },
    },
    // BLITZ: three quick punches, tick-tick-tick
    blitz1: {
      name: 'BLITZ',
      windupFrames: 14, activeFrames: 6, recoveryFrames: 4,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [4, 11],
      starWindow: [4, 7],
      sfx: { tell: 'drumroll', swing: 'whiff' },
      animation: { windup: ['crouchTell'], active: ['jab'], recovery: ['jab'] },
    },
    blitz2: {
      name: 'BLITZ (2)',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 4,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    blitz3: {
      name: 'BLITZ (3)',
      windupFrames: 12, activeFrames: 8, recoveryFrames: 34,
      damage: 11,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // JUGGLE: heavy and slow
    juggleDrop: {
      name: 'JUGGLER\'S DROP',
      windupFrames: 20, activeFrames: 10, recoveryFrames: 40,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17],
      starWindow: [6, 13],
      sfx: { tell: 'ding', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    lowBlow: {
      name: 'SLAPSTICK',
      windupFrames: 16, activeFrames: 8, recoveryFrames: 28,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [4, 13],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    jackInTheBox: {
      name: 'JACK-IN-THE-BOX',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 42,
      damage: 20,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 19],
      starWindow: [6, 14],
      kdWindow: [15, 18],  // perfect hit
      sfx: { tell: 'wheelStart', swing: 'swingHeavy' },
      animation: { windup: ['crouchTell', 'upperTell'], windupRate: 11, active: ['upper'], recovery: ['upper', 'idle1'] },
    },
  },

  // `set` = the wheel slice (prizeWheel modifier). Each set covers every health range.
  patterns: [
    {
      id: 'pranks', set: 'pranks', weight: 1,
      steps: [
        { idle: 40 }, { move: 'fakeJab' }, { idle: 12 }, { move: 'fakeHook' }, { move: 'hook' }, { idle: 30 },
        { move: 'fakeJab' }, { move: 'jab' }, { idle: 30 }, { move: 'jackInTheBox' }, { idle: 30 },
        { move: 'fakeHook' }, { idle: 20 }, { move: 'lowBlow' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'blitz', set: 'blitz', weight: 1,
      steps: [
        { idle: 36 }, { move: 'blitz1' }, { move: 'blitz2' }, { move: 'blitz3' }, { idle: 30 }, { move: 'jab' },
        { idle: 24 }, { move: 'blitz1' }, { move: 'blitz2' }, { move: 'blitz3' }, { idle: 30 },
        { move: 'jackInTheBox' }, { idle: 30 }, { move: 'hook' }, { idle: 40 }, { taunt: 36 },
      ],
    },
    {
      id: 'juggle', set: 'juggle', weight: 1,
      steps: [
        { idle: 44 }, { move: 'juggleDrop' }, { idle: 36 }, { move: 'lowBlow' }, { idle: 36 }, { move: 'hook' },
        { idle: 36 }, { move: 'jackInTheBox' }, { idle: 36 }, { move: 'juggleDrop' }, { idle: 40 }, { taunt: 50 },
      ],
    },
    {
      id: 'jackpot', set: 'jackpot', weight: 1,
      steps: [
        // goofing off: wide open (not a taunt: those only come before his super now)
        { idle: 60 }, { move: 'jab' }, { idle: 60 }, { open: 70, anim: 'taunt', comboLimit: 4 }, { idle: 50 }, { move: 'jackInTheBox' },
        { idle: 60 }, { move: 'lowBlow' }, { idle: 50 }, { open: 70, anim: 'taunt', comboLimit: 4 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'jackInTheBox', golden: 'taunt', window: [12, 15], taunt: 40, shout: 'SURPRISE!', times: [1, 2] },

  getUpTable: [
    { upAt: [4, 7], health: 0.6 },
    { upAt: [6, 9], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.35, health: 0.35 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'rigTheWheel', type: 'quirk', name: 'RIG THE WHEEL',
      trigger: { on: 'getUp' },
      effect: { wheel: 'jackpot', say: 'JACKPOT!' },
      hint: { kind: 'trainer', text: 'KNOCK HIM DOWN AND WATCH THE WHEEL.' },
      scout: 'KNOCK HIM DOWN: WHEN HE GETS UP THE WHEEL LANDS ON JACKPOT (HE GOOFS OFF, WIDE OPEN).',
    },
    {
      id: 'blitzFizzles', type: 'patternBreak', name: 'BLITZ FIZZLES',
      trigger: { state: 'windup', move: 'blitz1', counter: true },
      effect: { cancelMoves: ['blitz2', 'blitz3'], star: true, say: 'THE BLITZ FIZZLES!' },
      hint: { kind: 'trainer', text: 'STOP THE BLITZ AT THE FIRST PUNCH.' },
      scout: 'COUNTER THE FIRST BLITZ PUNCH: THE OTHER TWO NEVER COME, AND YOU EARN A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'houseWins', type: 'starHoard', name: 'THE HOUSE ALWAYS WINS', moves: ['hook', 'juggleDrop', 'lowBlow', 'jab'], hold: 420, on: ['hit', 'blocked'], say: 'THE HOUSE TAKES A STAR!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS PUNCHES START TAKING THEM, BLOCKED OR NOT. SPEND THEM!',
    },
  ],
  scriptedMoments: [
    { id: 'spinAgain', name: 'SPIN AGAIN!', when: { left: 45 }, mod: { spinPending: true }, say: 'SPIN AGAIN!' },
  ],
  special: [{
    type: 'prizeWheel',
    slices: [
      { set: 'pranks', label: 'PRANKS', color: [31, 8, 10] },
      { set: 'blitz', label: 'BLITZ', color: [8, 24, 10] },
      { set: 'juggle', label: 'JUGGLE', color: [10, 14, 31] },
      { set: 'jackpot', label: 'JACKPOT', color: [31, 25, 4] },
    ],
  }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A JESTER WHO LETS A PRIZE WHEEL DECIDE HOW HE FIGHTS EACH ROUND. EVEN HE DOESN\'T KNOW WHAT\'S NEXT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'KO HIM IN ROUND 1, BEFORE THE WHEEL SPINS AGAIN.', check: 'round1' } },
  music: 'jinxWalkup', // his walk-up jingle (data/music/walkups.js)
};
