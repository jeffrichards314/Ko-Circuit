// #38 Nova Reyes — Grand Prix. The fastest hands and feet in the game. She
// darts to one side of the ring before she strikes, leaving a trail of
// afterimages, and hits you from that side: see her streak LEFT, slip RIGHT
// (away from her); streak right, slip left.
// LIGHTSPEED is her rush: she zigzags left, right, left, right, one punch from
// each side, then a straight Photon Finish up the middle. The sides always
// alternate, so once you've read the first streak you know the rest: slip,
// slip, slip, slip, slip. Slip the Photon Finish and she's spent (a star).
// SUPERNOVA: she crouches like a sprinter in the blocks, then launches herself
// straight at your head. It puts you down: DUCK under it. Counter it on the
// glint and she crashes instead (perfect hit).

const streak = (n, side, windup) => ({
  name: `LIGHTSPEED ${n}`,
  dash: side, noFake: true,
  windupFrames: windup, activeFrames: 5, recoveryFrames: 3,
  damage: 13,
  avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL'],
  counterWindow: null, starWindow: null,
  sfx: { tell: n === 1 ? 'zip' : undefined, swing: 'whiff' },
  animation: side < 0
    ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] }
    : { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
});
const dart = (name, side) => ({
  name, dash: side,
  windupFrames: 8, activeFrames: 6, recoveryFrames: 22,
  damage: 15,
  avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL', 'duck'],
  counterWindow: [2, 6],
  starWindow: null,
  sfx: { tell: 'zip', swing: 'whiff' },
  animation: side < 0
    ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] }
    : { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
});

export default {
  id: 'nova',
  name: 'NOVA REYES',
  short: 'NOVA',
  nickname: 'THE AFTERIMAGE',
  circuit: 'grandprix',
  rank: 4,
  isChampion: false,
  card: {
    age: 23,
    weight: 128,
    record: '29-0 22KO',
    hometown: 'THE VELODROME',
    quote: 'BLINK AND YOU\'LL MISS ME. DON\'T BLINK AND YOU\'LL STILL MISS ME.',
  },
  lines: {
    win: 'PERSONAL BEST. AGAIN.',
    lose: 'NOT... FAST... ENOUGH...',
  },

  build: 'lean',
  palette: 'nova',
  spriteLayers: 'nova',

  stats: {
    health: 240,
    damageMult: 1.6,
    stunResistance: 4,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 42,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 10 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 12 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['stretch1', 'stretch2'], rate: 12 },
    victory: ['victory'],
  },

  moves: {
    flashJab: {
      name: 'FLASH JAB',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 18,
      damage: 13,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    flashBody: {
      name: 'FLASH BODY',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 20,
      damage: 14,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    dartL: dart('LEFT STREAK', -1),
    dartR: dart('RIGHT STREAK', 1),
    // LIGHTSPEED: L R L R, then the Photon Finish
    streak1: streak(1, -1, 12),
    streak2: streak(2, 1, 8),
    streak3: streak(3, -1, 8),
    streak4: streak(4, 1, 8),
    photon: {
      name: 'PHOTON FINISH',
      noFake: true,
      windupFrames: 9, activeFrames: 7, recoveryFrames: 40,
      damage: 17,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      punishStar: ['dodged'],
      sfx: { tell: 'zip', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'winded1', 'idle1'] },
    },
    // one-hit knockdown, straight at your head: duck it
    supernova: {
      name: 'SUPERNOVA',
      knockdown: true,
      windupFrames: 16, activeFrames: 8, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['duck'],
      counterWindow: [3, 12],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      punishStar: ['ducked'],
      sfx: { tell: 'charge', swing: 'swingHeavy' },
      animation: { windup: ['blocks1', 'blocks2'], windupRate: 8, active: ['launch'], recovery: ['launch', 'winded1', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'blur', weight: 3,
      steps: [
        { idle: 22 }, { move: 'flashJab' }, { idle: 18 }, { move: 'dartL' }, { idle: 18 }, { move: 'dartR' },
        { idle: 18 }, { move: 'flashBody' }, { idle: 24 }, { taunt: 30 },
      ],
    },
    {
      id: 'lightspeed', weight: 3, fixed: true,
      steps: [
        { idle: 22 }, { move: 'flashJab' }, { idle: 20 },
        { move: 'streak1' }, { move: 'streak2' }, { move: 'streak3' }, { move: 'streak4' }, { move: 'photon' },
        { idle: 22 }, { taunt: 28 },
      ],
    },
    {
      id: 'nova', weight: 2,
      steps: [
        { idle: 22 }, { move: 'dartR' }, { idle: 18 }, { move: 'supernova' }, { idle: 22 }, { move: 'flashJab' },
        { idle: 18 }, { move: 'dartL' }, { idle: 24 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'supernova', golden: 'recovery', window: [18, 21], taunt: 38, shout: 'SUPERNOVA!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'spentSprinter', type: 'quirk', name: 'SPENT SPRINTER',
      trigger: { on: 'resolved', move: 'photon', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'SHE\'S SPENT!', sfx: 'pant' },
      hint: { kind: 'visual', text: 'THE PHOTON FINISH IS HER LAST BREATH: HER AFTERIMAGES ARE GONE.' },
      scout: 'SLIP THE PHOTON FINISH AT THE END OF LIGHTSPEED: SHE\'S SPENT AND OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'meetTheStreak', type: 'stunTrigger', name: 'MEET THE STREAK',
      trigger: { state: 'windup', move: 'dartL', counter: true, height: 'high', side: 'L' },
      effect: { stun: 100, hits: 8, say: 'HEAD ON!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'HER LEFT STREAK COMES IN ON YOUR LEFT GLOVE.' },
      scout: 'A LEFT-HAND HEAD COUNTER ON HER LEFT STREAK IS HEAD ON: STUNNED FOR 8 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'aroundTheGuard', type: 'turtling', name: 'STREAKS AROUND YOUR GUARD', response: 'move', move: 'dartL', share: 0.4, span: 480, cooldown: 420, say: 'AROUND YOUR GUARD!',
      scout: 'HIDE BEHIND YOUR GUARD AND SHE STREAKS ROUND IT: A LEFT STREAK THAT NO BLOCK STOPS, ONLY A SLIP RIGHT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lightspeedRound', name: 'LIGHTSPEED ROUND', when: { left: 60 }, say: 'LIGHTSPEED!',
      steps: [{ idle: 20 }, { move: 'streak1' }, { move: 'streak2' }, { move: 'streak3' }, { move: 'streak4' }, { move: 'photon' }],
    },
  ],
  special: [{ type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'nova.ghost' }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE FASTEST FEET ON THE CIRCUIT. SHE STREAKS TO ONE SIDE AND LEAVES AFTERIMAGES IN HER WAKE.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DUCK THE SUPERNOVA TWICE.', check: 'moveResult', move: 'supernova', result: 'ducked', n: 2 } },
  music: 'novaWalkup', // his walk-up jingle (data/music/walkups.js)
};
