// #109 THE BLOCK SHARD — Void I. A guard the Void emptied out. EVERY attack of his can only be blocked: slipping and ducking do nothing
// against him. Blocked, a punch leaves him open for one clean shot, and that is the whole fight: block, jab, block. But his rhythm keeps
// changing (every gap is stretched by a random amount, in phrases that change every few moves), so you cannot count the jab in, and his
// arms are heavy: hold your guard up too long and your hearts drain (Arms Tire). The Bulwark's long windup is the one to counter.
// His super is BULWARK BREAKER.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const B = ['block'];
const heavy = { recoveryFrames: 30 };
const M = {
  jab: only(B, vm('jab', { name: 'SHIELD JAB', ...heavy })),
  cross: only(B, vm('jabR', { name: 'SHIELD CROSS', ...heavy })),
  hook: only(B, vm('hook', { name: 'SHIELD HOOK', ...heavy })),
  hookL: only(B, vm('hookL', { name: 'SHIELD HOOK (L)', ...heavy })),
  body: only(B, vm('body', { name: 'PLATE BLOW', ...heavy })),
  bodyR: only(B, vm('bodyR', { name: 'PLATE BLOW (R)', ...heavy })),
  upper: only(B, vm('upper', { name: 'RAM UPPERCUT', recoveryFrames: 32 })),
  bulwark: only(B, vm('haymaker', { name: 'THE BULWARK', recoveryFrames: 44 })),
  breaker: only(B, superMove('BULWARK BREAKER', { windupFrames: 22, counterWindow: [5, 19], starWindow: [5, 9], sfx: { tell: 'gate', swing: 'crash' } })),
};
const ALL = ['jab', 'cross', 'hook', 'hookL', 'body', 'bodyR', 'upper'];
const P = (id, seed, moves, gaps) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps, rest: { every: 8, steps: [{ idle: 30 }, { move: 'bulwark' }, { idle: 40 }] }, after: () => 6 }) });

export default {
  id: 'blockShard',
  name: 'THE BLOCK SHARD',
  short: 'BLOCK SHARD',
  nickname: 'THE WALL THAT WALKS',
  circuit: 'v1',
  rank: 3,
  isChampion: false,
  card: { age: 0, weight: 340, record: '0-0 0KO', hometown: 'BEHIND THE SHIELD', quote: 'DON\'T RUN. DON\'T LEAN. STAND BEHIND YOUR HANDS AND TAKE IT.' },
  lines: { win: 'YOU MOVED. THAT WAS THE MISTAKE.', lose: 'I HELD... I ALWAYS HELD...' },

  build: 'heavy',
  palette: 'blockShard',
  spriteLayers: 'blockShard',

  stats: stats({ health: 420, damageMult: 2.1, stunResistance: 8, starLossChance: 0.6, stunFrames: 56, hitstun: 12, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),
  guardCounter: 'bulwark',

  moves: M,
  patterns: [
    P('wall1', 1093, [['jab', 3], ['cross', 3], ['hook', 2], ['hookL', 2], ['body', 3], ['bodyR', 3], ['upper', 1]], [6, 14]),
    P('wall2', 2109, [['body', 3], ['bodyR', 3], ['upper', 2], ['hook', 2], ['hookL', 2], ['jab', 2], ['cross', 2]], [6, 16]),
    P('wall3', 3121, [['hook', 3], ['hookL', 3], ['jab', 3], ['cross', 3], ['body', 1], ['bodyR', 1], ['upper', 2]], [6, 12]),
  ],

  super: { hit: 'head', move: 'breaker', golden: 'windup', window: [11, 14], taunt: 50, shout: 'BULWARK BREAKER!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: ['threeBlocks'],

  exploits: [
    {
      id: 'bulwarkFalls', type: 'stunTrigger', name: 'THE BULWARK FALLS',
      trigger: { state: 'windup', move: 'bulwark', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 124, hits: 8, star: true, say: 'THE BULWARK FALLS!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE BULWARK RAISES BOTH ARMS HIGH AND FOR A MOMENT HIS WHOLE GUARD IS OPEN.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE BULWARK (BOTH ARMS RAISED): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'heldTooLong', type: 'quirk', name: 'THE GUARD HOLDS',
      trigger: { on: 'resolved', move: ALL, result: 'blocked', flag: 'threeBlocks' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'HIS ARMS GIVE OUT!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'EVERY BLOCKED PUNCH SHAKES HIS ARMS. THE THIRD BLOCK IN A ROW, WITHOUT A PUNCH OF YOURS BETWEEN, SHAKES THEM LOOSE.' },
      scout: 'BLOCK THREE OF HIS PUNCHES IN A ROW WITHOUT PUNCHING IN BETWEEN: HIS ARMS GIVE OUT AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'wrongWall', type: 'quirk', name: 'THE WRONG WALL',
      trigger: { on: 'resolved', move: 'bulwark', result: 'blocked' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'THE BULWARK RECOILS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE BULWARK ROCKS BACK ON HIS HEELS WHEN IT MEETS A GUARD.', hidden: true },
      scout: 'BLOCK THE BULWARK (THE SLOW, BIG PUNCH WITH BOTH ARMS UP): HE RECOILS AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'armsTire', type: 'turtling', name: 'ARMS TIRE', response: 'drain', span: 300, share: 0.7, every: 40, say: 'YOUR ARMS ARE TIRING!',
      scout: 'HOLD YOUR GUARD UP FOR MOST OF THE LAST FIVE SECONDS AND YOUR ARMS TIRE: A HEART DRAINS EVERY SECOND YOU KEEP IT UP. BLOCK WHEN HE PUNCHES, NOT BEFORE.',
    },
  ],
  scriptedMoments: [
    { id: 'aLongHush', name: 'A LONG HUSH', when: { left: 80 }, say: 'A LONG HUSH!', steps: [{ idle: 60 }, { move: 'jab' }, { idle: 6 }, { move: 'cross' }, { idle: 6 }, { move: 'hook' }, { idle: 70 }, { move: 'bulwark' }] },
  ],
  special: [{ type: 'syncopate', rhythms: [[0, 0, 0, 30], [22, 0, 0, 0], [8, 8, 8, 8, 40], [40, 0], [0, 14, 28, 0, 42], [16, 16, 0, 48]] }, { type: 'blockflow' }],
  titleDefense: null,
  gallery: 'A GUARD THE VOID EMPTIED OUT. ONLY A BLOCK STOPS HIS PUNCHES, AND HIS RHYTHM KEEPS CHANGING. ARMS TIRE.',
  medals: { signature: { text: 'MAKE HIS ARMS GIVE OUT.', check: 'cueCount', cue: '!exploit:heldTooLong', n: 1 }, speed: 525 }, // (Phase F: the bot needs 5:49 and up to 8:23 for him: a clean shot after each block)
  music: 'blockShardWalkup',
};
