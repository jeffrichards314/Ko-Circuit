// #54 Aurora Vess — Pantheon I's champion, the Gate of Dawn. The dawn herself, and every
// attack of hers leaves a TRAIL of light where she threw it. About a second later the
// trail brightens (a chime) and throws the same punch again, a second, real attack
// with the same defense as the first. Slip the first and the second is still coming:
// don't walk into it. A counter that stuns her snuffs every trail.
// Her super is FIRST LIGHT: arms open to the sun, then a blast of light at your head, a
// knockdown: slip it, and punch her back on the glint as she recovers.
// Pantheon I difficulty: 6-frame tells, shuffled and adaptive, hearts 12; a champion,
// with three moods: dawn (round 1), the trails coming fast (2), full daylight (3).

const W = 7;
const glow = { glow: true };

export default {
  id: 'aurora',
  name: 'AURORA VESS',
  short: 'AURORA',
  nickname: 'THE FIRST LIGHT',
  circuit: 'p1',
  rank: 0,
  isChampion: true,
  card: {
    age: 27,
    weight: 132,
    record: '36-0 30KO',
    hometown: 'THE GATE OF DAWN',
    quote: 'EVERY DAY I RISE. EVERY DAY SOMEONE TRIES TO STOP ME.',
  },
  lines: {
    win: 'THE SUN RISES ON ME.',
    lose: 'THE LIGHT... IT SETS...',
  },

  build: 'lean',
  palette: 'aurora',
  spriteLayers: 'aurora',

  stats: {
    health: 340,
    damageMult: 1.85,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 12 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['greet'],
    victory: ['victory'],
  },

  moves: {
    glowJab: {
      name: 'DAWN JAB', ...glow,
      windupFrames: W, activeFrames: 6, recoveryFrames: 20,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, W - 1],
      starWindow: null,
      sfx: { tell: 'glowUp', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    glowHook: {
      name: 'DAWN HOOK', ...glow,
      windupFrames: W + 2, activeFrames: 7, recoveryFrames: 26,
      damage: 14,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [3, W],
      starWindow: [3, 5],
      sfx: { tell: 'glowUp', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    glowUpper: {
      name: 'RISING SUN', ...glow,
      windupFrames: W + 3, activeFrames: 7, recoveryFrames: 32,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, W + 1],
      starWindow: [3, 6],
      punishStar: ['dodged'],
      sfx: { tell: 'glowUp', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // no trail: a plain body blow between the bright ones
    dawnBody: {
      name: 'DAWN BLOW',
      windupFrames: W + 1, activeFrames: 6, recoveryFrames: 24,
      damage: 12,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [3, W - 1],
      starWindow: null,
      punishStar: ['dodged'],
      sfx: { tell: 'tick', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the super: arms open to the sun, then the light. A knockdown.
    firstLight: {
      name: 'FIRST LIGHT',
      knockdown: true, noFake: true,
      windupFrames: 20, activeFrames: 10, recoveryFrames: 48, damage: 32,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [4, 17],
      starWindow: [4, 7],
      punishStar: ['dodged'],
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['greet'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  // Every idle after a bright move is long: its echo lands a second later, in the gap.
  patterns: [
    {
      id: 'dawn', weight: 3, when: { rounds: [1] },
      steps: [
        { idle: 32 }, { move: 'glowJab' }, { idle: 78 }, { move: 'dawnBody' }, { idle: 30 }, { move: 'glowHook' },
        { idle: 82 }, { move: 'glowJab' }, { idle: 74 }, { move: 'dawnBody' }, { idle: 30 }, { move: 'glowUpper' }, { idle: 86 },
      ],
    },
    {
      id: 'morning', weight: 3,
      steps: [
        { idle: 28 }, { move: 'glowHook' }, { idle: 76 }, { move: 'glowJab' }, { idle: 20 }, { move: 'glowJab' }, { idle: 80 },
        { move: 'dawnBody' }, { idle: 28 }, { move: 'glowUpper' }, { idle: 84 }, { move: 'glowHook' }, { idle: 78 },
      ],
    },
    {
      id: 'zenith', weight: 2, when: { rounds: [2, 3] },
      steps: [
        { idle: 26 }, { move: 'glowJab' }, { idle: 22 }, { move: 'glowHook' }, { idle: 82 }, { move: 'dawnBody' }, { idle: 24 },
        { move: 'glowUpper' }, { idle: 80 }, { move: 'glowJab' }, { idle: 20 }, { move: 'dawnBody' }, { idle: 76 },
      ],
    },
    // under a third: full daylight, the trails come fast
    {
      id: 'noon', weight: 1, script: 'noon',
      steps: [
        { idle: 24 }, { move: 'glowJab' }, { idle: 20 }, { move: 'glowHook' }, { idle: 76 }, { move: 'glowUpper' }, { idle: 24 },
        { move: 'dawnBody' }, { idle: 78 }, { move: 'glowJab' }, { idle: 74 },
      ],
    },
  ],

  // her super: thrown once or twice a round after she backs off and taunts (super.js)
  super: { hit: 'body', move: 'firstLight', golden: 'recovery', window: [18, 22], taunt: 46, shout: 'FIRST LIGHT!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.45 },
    { upAt: null },
  ],


  // --- the knowledge layer (spec §17): a champion has 3+ exploits, 2+ anti-strategies, 2+ moments ---
  exploits: [
    {
      id: 'chaseTheLight', type: 'quirk', name: 'CHASING HER OWN LIGHT',
      trigger: { since: { event: 'echoDodged', frames: [0, 40] }, state: ['idle', 'recovery', 'block'], clean: 24 },
      effect: { open: { frames: 74, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'DAZZLED BY HER OWN LIGHT!', sfx: 'glass' },
      hint: { kind: 'audio', text: 'THE ECHO\'S CHIME RINGS OUT OF TUNE WHEN IT MISSES.' },
      scout: 'SLIP OR DUCK THE ECHO (THE TRAIL\'S SECOND PUNCH), THEN PUNCH WITHIN 40 FRAMES: SHE\'S DAZZLED AND OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'sunsetBlow', type: 'stunTrigger', name: 'SUNSET BLOW',
      trigger: { state: 'windup', move: 'dawnBody', counter: true, height: 'low', frames: [3, 7] },
      effect: { stun: 96, hits: 7, say: 'THE SUN SETS!', sfx: 'thud' },
      hint: { kind: 'trainer', text: 'THE PLAIN BLOW LEAVES NO TRAIL: IT\'S THE ONE SHE CAN\'T AFFORD TO MISS.' },
      scout: 'A LOW COUNTER ON HER PLAIN BODY BLOW (THE ONE WITHOUT A TRAIL): STUNNED FOR 7 HITS.',
    },
    {
      id: 'slantOfLight', type: 'patternBreak', name: 'SLANT OF LIGHT',
      trigger: { on: 'resolved', move: 'glowHook', result: 'dodged', dir: 'L' },
      effect: { flag: 'noEchoNext', say: 'THE LIGHT GUTTERS!', sfx: 'tick' },
      hint: { kind: 'visual', text: 'THE HOOK BENDS HER LIGHT AS IT MISSES.', hidden: true },
      scout: 'SLIP LEFT OF THE DAWN HOOK: THE LIGHT GUTTERS AND HER NEXT BRIGHT PUNCH LEAVES NO TRAIL.',
    },
  ],
  antiStrategies: [
    {
      id: 'chasesYou', type: 'rushing', name: 'HERE COMES THE SUN', span: 150, count: 2, counter: ['glowJab'], delay: 12, say: 'HERE COMES THE SUN!',
      scout: 'PUNCH AT HER WHEN SHE ISN\'T OPEN, AGAIN AND AGAIN, AND SHE ANSWERS AT ONCE WITH A DAWN JAB (AND ITS TRAIL).',
    },
    {
      id: 'bendsTheLight', type: 'getUpMash', name: 'RISES ON THE FALLEN', response: 'harder', punches: 3, mult: 1.3, say: 'THE SUN RISES!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HER NEXT 3 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'goldenHour', name: 'GOLDEN HOUR', when: { left: 90 }, say: 'GOLDEN HOUR!',
      steps: [{ idle: 20 }, { move: 'glowJab' }, { idle: 78 }, { move: 'glowUpper' }, { idle: 80 }],
    },
    {
      id: 'fullDaylight', name: 'FULL DAYLIGHT', when: { health: 0.35 }, say: 'FULL DAYLIGHT!', patterns: 'noon',
      steps: [{ idle: 18 }],
    },
  ],
  special: [{ type: 'afterglow', delay: 58, tell: 12, dx: 30, damage: 0.85, max: 2, ghost: 'aurora.ghost', hot: 'aurora.hot' }],
  titleDefense: null,
  gallery: 'THE CHAMPION OF THE GATE OF DAWN. HER LIGHT LEAVES TRAILS, AND THE TRAILS HIT BACK A SECOND LATER.', // bio for the fighter gallery (§16)
  medals: { signature: { text: 'SLIP OR DUCK 4 ECHOES.', check: 'cueCount', cue: '!echoDodged', n: 4 } },
  music: 'auroraEntrance', // her entrance theme (data/music/pantheon.js)
};
