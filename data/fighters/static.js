// #43 Static — Underground Circuit. A pirate-TV kid who grew up inside the
// snow on channel zero. His bleached hair stands straight up off his head, and
// wherever he goes the picture breaks up: every time he winds up, the screen
// around him tears and fills with snow, so you only ever see PART of the tell.
// Your ears are clean, though. Each punch has its own sound:
//   a high triple chirp   JAB (anything works)
//   a low buzz            HOOK from your left: slip left or duck
//   a rising whine        HOOK from your right: slip right or duck
//   a falling whistle     BODY: block, or slip right
//   a zap                 SURGE (the uppercut): slip either way, then punish (a star)
//   the modem screech     SIGNAL LOSS, his one-hit knockdown. Slip it, or
//                         counter it on the glint and HE goes down (perfect hit).
// After his three-punch BURST he locks up (NO SIGNAL): hit him.
// Between tells the picture sometimes hiccups with no sound at all. No sound,
// no punch.

const burst = (name, tell, act, avoid, windup, last, sfx) => ({
  name, windupFrames: windup, activeFrames: 5, recoveryFrames: last ? 32 : 3,
  damage: last ? 17 : 14,
  avoidBy: avoid,
  counterWindow: null, starWindow: null, noFake: true,
  punishStar: last ? ['dodged'] : undefined,
  sfx: { tell: sfx, swing: last ? 'swingHeavy' : 'whiff' },
  animation: { windup: [tell], active: [act], recovery: last ? [act, 'idle1'] : [act] },
});

export default {
  id: 'static',
  name: 'STATIC',
  short: 'STATIC',
  nickname: 'CHANNEL ZERO',
  circuit: 'underground',
  rank: 3,
  isChampion: false,
  card: {
    age: 19,
    weight: 142,
    record: '31-2 25KO',
    hometown: 'CHANNEL ZERO',
    quote: 'YOU\'RE NOT SEEING THINGS. YOU\'RE NOT SEEING ANYTHING.',
  },
  lines: {
    win: 'PLEASE STAND BY. FOREVER.',
    lose: 'SIGNAL... LOST...',
  },

  build: 'lean',
  palette: 'static',
  spriteLayers: 'static',

  stats: {
    health: 250,
    damageMult: 1.55,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 9 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 10 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['rub1', 'rub2'], rate: 5 },
    victory: ['victory'],
    noSignal: { frames: ['frozen1', 'frozen2'], rate: 4 },
  },

  moves: {
    feedJab: {
      name: 'FEEDBACK JAB',
      windupFrames: 7, activeFrames: 5, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'staticHi', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    dropHook: {
      name: 'DROPOUT',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'staticLo', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    crossHook: {
      name: 'CROSSTALK',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'staticUp', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    lowBand: {
      name: 'LOW BAND',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'staticDn', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    surge: {
      name: 'SURGE',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 34,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 7],
      starWindow: [2, 4],
      punishStar: ['dodged'],
      sfx: { tell: 'zap', swing: 'swingHeavy' },
      animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // one-hit knockdown: both fists up, the screech of a dead line
    signalLoss: {
      name: 'SIGNAL LOSS',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 13],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      sfx: { tell: 'modem', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 5, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
    // BURST: three at once, each with its own sound
    burstA: burst('BURST', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 8, false, 'staticHi'),
    burstB: burst('BURST (2)', 'hookLTell', 'hookL', ['dodgeR'], 8, false, 'staticUp'),
    burstC: burst('BURST (3)', 'upperTell', 'upper', ['dodgeL', 'dodgeR'], 8, true, 'zap'),
  },

  patterns: [
    {
      id: 'channelSurf', weight: 3,
      steps: [
        { idle: 26 }, { move: 'feedJab' }, { idle: 22 }, { move: 'dropHook' }, { idle: 22 }, { move: 'lowBand' },
        { idle: 22 }, { move: 'crossHook' }, { idle: 22 }, { move: 'surge' }, { idle: 28 }, { taunt: 30 },
      ],
    },
    {
      id: 'burst', weight: 2, fixed: true,
      steps: [
        { idle: 24 }, { move: 'feedJab' }, { idle: 20 },
        { move: 'burstA' }, { move: 'burstB' }, { move: 'burstC' },
        { idle: 14 },
        { open: 50, anim: 'noSignal', star: [2, 16], interrupt: true, stunOnInterrupt: 30, sfx: 'staticLo', sfxLoop: 'crackle', sfxEvery: 12 },
        { idle: 18 },
      ],
    },
    {
      id: 'deadAir', weight: 2,
      steps: [
        { idle: 24 }, { move: 'crossHook' }, { idle: 20 }, { move: 'signalLoss' }, { idle: 24 }, { move: 'feedJab' },
        { idle: 22 }, { move: 'lowBand' }, { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'signalLoss', golden: 'windup', taunt: 36, shout: 'SIGNAL LOST!', times: [1, 2] },

  getUpTable: [
    { upAt: [8, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  special: [{ type: 'glitch', bands: [11, 14, 17], ambient: 0.004 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'tuneTheDial', type: 'stunTrigger', name: 'TUNE THE DIAL',
      trigger: { state: 'windup', move: 'crossHook', counter: true, height: 'high', side: 'R', frames: [4, 6] },
      effect: { stun: 92, hits: 7, say: 'TUNED IN!', sfx: 'crash' },
      hint: { kind: 'audio', text: 'THE RISING WHINE PEAKS JUST BEFORE HIS RIGHT HOOK ARRIVES.' },
      scout: 'A RIGHT-HAND HEAD COUNTER AT THE PEAK OF THE RISING WHINE (HIS CROSSTALK) STUNS HIM FOR 7 HITS.',
    },
    {
      id: 'deadLine', type: 'quirk', name: 'DEAD LINE',
      trigger: { on: 'resolved', move: 'signalLoss', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'noSignal', comboLimit: 6, star: [0, 30] }, say: 'LINE\'S DEAD!', sfx: 'staticLo' },
      hint: { kind: 'audio', text: 'THE MODEM SCREECH CUTS TO SILENCE WHEN YOU SLIP IT.' },
      scout: 'SLIP SIGNAL LOSS: HIS LINE DROPS AND HE FREEZES FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'standBy', type: 'bait', name: 'PLEASE STAND BY', limit: 2,
      trigger: { on: 'passive', frames: 360 },
      effect: { script: [{ open: 56, anim: 'taunt', id: 'fiddle', comboLimit: 4, star: [0, 24] }], say: 'HE\'S FIDDLING WITH THE ANTENNA!' },
      hint: { kind: 'quote', text: 'PLEASE STAND BY.', hidden: true },
      scout: 'STAND STILL FOR 6 SECONDS AND HE FIDDLES WITH THE ANTENNA, WIDE OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'delayedBroadcast', type: 'earlyDodge', name: 'DELAYED BROADCAST', response: 'hold', moves: ['dropHook', 'crossHook'], lead: 6, say: 'BROADCAST DELAYED!',
      scout: 'SLIP HIS HOOK BEFORE THE SOUND PEAKS AND THE BROADCAST LAGS: THE PUNCH ARRIVES AS YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'badSignal', name: 'BAD SIGNAL', when: { left: 75 }, say: 'THE PICTURE BREAKS UP!',
      steps: [{ idle: 20 }, { move: 'feedJab' }, { idle: 14 }, { move: 'dropHook' }, { idle: 14 }, { move: 'crossHook' }, { idle: 14 }, { move: 'surge' }],
    },
  ],
  gallery: 'HE CAME OUT OF A BROKEN TELEVISION, OR SO THEY SAY. THE PICTURE GLITCHES RIGHT ON HIS TELLS.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'DON\'T BLOCK ONCE: SLIP THROUGH THE STATIC.', check: 'never', defense: 'blocked' } },
  music: 'staticWalkup', // his walk-up jingle (data/music/walkups.js)
};
