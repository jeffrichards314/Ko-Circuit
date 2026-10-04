// #46 The Warden — Underground Circuit champion. He runs the cage the way he
// ran the cell block: by the book, by the whistle, by the numbers. Round 1 is
// LOCKDOWN, the guard in his pressed uniform:
//   nightstick jab, a cell-block hook (slip left or duck), a pat-down to the
//   body (block, or slip right).
//   HEADCOUNT: he blows his whistle, then counts you off: ONE (slip either
//   way), TWO (slip right), THREE (slip left). Slip THREE for a star. Punch him
//   while he's whistling and there's no count at all (early: a star).
//   LOCKDOWN: he shuts himself up behind his gloves... and opens up with
//   SOLITARY, cuffed fists hammered down: a one-hit knockdown. Slip it, or
//   counter it on the glint and the Warden goes down (perfect hit).
// From round 2 on it's a RIOT. The uniform comes off, and so does the story:
// under it he's covered in prison ink. A whole new fighter: faster everything,
// the four-punch RIOT (slip, right, left, slip the uppercut for a star), and the
// BREAKOUT, a charge with the siren wailing. Slip it and he hits the ropes: hit
// him. SOLITARY is still in there.

const chain = (name, tell, act, avoid, windup, last, sfx) => ({
  name, windupFrames: windup, activeFrames: 5, recoveryFrames: last ? 32 : 3,
  damage: last ? 18 : 15,
  avoidBy: avoid,
  counterWindow: null, starWindow: null, noFake: true,
  punishStar: last ? ['dodged'] : undefined,
  sfx: { tell: sfx, swing: last ? 'swingHeavy' : 'whiff' },
  animation: { windup: [tell], active: [act], recovery: last ? [act, 'idle1'] : [act] },
});

export default {
  id: 'warden',
  name: 'THE WARDEN',
  short: 'WARDEN',
  nickname: 'LIFE SENTENCE',
  circuit: 'underground',
  rank: 0,
  isChampion: true,
  card: {
    age: 52,
    weight: 251,
    record: '71-3 62KO',
    hometown: 'CELL BLOCK D',
    quote: 'NOBODY LEAVES MY CAGE ON THEIR FEET. NOBODY.',
  },
  lines: {
    win: 'LIGHTS OUT. TOMORROW, YOU FIGHT AGAIN.',
    lose: 'THE KEYS... ARE YOURS... NOW...',
  },

  build: 'heavy',
  palette: 'warden',
  spriteLayers: 'warden',

  stats: {
    health: 300,
    damageMult: 1.65,
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
    idle: { frames: ['idle1', 'idle2'], rate: 22 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['keys1', 'keys2'], rate: 8 },
    victory: ['victory'],
    crashed: { frames: ['stunned1', 'stunned2'], rate: 8 },
  },

  moves: {
    // --- LOCKDOWN (round 1) ---
    stick: {
      name: 'NIGHTSTICK JAB',
      windupFrames: 9, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    cellHook: {
      name: 'CELL BLOCK HOOK',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    patDown: {
      name: 'PAT-DOWN',
      windupFrames: 10, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'keys', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // the whistle: the count follows at once (counter it and there's no count)
    headcount: {
      name: 'HEADCOUNT!',
      feint: true, call: true, noFake: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 6,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 21],
      starWindow: [3, 8],
      cancels: 3,
      sfx: { tell: 'whistlePolice' },
      animation: { windup: ['whistle1', 'whistle2'], windupRate: 6, active: ['whistle2'], recovery: ['whistle2', 'idle1'] },
    },
    count1: chain('ONE!', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 9, false, 'tick'),
    count2: chain('TWO!', 'hookLTell', 'hookL', ['dodgeR'], 9, false, 'tick'),
    count3: chain('THREE!', 'hookTell', 'hook', ['dodgeL'], 9, true, 'ding'),
    // SOLITARY: cuffed fists, hammered down. One-hit knockdown (and ZERO's echo of him)
    solitary: {
      name: 'SOLITARY',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 44,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 13],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      sfx: { tell: 'cellDoor', swing: 'swingHeavy' },
      animation: { windup: ['cuffTell1', 'cuffTell2'], windupRate: 6, active: ['cuffSlam'], recovery: ['cuffSlam', 'overheadRecover', 'idle1'] },
    },
    // --- RIOT (rounds 2 and 3) ---
    riotJab: {
      name: 'RIOT JAB',
      windupFrames: 7, activeFrames: 5, recoveryFrames: 18,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    riotHook: {
      name: 'SHIV HOOK',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 17,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    riotHookL: {
      name: 'SHIV HOOK',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 17,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'snort', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    riotBody: {
      name: 'YARD BODY SHOT',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 16,
      height: 'low',
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // the charge: slip it and he crashes into the ropes (hit him)
    breakout: {
      name: 'BREAKOUT',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 30,
      damage: 22,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 11],
      starWindow: null,
      noFake: true,
      sfx: { tell: 'siren', swing: 'swingHeavy' },
      animation: { windup: ['chargeTell'], active: ['charge'], recovery: ['charge', 'idle1'] },
      openAfter: { when: ['dodged'], open: 54, anim: 'crashed', star: [2, 16], interrupt: true, stunOnInterrupt: 30, id: 'ropes', sfx: 'thud', shake: 6 },
    },
    riot1: chain('RIOT', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 8, false, 'grunt'),
    riot2: chain('RIOT (2)', 'hookLTell', 'hookL', ['dodgeR'], 8, false, 'grunt'),
    riot3: chain('RIOT (3)', 'hookTell', 'hook', ['dodgeL'], 8, false, 'grunt'),
    riot4: chain('RIOT (4)', 'upperTell', 'upper', ['dodgeL', 'dodgeR'], 8, true, 'snort'),
  },

  patterns: [
    // --- LOCKDOWN ---
    {
      id: 'rounds', set: 'guard', weight: 3,
      steps: [
        { idle: 28 }, { move: 'stick' }, { idle: 24 }, { move: 'cellHook' }, { idle: 24 }, { move: 'patDown' },
        { idle: 24 }, { move: 'stick' }, { idle: 28 }, { taunt: 34 },
      ],
    },
    {
      id: 'headcount', set: 'guard', weight: 3, fixed: true,
      steps: [
        { idle: 26 }, { move: 'headcount' }, { move: 'count1' }, { move: 'count2' }, { move: 'count3' },
        { idle: 24 }, { move: 'stick' }, { idle: 28 },
      ],
    },
    {
      id: 'lockdown', set: 'guard', weight: 2,
      steps: [
        { idle: 22 }, { block: 50 }, { idle: 12 }, { move: 'solitary' }, { idle: 26 }, { move: 'patDown' },
        { idle: 24 }, { move: 'cellHook' }, { idle: 28 },
      ],
    },
    // --- RIOT ---
    {
      id: 'riot', set: 'riot', weight: 3, fixed: true,
      steps: [
        { idle: 20 }, { move: 'riotJab' }, { idle: 16 },
        { move: 'riot1' }, { move: 'riot2' }, { move: 'riot3' }, { move: 'riot4' },
        { idle: 24 }, { taunt: 26 },
      ],
    },
    {
      id: 'breakout', set: 'riot', weight: 2,
      steps: [
        { idle: 20 }, { move: 'riotHookL' }, { idle: 18 }, { move: 'riotBody' }, { idle: 20 }, { move: 'breakout' },
        { idle: 22 },
      ],
    },
    {
      id: 'mayhem', set: 'riot', weight: 3,
      steps: [
        { idle: 20 }, { move: 'riotJab' }, { idle: 18 }, { move: 'riotHook' }, { idle: 18 }, { move: 'solitary' },
        { idle: 22 }, { move: 'riotBody' }, { idle: 18 }, { move: 'riotHookL' }, { idle: 24 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { move: 'solitary', golden: 'recovery', window: [32, 37], hit: 'star', from: 'solitaryBreak', taunt: 36, shout: 'SOLITARY!', times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.25, health: 0.4 },
    { upAt: null },
  ],


  special: [{
    type: 'phases',
    phases: [
      { from: 1, set: 'guard', name: 'LOCKDOWN', color: [14, 20, 31] },
      { from: 2, set: 'riot', name: 'RIOT', color: [31, 8, 6], palette: 'warden.riot', shout: 'RIOT!', note: 'HE\'S TEARING THE SHIRT OFF!' },
    ],
  }],
  // Title Defense remix: the lockdown after the breakout.
  titleDefense: {
    nickname: 'MAXIMUM SECURITY',
    quote: 'YOU GOT OUT ONCE. NOBODY GETS OUT TWICE.',
    lines: { win: 'BACK IN YOUR CELL, INMATE.', lose: 'ALL UNITS... ALL UNITS...' },
    tell: 0.85,
    costume: { B: { shirtHi: [26, 18, 8], shirt: [21, 11, 3], shirtSh: [13, 6, 2], shirtDk: [7, 3, 1], seam: [10, 5, 2], inkShirt: [21, 11, 3] } },
    moves: {
      // new (lockdown): the nightstick, a left uppercut (slip it, punish for a star)
      nightstick: {
        name: 'NIGHTSTICK',
        windupFrames: 10, activeFrames: 7, recoveryFrames: 34,
        damage: 19,
        avoidBy: ['dodgeL', 'dodgeR'],
        counterWindow: [2, 8],
        starWindow: [2, 4],
        punishStar: ['dodged'],
        sfx: { tell: 'cock', swing: 'swingHeavy' },
        animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
      },
      // new (riot): tear gas, a sweep (duck it)
      tearGas: {
        name: 'TEAR GAS',
        windupFrames: 9, activeFrames: 9, recoveryFrames: 28,
        damage: 17,
        avoidBy: ['duck'],
        counterWindow: [2, 7],
        starWindow: null,
        sfx: { tell: 'whistleDown', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'maxSecurity', weight: 3, set: 'guard',
        steps: [
          { idle: 26 }, { move: 'stick' }, { idle: 22 }, { move: 'nightstick' }, { idle: 22 }, { move: 'patDown' },
          { idle: 22 }, { move: 'cellHook' }, { idle: 22 }, { move: 'solitary' }, { idle: 26 }, { taunt: 34 },
        ],
      },
      {
        id: 'tearGas', weight: 3, set: 'riot',
        steps: [
          { idle: 20 }, { move: 'tearGas' }, { idle: 18 }, { move: 'riotHook' }, { idle: 18 }, { move: 'riotBody' },
          { idle: 18 }, { move: 'breakout' }, { idle: 22 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'keysJingle', type: 'stunTrigger', name: 'OFF HIS BELT',
      trigger: { state: 'windup', move: 'patDown', counter: true, height: 'low', frames: [4, 8] },
      effect: { stun: 104, hits: 8, say: 'CAUGHT ON HIS OWN KEYS!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'HIS KEYS JINGLE AS HE BENDS FOR THE PAT-DOWN.' },
      scout: 'A BODY COUNTER ON THE PAT-DOWN, WHILE THE KEYS JINGLE, STUNS HIM FOR 8 HITS.',
    },
    {
      id: 'riotBroken', type: 'patternBreak', name: 'RIOT BROKEN UP',
      trigger: { state: 'windup', move: 'riotJab', counter: true, frames: [3, 5] },
      effect: { cancelMoves: ['riot1', 'riot2', 'riot3', 'riot4'], star: true, say: 'RIOT BROKEN UP!' },
      hint: { kind: 'trainer', text: 'EVERY RIOT STARTS WITH A JAB.' },
      scout: 'COUNTER THE RIOT JAB BEFORE THE RUSH: NO FOUR-PUNCH RIOT, AND A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'shakedown', type: 'turtling', name: 'SHAKEDOWN', response: 'unblockable', moves: ['patDown', 'riotBody'], cue: 'NO BLOCK!', say: 'SHAKEDOWN!',
      scout: 'HIDE BEHIND YOUR GUARD AND THE PAT-DOWN GOES RIGHT THROUGH IT: IT CAN\'T BE BLOCKED, ONLY SLIPPED.',
    },
    {
      id: 'onRecord', type: 'zoneBias', name: 'IT\'S ON THE RECORD', mode: 'round', share: 0.7, min: 6, say: 'HE\'S READ YOUR FILE!',
      scout: 'WORK ONE ZONE ALL ROUND AND HE COMES OUT NEXT ROUND GUARDING IT. MIX HEAD AND BODY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'lightsOut', name: 'LIGHTS OUT', when: { left: 90 }, say: 'LIGHTS OUT!',
      steps: [{ idle: 20 }, { move: 'stick' }, { idle: 14 }, { move: 'cellHook' }, { idle: 14 }, { move: 'patDown' }],
    },
    {
      id: 'solitaryConfinement', name: 'SOLITARY CONFINEMENT', when: { health: 0.3 }, say: 'TO SOLITARY!',
      steps: [{ idle: 20 }, { move: 'riotHook' }, { idle: 14 }, { move: 'riotBody' }, { idle: 16 }, { move: 'solitary' }],
    },
  ],
  gallery: 'THE UNDERGROUND CHAMPION RUNS THE CAGE LIKE A PRISON. IN ROUND TWO THE RIOT STARTS.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'PUT HIM DOWN IN ROUND 1, BEFORE THE RIOT.', check: 'kdInRound', round: 1 } },
  music: 'wardenEntrance',
};
