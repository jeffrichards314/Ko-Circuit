// #45 Null — Underground Circuit. Nobody knows where he came from, and he's
// never said a word. Grey from head to toe, and he doesn't MOVE: no bounce, no
// breathing, no shuffle, not one pixel of idle animation. So when something
// moves, that's the tell. And it's never much. One or two pixels:
//   his left glove creeps up 2px     JAB (anything works)
//   his right shoulder rolls out 1px HOOK from your left: slip left or duck
//   his left shoulder rolls out 1px  HOOK from your right: slip right or duck
//   he sinks 1px, gloves dropping    BODY: block, or slip right
//   his right glove dips 1px         UPPERCUT: slip either way, punish for a star
//   he rises 1px, gloves pulling in  ERASE, his one-hit knockdown. Slip it, or
//                                    counter it on the glint (perfect hit).
// No sounds either: his tells are silent. Only the swing makes a noise.
// Every so often he blinks. It's the only thing he does for no reason, and
// it's his weak spot: hit him mid-blink, on the glint, and he goes down.

export default {
  id: 'null',
  name: 'NULL',
  short: 'NULL',
  nickname: 'THE BLANK',
  circuit: 'underground',
  rank: 1,
  isChampion: false,
  card: {
    age: '--',
    weight: 170,
    record: '0-0 0KO',
    hometown: 'NOWHERE',
    quote: '...',
  },
  lines: {
    win: '...',
    lose: '.',
  },

  build: 'medium',
  palette: 'null',
  spriteLayers: 'null',

  stats: {
    health: 250,
    damageMult: 1.6,
    stunResistance: 5,
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

  // one frame, forever
  anims: {
    idle: ['idle1'],
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: { frames: ['idle1', 'blink', 'blink', 'idle1'], rate: 10 },
    victory: ['victory'],
  },
  // mid-blink (the 2nd and 3rd frames of the taunt)

  moves: {
    nJab: {
      name: 'NULL JAB',
      windupFrames: 9, activeFrames: 5, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['nJabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    nHook: {
      name: 'NULL HOOK',
      windupFrames: 9, activeFrames: 6, recoveryFrames: 22,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['nHookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    nHookL: {
      name: 'NULL HOOK',
      windupFrames: 9, activeFrames: 6, recoveryFrames: 22,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['nHookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    nBody: {
      name: 'NULL BODY',
      windupFrames: 9, activeFrames: 6, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block', 'dodgeR'],
      counterWindow: [2, 7],
      starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['nBodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    nUpper: {
      name: 'NULL UPPERCUT',
      windupFrames: 9, activeFrames: 7, recoveryFrames: 34,
      damage: 19,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [2, 7],
      starWindow: [2, 4],
      punishStar: ['dodged'],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['nUpperTell'], active: ['upper'], recovery: ['upper', 'idle1'] },
    },
    // one-hit knockdown
    erase: {
      name: 'ERASE',
      knockdown: true,
      windupFrames: 16, activeFrames: 10, recoveryFrames: 44,
      damage: 29,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 13],
      starWindow: [3, 5],
      kdWindow: [8, 11],
      noFake: true,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['nEraseTell'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'void', weight: 3,
      steps: [
        { idle: 30 }, { move: 'nJab' }, { idle: 24 }, { move: 'nHook' }, { idle: 24 }, { move: 'nBody' },
        { idle: 24 }, { move: 'nHookL' }, { idle: 24 }, { move: 'nUpper' }, { idle: 30 }, { taunt: 40 },
      ],
    },
    {
      id: 'erase', weight: 2,
      steps: [
        { idle: 28 }, { move: 'nHookL' }, { idle: 22 }, { move: 'erase' }, { idle: 26 }, { move: 'nJab' },
        { idle: 24 }, { move: 'nBody' }, { idle: 26 }, { taunt: 40 },
      ],
    },
    {
      id: 'loop', weight: 2, fixed: true,
      steps: [
        { idle: 26 }, { move: 'nJab' }, { idle: 18 }, { move: 'nJab' }, { idle: 18 }, { move: 'nUpper' },
        { idle: 22 }, { move: 'nBody' }, { idle: 28 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'erase', golden: 'taunt', window: [13, 16], taunt: 36, times: [1, 2] },

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  special: [],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  exploits: [
    {
      id: 'sinkingFeeling', type: 'stunTrigger', name: 'SINKING FEELING',
      trigger: { state: 'windup', move: 'nBody', counter: true, height: 'low', frames: [4, 7] },
      effect: { stun: 100, hits: 8, say: 'HE SANK!', sfx: 'oof' },
      hint: { kind: 'visual', text: 'HE SINKS A SINGLE PIXEL, AND HIS GLOVES DROP WITH HIM.' },
      scout: 'A BODY COUNTER ON HIS NULL BODY, AS HE SINKS, STUNS HIM FOR 8 HITS.',
    },
    {
      id: 'eraseUndone', type: 'quirk', name: 'ERASED HIMSELF',
      trigger: { on: 'resolved', move: 'erase', result: 'dodged' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 6, star: [0, 28] }, say: 'HE ERASED HIMSELF!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HE RISES A PIXEL AND PULLS HIS GLOVES IN: ALL IN ON ONE SWING.' },
      scout: 'SLIP ERASE: HE STANDS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'nothingCounter', type: 'patternBreak', name: 'NOTHING TO SEE', limit: 3,
      trigger: { state: 'windup', move: 'nJab', counter: true, frames: [3, 6] },
      effect: { cancelMoves: ['nUpper'], star: true, say: 'LOOPED OUT!' },
      hint: { kind: 'trainer', text: 'HIS LOOP ENDS IN THE UPPERCUT.', hidden: true },
      scout: 'COUNTER A JAB IN HIS LOOP: THE UPPERCUT IS CANCELLED AND YOU GET A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'voidGrows', type: 'passivity', name: 'THE VOID GROWS', response: 'buff', frames: 240, gain: 1 / 540, decay: 1 / 240, dmg: 0.25, rec: 0.2, meter: 'VOID', say: 'THE VOID GROWS!',
      scout: 'STAND AROUND WAITING AND HIS VOID FILLS: HIS PUNCHES HIT UP TO 25% HARDER. THROW A PUNCH AND IT DRAINS.',
    },
  ],
  scriptedMoments: [
    {
      id: 'blankSlate', name: 'BLANK SLATE', when: { left: 45 }, say: '...',
      steps: [{ idle: 24 }, { move: 'nJab' }, { idle: 12 }, { move: 'nJab' }, { idle: 12 }, { move: 'nHookL' }, { idle: 12 }, { move: 'nUpper' }],
    },
  ],
  gallery: 'NO NAME, NO FACE, NO IDLE. HIS TELLS ARE ONE OR TWO PIXELS. YOU HAVE TO WANT TO SEE THEM.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'LAND 12 COUNTERS.', check: 'counters', n: 12 } },
  music: 'nullWalkup', // his walk-up jingle (data/music/walkups.js)
};
