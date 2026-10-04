// #40 Quickdraw Quinn — Grand Prix. A gunslinger with gloves instead of
// six-shooters. When he tips his hat and says "IT'S HIGH NOON", the whole fight
// freezes: the clock stops, nobody moves, a tumbleweed blows through. Wait for
// the bell and the word DRAW!, then press a punch. First glove wins:
//   you first: your glove lands hard (a counter and a star) and he's stunned.
//   too slow:  he fires first (a heavy hit). He's quicker every round.
//   too early (before DRAW!): he fires first too. Keep your hands still.
// Hit him while he's tipping his hat and the standoff never happens (on the
// glint, it's HIM who goes down: perfect hit).
// Fan the Hammer is three straights, right, left, right: slip left, right, left.
// The Six-Shooter is his one-hit knockdown: he cocks his right fist back at the hip.

export default {
  id: 'quinn',
  name: 'QUICKDRAW QUINN',
  short: 'QUINN',
  nickname: 'FASTEST GLOVE',
  circuit: 'grandprix',
  rank: 2,
  isChampion: false,
  card: {
    age: 36,
    weight: 171,
    record: '48-2 44KO',
    hometown: 'DRY GULCH',
    quote: 'THIS RING AIN\'T BIG ENOUGH FOR THE TWO OF US.',
  },
  lines: {
    win: 'TOO SLOW, PARTNER. WAY TOO SLOW.',
    lose: 'WELL... SHUCKS...',
  },

  build: 'medium',
  palette: 'quinn',
  spriteLayers: 'quinn',

  stats: {
    health: 250,
    damageMult: 1.6,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 46,
    hitstun: 12,
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
    taunt: { frames: ['spin1', 'spin2'], rate: 8 },
    victory: ['blowSmoke'],
  },

  moves: {
    pistolJab: {
      name: 'PISTOL JAB',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: null,
      sfx: { tell: 'spurs', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hipShot: {
      name: 'HIP SHOT',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'spurs', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    lasso: {
      name: 'LASSO',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 7],
      starWindow: [2, 3],
      sfx: { tell: 'whip', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    // FAN THE HAMMER: right, left, right
    fan1: {
      name: 'FAN THE HAMMER',
      windupFrames: 10, activeFrames: 5, recoveryFrames: 3,
      damage: 13,
      avoidBy: ['dodgeL'],
      counterWindow: [2, 6],
      starWindow: null,
      cancels: 2,
      noFake: true,
      sfx: { tell: 'cock', swing: 'gunshot' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    fan2: {
      name: 'FAN THE HAMMER (2)',
      windupFrames: 7, activeFrames: 5, recoveryFrames: 3,
      damage: 13,
      avoidBy: ['dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'gunshot' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    fan3: {
      name: 'FAN THE HAMMER (3)',
      windupFrames: 7, activeFrames: 5, recoveryFrames: 38,
      damage: 14,
      avoidBy: ['dodgeL'],
      counterWindow: null, starWindow: null,
      punishStar: ['dodged'],
      noFake: true,
      sfx: { swing: 'gunshot' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR', 'idle1'] },
    },
    // one-hit knockdown: cocked back at the hip, then up through the middle
    sixShooter: {
      name: 'SIX-SHOOTER',
      knockdown: true,
      windupFrames: 16, activeFrames: 8, recoveryFrames: 44,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 12],
      starWindow: [3, 5],
      noFake: true,
      sfx: { tell: 'cock', swing: 'gunshot' },
      animation: { windup: ['holster', 'drawReach'], windupRate: 10, active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
    // HIGH NOON: the standoff starts when he's done tipping his hat (perfect-hit moment)
    highNoon: {
      name: 'HIGH NOON',
      feint: true, call: true, noFake: true,
      windupFrames: 26, activeFrames: 0, recoveryFrames: 2,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 22],
      starWindow: [3, 7],
      kdWindow: [14, 17],
      sfx: { tell: 'highNoon' },
      animation: { windup: ['tipHat1', 'tipHat2'], windupRate: 8, active: ['tipHat2'], recovery: ['holster'] },
    },
    // he fires first (only if you lose the draw)
    draw: {
      name: 'BANG!',
      noFake: true,
      windupFrames: 2, activeFrames: 6, recoveryFrames: 30,
      damage: 24,
      avoidBy: [],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'gunshot' },
      animation: { windup: ['drawReach'], active: ['jabR'], recovery: ['jabR', 'blowSmoke', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'saloon', weight: 3,
      steps: [
        { idle: 24 }, { move: 'pistolJab' }, { idle: 20 }, { move: 'hipShot' }, { idle: 20 }, { move: 'lasso' },
        { idle: 22 }, { move: 'pistolJab' }, { idle: 26 }, { taunt: 32 },
      ],
    },
    {
      id: 'highNoon', weight: 3, fixed: true,
      steps: [
        { idle: 24 }, { move: 'pistolJab' }, { idle: 22 }, { move: 'highNoon' }, { idle: 30 }, { move: 'lasso' },
        { idle: 22 }, { taunt: 32 },
      ],
    },
    {
      id: 'fan', weight: 2, fixed: true,
      steps: [
        { idle: 22 }, { move: 'fan1' }, { move: 'fan2' }, { move: 'fan3' }, { idle: 22 }, { move: 'sixShooter' },
        { idle: 24 }, { move: 'hipShot' }, { idle: 24 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'highNoon', golden: 'windup', taunt: 38, shout: 'HIGH NOON!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'head', move: 'sixShooter', inline: true, golden: 'windup', window: [9, 12] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'jammedHammer', type: 'patternBreak', name: 'JAMMED HAMMER',
      trigger: { state: 'windup', move: 'fan1', counter: true },
      effect: { cancelMoves: ['fan2', 'fan3'], stun: 80, hits: 6, say: 'HIS GUN JAMMED!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'CLICK... CLICK... CLICK: THE FAN OF THE HAMMER.' },
      scout: 'COUNTER THE FIRST PUNCH OF FAN THE HAMMER: NO SECOND OR THIRD, AND STUNNED FOR 6 HITS.',
    },
    {
      id: 'hipShotJam', type: 'quirk', name: 'HIP SHOT MISFIRE',
      trigger: { on: 'resolved', move: 'hipShot', result: 'blocked' },
      effect: { open: { frames: 66, anim: 'stunned', comboLimit: 4 }, say: 'MISFIRE!', sfx: 'clang' },
      hint: { kind: 'trainer', text: 'THE HIP SHOT GOES LOW. BLOCK IT.' },
      scout: 'BLOCK THE HIP SHOT: IT MISFIRES AND HE\'S OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'waitsForTheDraw', type: 'earlyDodge', name: 'WAITS FOR THE DRAW', response: 'hold', moves: ['sixShooter'], lead: 10, say: 'HE HOLDS HIS FIRE!',
      scout: 'SLIP THE SIX-SHOOTER AS SOON AS HE COCKS IT AND HE HOLDS HIS FIRE UNTIL YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'sundown', name: 'SUNDOWN', when: { left: 60 }, say: 'SUNDOWN!',
      steps: [{ idle: 20 }, { move: 'pistolJab' }, { idle: 14 }, { move: 'fan1' }, { move: 'fan2' }, { move: 'fan3' }, { idle: 20 }, { move: 'sixShooter' }],
    },
  ],
  special: [{
    type: 'quickdraw', trigger: 'highNoon', shot: 'draw',
    wait: [45, 120], react: [20, 17, 15], damage: 36, stun: 50,
    holdPose: 'holster', twitchPose: 'holster2', reachPose: 'drawReach',
  }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A GUNSLINGER WHO FIGHTS AT HIGH NOON. WHEN THE CLOCK STOPS, WHOEVER PUNCHES FIRST WINS.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'WIN EVERY DRAW.', check: 'neverHitBy', move: 'draw' } },
  music: 'quinnWalkup', // his walk-up jingle (data/music/walkups.js)
};
