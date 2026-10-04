// #78 The Scribe — Pantheon VII, the Summit. A clerk of the heavens with a quill for a weapon, and he
// writes everything down. Every punch of his that LANDS on you goes on a page: from then on he throws
// it more, at breaks between his combos, and the more pages, the more often. A perfect player gives him
// nothing to write. Every mistake you make he learns, and throws back at you. (PAGES under the clock.)
// He also stops, now and then, to take notes: that's an opening.
// His super is the FINAL DRAFT: he strikes it all out. A knockdown: slip it. Counter it on the glint
// and he strikes out his own name.
// Pantheon VII difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const notes = { open: 46, anim: 'taunt', id: 'notes', comboLimit: 4, star: [0, 20], limit: 3 };

export default {
  id: 'scribe',
  name: 'THE SCRIBE',
  short: 'SCRIBE',
  nickname: 'THE RECORD',
  circuit: 'p7',
  rank: 3,
  isChampion: false,
  card: {
    age: 88,
    weight: 149,
    record: 'ALL OF THEM',
    hometown: 'THE ARCHIVE',
    quote: 'I HAVE WRITTEN DOWN EVERY MISTAKE YOU HAVE EVER MADE. IT IS A LONG BOOK.',
  },
  lines: { win: 'AS FORETOLD, IN INK.', lose: 'STRIKE... THAT... FROM THE RECORD...' },

  build: 'medium',
  palette: 'scribe',
  spriteLayers: 'scribe',

  stats: stats({ health: 320, damageMult: 2.1, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    jab: mv('jab', W, { name: 'QUILL JAB', sfx: { tell: 'scratch' } }),
    jabR: mv('jabR', W, { name: 'QUILL CROSS', sfx: { tell: 'scratch' } }),
    hook: mv('hook', W, { name: 'FLOURISH', sfx: { tell: 'scratch' } }),
    hookL: mv('hookL', W, { name: 'FLOURISH (L)', sfx: { tell: 'scratch' } }),
    body: mv('body', W, { name: 'UNDERLINE', sfx: { tell: 'scratch' } }),
    bodyR: mv('bodyR', W, { name: 'UNDERLINE (R)', sfx: { tell: 'scratch' } }),
    upper: mv('upper', W, { name: 'CAPITAL LETTER', sfx: { tell: 'scratch' } }),
    finalDraft: superMove('FINAL DRAFT', { sfx: { tell: 'scratch', swing: 'swingHeavy' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'firstDraft', weight: 3, when: { rounds: [1] }, steps: [...steps('i28 jab i16 hookL i20 bodyR i34 upper'), notes, ...steps('i28 jabR i16 hook i40')] },
    { id: 'redPen', weight: 3, steps: [...steps('i24 hook i14 body i18 jab i32 upper i20 bodyR'), notes, ...steps('i26 hookL i40')] },
    { id: 'marginalia', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 jabR i12 hookL i14 upper i26 body i14 hook i14 jab i36') },
  ],

  super: { hit: 'body', move: 'finalDraft', golden: 'windup', window: [10, 13], taunt: 46, shout: 'FINAL DRAFT!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'crossedOut', type: 'stunTrigger', name: 'CROSSED OUT',
      trigger: { state: 'idle', star: true },
      effect: { stun: 84, hits: 5, say: 'CROSSED OUT!', sfx: 'crash' },
      hint: { kind: 'quote', text: 'I HAVE WRITTEN DOWN EVERY MISTAKE YOU HAVE EVER MADE.' },
      scout: 'A STAR PUNCH THAT LANDS ON HIM WHILE HE STANDS STILL TEARS UP HIS PAGES AND STUNS HIM FOR 5 HITS.',
    },
    {
      id: 'inkSpill', type: 'quirk', name: 'THE INKWELL SPILLS',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'THE INKWELL SPILLS!', sfx: 'splash' },
      hint: { kind: 'visual', text: 'A CAPITAL LETTER THAT MISSES SWINGS HIS INKWELL OFF HIS BELT.', hidden: true },
      scout: 'SLIP HIS CAPITAL LETTER (THE UPPERCUT): THE INKWELL SPILLS AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'readsYourHabits', type: 'comboRepeat', name: 'READS YOUR HABITS', gap: 40, delay: 14, counter: ['jab', 'jabR'], say: 'HE KNOWS IT!',
      scout: 'THROW THE SAME TWO-PUNCH COMBO TWICE IN A ROW AND HE HAS IT WRITTEN DOWN: HE CATCHES THE SECOND AND ANSWERS WITH TWO JABS.',
    },
  ],
  scriptedMoments: [
    {
      id: 'finalChapter', name: 'THE FINAL CHAPTER', when: { left: 60 }, say: 'THE FINAL CHAPTER!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 14 }, { move: 'hookL' }, { idle: 16 }, { move: 'upper' }],
    },
  ],
  special: [{ type: 'scribe', max: 4, base: 0.3, per: 0.15, gap: 200, eraseOn: 'crossedOut' }],
  titleDefense: null,
  gallery: 'A CLERK OF THE HEAVENS. EVERY HIT HE LANDS HE WRITES DOWN, AND THEN THROWS AT YOU AGAIN.',
  medals: { signature: { text: 'NEVER LET HIM WRITE A PAGE.', check: 'noCue', cue: '!wrote' } },
  music: 'scribeWalkup',
};
