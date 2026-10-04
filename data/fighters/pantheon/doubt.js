// #74 The Doubt — Pantheon VI, the Mirror Sanctum. He talks. Before every punch a speech box opens over
// his head and shouts what to do about it: LEFT! RIGHT! DUCK! BLOCK! ...and about four times in ten, he lies.
// The box looks exactly the same either way. Read his body, not his words: the tell pose says
// where the punch comes from, whatever he says. And a lie has a price: counter him during a windup where
// he lied and he stumbles over his own words.
// His super is the WORST OF IT: he stops talking altogether, which is worse. A knockdown: slip it.
// Counter it on the glint and he chokes.
// Pantheon VI difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;

export default {
  id: 'doubt',
  name: 'THE DOUBT',
  short: 'DOUBT',
  nickname: 'THE VOICE',
  circuit: 'p6',
  rank: 1,
  isChampion: false,
  card: {
    age: 0,
    weight: 140,
    record: '??-??',
    hometown: 'THE BACK OF YOUR MIND',
    quote: 'ARE YOU SURE? YOU LOOK SURE. YOU SHOULDN\'T. LEFT!',
  },
  lines: { win: 'I TOLD YOU SO.', lose: 'WAS I... WRONG...?' },

  build: 'medium',
  palette: 'doubt',
  spriteLayers: 'doubt',

  stats: stats({ health: 300, damageMult: 2.05, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 }, taunt: ['taunt'] }),

  moves: {
    jab: mv('jab', W, { sfx: { tell: 'whisper' } }),
    jabR: mv('jabR', W, { sfx: { tell: 'whisper' } }),
    hook: mv('hook', W, { sfx: { tell: 'whisper' } }),
    hookL: mv('hookL', W, { sfx: { tell: 'whisper' } }),
    body: mv('body', W, { sfx: { tell: 'whisper' } }),
    bodyR: mv('bodyR', W, { sfx: { tell: 'whisper' } }),
    upper: mv('upper', W, { sfx: { tell: 'whisper' } }),
    worst: superMove('THE WORST OF IT', { sfx: { tell: 'moan', swing: 'swingHeavy' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'secondGuess', weight: 3, when: { rounds: [1] }, steps: steps('i28 hook i16 bodyR i18 upper i32 jab i14 hookL i18 body i40') },
    { id: 'whatIf', weight: 3, steps: steps('i24 bodyR i14 hookL i16 hook i30 upper i20 body i14 jabR i36') },
    { id: 'noWait', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 hookL i12 hook i14 bodyR i24 upper i16 body i12 jab i14 hookL i36') },
  ],

  super: { hit: 'head', move: 'worst', golden: 'windup', window: [10, 13], taunt: 46, shout: 'THE WORST OF IT!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'caughtLying', type: 'stunTrigger', name: 'CAUGHT IN A LIE',
      trigger: { state: 'windup', test: 'lying', counter: true, frames: [3, 6] },
      effect: { stun: 96, hits: 6, star: true, say: 'CAUGHT LYING!', sfx: 'aha' },
      hint: { kind: 'quote', text: 'ARE YOU SURE? YOU LOOK SURE.' },
      scout: 'A COUNTER ON A PUNCH WHOSE SPEECH BOX LIED (THE WRONG DEFENSE) STUNS HIM FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'talksToHimself', type: 'bait', name: 'TALKS TO HIMSELF', limit: 2,
      trigger: { on: 'passive', frames: 270 },
      effect: { script: [{ open: 62, anim: 'taunt', id: 'mumble', comboLimit: 4, star: [0, 26] }], say: 'HE LOSES THE THREAD!' },
      hint: { kind: 'visual', text: 'WHEN NOTHING HAPPENS HE STARTS ARGUING WITH HIMSELF.', hidden: true },
      scout: 'STAND STILL FOR 4.5 SECONDS AND HE LOSES THE THREAD: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'doubtGrows', type: 'passivity', name: 'DOUBT GROWS', response: 'buff', frames: 240, dmg: 0.3, rec: 0.15, meter: 'DOUBT', say: 'DOUBT GROWS!',
      scout: 'WAIT AROUND AND HIS DOUBT FILLS UP: HIS PUNCHES HIT UP TO 30% HARDER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'secondThoughts', name: 'SECOND THOUGHTS', when: { health: 0.4 }, say: 'SECOND THOUGHTS!',
      steps: [{ idle: 16 }, { move: 'hook' }, { idle: 14 }, { move: 'hookL' }, { idle: 16 }, { move: 'upper' }],
    },
  ],
  special: [{ type: 'callout', lie: 0.4 }],
  titleDefense: null,
  gallery: 'HE SHOUTS THE DEFENSE FOR EVERY PUNCH, AND ABOUT FOUR TIMES IN TEN HE LIES.',
  medals: { signature: { text: 'CATCH HIM LYING THREE TIMES.', check: 'cueCount', cue: '!exploit:caughtLying', n: 3 } },
  music: 'doubtWalkup',
};
