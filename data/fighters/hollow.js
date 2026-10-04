// #47 Hollow — Nightmare Circuit. The ring announcer swears there's someone in
// the other corner. You can't see him. Nobody can.
// Hollow is invisible except while he attacks: he fades in as he winds up
// (so the windup IS the tell), stays solid through the punch and a moment of
// the recovery, then melts away again. Hurt, down, or laughing at you, he shows.
// Punch into his unseen guard and your glove lights him up for a moment (and
// costs you hearts, like any blocked punch).
//   he appears with his left glove up         JAB (anything works)
//   he appears winding the right              HOOK from your left: slip left or duck
//   he appears winding the left               HOOK from your right: slip right or duck
//   he appears low                            BODY: block, or slip left
//   he appears crouched, right fist down      FROM BENEATH, his one-hit knockdown
//                                             uppercut: slip it
//   he appears with his arms spread, wailing  the WAIL, his taunt: hit him on the
//                                             glint and he goes down (perfect hit)
// After his POLTERGEIST (three in a row: slip, slip right, slip left) he's left
// visible and drained: hit him.

const haunt = (name, tell, act, avoid, windup, last, sfx) => ({
  name, windupFrames: windup, activeFrames: 5, recoveryFrames: last ? 20 : 3,
  damage: last ? 17 : 15,
  avoidBy: avoid,
  counterWindow: null, starWindow: null, noFake: true,
  sfx: { tell: sfx, swing: last ? 'swingHeavy' : 'whiff' },
  animation: { windup: [tell], active: [act], recovery: last ? [act, 'idle1'] : [act] },
});

export default {
  id: 'hollow',
  name: 'HOLLOW',
  short: 'HOLLOW',
  nickname: 'THE UNSEEN',
  circuit: 'nightmare',
  rank: 3,
  isChampion: false,
  card: {
    age: '??',
    weight: '0',
    record: '13-0 13KO',
    hometown: 'THE EMPTY SEATS',
    quote: 'I\'VE BEEN IN YOUR CORNER THE WHOLE TIME.',
  },
  lines: {
    win: 'NOW YOU SEE ME.',
    lose: 'NOW... YOU DON\'T...',
  },

  build: 'lean',
  palette: 'hollow',
  spriteLayers: 'hollow',

  stats: {
    health: 250,
    damageMult: 1.7,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.6,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['wail1', 'wail2'], rate: 8 },
    victory: ['victory'],
    drained: { frames: ['winded1', 'winded2'], rate: 18 },
  },
  // mid-wail

  moves: {
    hJab: {
      name: 'COLD JAB',
      windupFrames: 6, activeFrames: 5, recoveryFrames: 20,
      damage: 15,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 4],
      starWindow: null,
      sfx: { tell: 'whisper', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    hHook: {
      name: 'GRAVE HOOK',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'moan', swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    hHookL: {
      name: 'GRAVE HOOK',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'moan', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    hBody: {
      name: 'CHILL',
      windupFrames: 7, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeL'],
      counterWindow: [2, 5],
      starWindow: null,
      sfx: { tell: 'whisper', swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // one-hit knockdown: up out of the canvas
    beneath: {
      name: 'FROM BENEATH',
      knockdown: true,
      windupFrames: 12, activeFrames: 8, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 9],
      starWindow: [3, 5],
      punishStar: ['dodged'],
      noFake: true,
      sfx: { tell: 'wail', swing: 'swingHeavy' },
      animation: { windup: ['beneathTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
    // POLTERGEIST: three at once
    polt1: haunt('POLTERGEIST', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 7, false, 'whisper'),
    polt2: haunt('POLTERGEIST (2)', 'hookLTell', 'hookL', ['dodgeR'], 6, false, 'moan'),
    polt3: haunt('POLTERGEIST (3)', 'hookTell', 'hook', ['dodgeL'], 6, true, 'moan'),
  },

  patterns: [
    {
      id: 'haunt', weight: 3,
      steps: [
        { idle: 30 }, { move: 'hJab' }, { idle: 26 }, { move: 'hHook' }, { idle: 26 }, { move: 'hBody' },
        { idle: 26 }, { move: 'hHookL' }, { idle: 30 }, { taunt: 30 },
      ],
    },
    {
      id: 'poltergeist', weight: 2, fixed: true,
      steps: [
        { idle: 28 }, { move: 'polt1' }, { move: 'polt2' }, { move: 'polt3' },
        { idle: 12 },
        { open: 50, anim: 'drained', star: [2, 16], interrupt: true, stunOnInterrupt: 30, sfxLoop: 'pant', sfxEvery: 22 },
        { idle: 20 },
      ],
    },
    {
      id: 'beneath', weight: 2,
      steps: [
        { idle: 28 }, { move: 'hHookL' }, { idle: 22 }, { move: 'beneath' }, { idle: 26 }, { move: 'hJab' },
        { idle: 26 }, { taunt: 30 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'beneath', golden: 'taunt', window: [12, 15], taunt: 36, shout: 'FROM BENEATH...', times: [1, 2] },

  getUpTable: [
    { upAt: [8, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  special: [{ type: 'vanish', fadeIn: 4, linger: 6, fadeOut: 8, reveal: 14 }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'chilled', type: 'stunTrigger', name: 'COLD SPOT',
      trigger: { state: 'windup', move: 'hBody', counter: true, height: 'low', frames: [3, 5] },
      effect: { stun: 96, hits: 7, say: 'FOUND HIM!', sfx: 'oof' },
      hint: { kind: 'visual', text: 'HE FADES IN LOW, AND HIS FACE IS OPEN.' },
      scout: 'A BODY COUNTER ON HIS CHILL AS HE FADES IN STUNS HIM FOR 7 HITS.',
    },
    {
      id: 'risenSlipped', type: 'quirk', name: 'GRAVE ERROR',
      trigger: { on: 'resolved', move: 'beneath', result: 'dodged' },
      effect: { open: { frames: 88, anim: 'drained', comboLimit: 6, star: [0, 30] }, say: 'HE SPENT HIMSELF!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'THE WAIL DIES AWAY WHEN YOU SLIP IT.' },
      scout: 'SLIP FROM BENEATH: HE\'S DRAINED AND VISIBLE FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'inYourCorner', type: 'bait', name: 'IN YOUR CORNER', limit: 2,
      trigger: { on: 'passive', frames: 420 },
      effect: { script: [{ open: 60, anim: 'taunt', id: 'reveal', comboLimit: 4, star: [0, 26] }], say: 'HE CAN\'T HELP SHOWING OFF!' },
      hint: { kind: 'quote', text: 'I\'VE BEEN IN YOUR CORNER THE WHOLE TIME.', hidden: true },
      scout: 'STAND STILL FOR 7 SECONDS AND HE REVEALS HIMSELF, WIDE OPEN FOR 4 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'graveChill', type: 'turtling', name: 'GRAVE CHILL', response: 'drain', share: 0.4, span: 480, every: 50, say: 'THE CHILL SEEPS IN!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND THE GRAVE CHILL SEEPS THROUGH IT: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'haunting', name: 'THE HAUNTING', when: { left: 75 }, say: 'HE\'S EVERYWHERE!',
      steps: [{ idle: 20 }, { move: 'hJab' }, { idle: 14 }, { move: 'hHook' }, { idle: 14 }, { move: 'hBody' }, { idle: 14 }, { move: 'hHookL' }],
    },
  ],
  gallery: 'A FIGHTER YOU CAN ONLY SEE WHEN HE\'S ABOUT TO HIT YOU.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'LAND 8 COUNTERS.', check: 'counters', n: 8 } },
  music: 'hollowWalkup', // his walk-up jingle (data/music/walkups.js)
};
