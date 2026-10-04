// #68 Anvil — Pantheon V, the Thunder Forge. A smith with a hammer for each fist, and he swings them
// like it: no feints, no tricks, just iron. But iron rings. Every punch of his you BLOCK rings
// through your arms, and every THIRD blocked punch shatters your guard: for a full second and a
// half nothing you block is stopped. So don't lean on the guard: slip him. The count (BLOCKED 2/3)
// shows under the clock.
// His super is the ANVIL DROP: both hammers up together, then all his weight. A knockdown: slip it.
// Counter it on the glint and he drops it on his own foot.
// Pantheon V difficulty: 6-frame tells (a heavy man's 4), shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;

export default {
  id: 'anvil',
  name: 'ANVIL',
  short: 'ANVIL',
  nickname: 'THE HAMMER',
  circuit: 'p5',
  rank: 3,
  isChampion: false,
  card: {
    age: 46,
    weight: 262,
    record: '58-2 51KO',
    hometown: 'THE THUNDER FORGE',
    quote: 'I DON\'T BREAK BONES. I BEND THEM BACK THE WAY I WANT THEM.',
  },
  lines: { win: 'STRUCK TRUE.', lose: 'CRACKED... AT THE HANDLE...' },

  build: 'heavy',
  palette: 'anvil',
  spriteLayers: 'anvil',

  stats: stats({ health: 340, damageMult: 2.0, stunResistance: 6, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }),

  moves: {
    jab: mv('jab', W, { name: 'LEFT HAMMER', sfx: { tell: 'clang' } }),
    jabR: mv('jabR', W, { name: 'RIGHT HAMMER', sfx: { tell: 'clang' } }),
    hook: mv('hook', W, { name: 'HAMMER SWING', sfx: { tell: 'clang' } }),
    hookL: mv('hookL', W, { name: 'HAMMER SWING (L)', sfx: { tell: 'clang' } }),
    bodyR: mv('bodyR', W, { name: 'RIVET BLOW', sfx: { tell: 'clang' } }),
    sledge: mv('haymaker', W, { name: 'SLEDGE', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'clang', swing: 'swingHeavy' } }),
    // the super: both hammers up together, then all his weight
    anvilDrop: superMove('ANVIL DROP', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'clang', swing: 'crash' } }),
  },

  patterns: [
    { id: 'strike', weight: 3, when: { rounds: [1] }, steps: steps('i30 jab i18 hook i20 bodyR i34 sledge i36 jabR i18 hookL i44') },
    { id: 'temper', weight: 3, steps: steps('i26 jabR i16 jab i16 hookL i32 bodyR i22 sledge i34 hook i44') },
    { id: 'quench', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 hook i16 hookL i22 jab i14 jabR i30 sledge i20 bodyR i40') },
  ],

  super: { hit: 'head', move: 'anvilDrop', golden: 'windup', window: [12, 15], taunt: 48, shout: 'ANVIL DROP!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'crackedHandle', type: 'stunTrigger', name: 'A CRACKED HANDLE',
      trigger: { state: 'windup', move: 'sledge', counter: true, frames: [11, 15] },
      effect: { stun: 104, hits: 6, star: true, say: 'THE HANDLE CRACKS!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE SLEDGE\'S HANDLE CREAKS AT THE TOP OF THE SWING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE SLEDGE\'S WINDUP SNAPS ITS HANDLE: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'stuckRivet', type: 'quirk', name: 'THE HAMMER STICKS',
      trigger: { on: 'resolved', move: 'bodyR', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'THE HAMMER STICKS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE RIVET BLOW DRIVES HIS HAMMER INTO THE FLOOR IF IT MISSES.', hidden: true },
      scout: 'SLIP RIGHT OF HIS RIVET BLOW: THE HAMMER STICKS IN THE FLOOR AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'ironCap', type: 'zoneBias', name: 'HARDENS THE ZONE', streak: 4, frames: 480, raise: 'IRON PLATE!', say: 'IRON PLATE!',
      scout: 'HIT THE SAME PLACE FOUR TIMES IN A ROW AND HE HARDENS IT WITH IRON PLATE FOR 8 SECONDS: ALTERNATE HEAD AND BODY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'quenching', name: 'THE QUENCH', when: { left: 75 }, say: 'THE QUENCH!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 16 }, { move: 'jabR' }, { idle: 30 }, { move: 'sledge' }],
    },
  ],
  special: [{ type: 'tally', n: 3, frames: 90, fade: 420 }],
  titleDefense: null,
  gallery: 'A SMITH WITH A HAMMER FOR EACH FIST. EVERY THIRD PUNCH YOU BLOCK BREAKS YOUR GUARD.',
  medals: { signature: { text: 'NEVER GET YOUR GUARD BROKEN.', check: 'noCue', cue: '!guardBreak' } },
  music: 'anvilWalkup',
};
