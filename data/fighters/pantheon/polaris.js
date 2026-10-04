// #64 Polaris — Pantheon IV, the Starfield. The astronomer, and he never moves. He stands in the
// middle of the ring, hands up, while the sky over him does his talking: before every punch a
// CONSTELLATION draws itself over his head, star by star, and the shape it makes is the shape of
// the punch: a rising line to the left is the left jab, a long arc on the right is the right
// hook, a low bar is the body blow, a zigzag is the uppercut. Read the sky, then slip, block or
// duck as the shape says. Only when the last star is lit does he begin his tell.
// His super is the NORTH STAR: a five-pointed star closes around him, then it falls. A knockdown:
// slip it. Counter it on the glint and the star falls on him.
// Pantheon IV difficulty: 5-frame tells (after the sky has said it), shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;
// a five-pointed star, drawn as a pentagram: every second point joined
const penta = (r, cy) => [0, 2, 4, 1, 3].map((k) => { const a = -Math.PI / 2 + (k / 5) * Math.PI * 2; return [Math.round(Math.cos(a) * r), Math.round(cy + Math.sin(a) * r)]; });

export default {
  id: 'polaris',
  name: 'POLARIS',
  short: 'POLARIS',
  nickname: 'THE NORTH STAR',
  circuit: 'p4',
  rank: 3,
  isChampion: false,
  card: {
    age: 71,
    weight: 154,
    record: '52-0 33KO',
    hometown: 'THE OBSERVATORY',
    quote: 'I HAVE NEVER MOVED. THE SKY HAS NEVER MOVED ME. WATCH THE STARS.',
  },
  lines: { win: 'THE STARS FORETOLD IT.', lose: 'A STAR... HAS FALLEN...' },

  build: 'lean',
  palette: 'polaris',
  spriteLayers: 'polaris',

  stats: stats({ health: 300, damageMult: 1.9, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),

  moves: {
    jab: mv('jab', W, { name: 'LEFT JAB', shape: 'jab', sfx: { tell: 'chime' } }),
    jabR: mv('jabR', W, { name: 'RIGHT CROSS', shape: 'jabR', sfx: { tell: 'chime' } }),
    hook: mv('hook', W, { name: 'ARC: RIGHT HOOK', shape: 'hook', sfx: { tell: 'chime' } }),
    hookL: mv('hookL', W, { name: 'ARC: LEFT HOOK', shape: 'hookL', sfx: { tell: 'chime' } }),
    body: mv('body', W, { name: 'BAR: LEFT BODY', shape: 'body', sfx: { tell: 'chime' } }),
    bodyR: mv('bodyR', W, { name: 'BAR: RIGHT BODY', shape: 'bodyR', sfx: { tell: 'chime' } }),
    upper: mv('upper', W, { name: 'ZIGZAG: UPPERCUT', shape: 'upper', sfx: { tell: 'chime' } }),
    // his reflex when you swing at his guard: no stars, just a snap (the sky is for punches he chooses)
    snap: mv('jab', W - 1, { name: 'SNAP JAB', noFake: true, sfx: { tell: 'grunt' } }),
    // the super: a five-pointed star closes round him, then it falls
    northStar: superMove('NORTH STAR', { shape: 'north', windupFrames: 20, kdWindow: [10, 13], sfx: { tell: 'fanfare', swing: 'swingHeavy' } }),
  },

  patterns: [
    { id: 'orrery', weight: 3, when: { rounds: [1] }, steps: steps('i30 jab i16 hook i20 body i36 upper i30 jabR i16 hookL i40') },
    { id: 'zodiac', weight: 3, steps: steps('i28 bodyR i16 jab i14 hookL i34 upper i24 body i18 hook i44') },
    { id: 'meridian', weight: 2, when: { rounds: [2, 3] }, steps: steps('i24 hookL i14 hook i30 jab i12 jabR i30 upper i22 bodyR i40') },
    { id: 'eclipseTable', weight: 2, steps: steps('i26 upper i22 body i16 jabR i30 hook i18 bodyR i16 jab i40') },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'northStar', golden: 'windup', window: [10, 13], taunt: 46, shout: 'NORTH STAR!', times: [1, 2] },

  guardCounter: 'snap',
  getUpTable: GETUP,


  // --- the knowledge layer (spec §17) ---
  exploits: [
    {
      id: 'droppedStar', type: 'stunTrigger', name: 'A DROPPED STAR',
      trigger: { state: 'windup', move: ['hook', 'hookL', 'upper'], frames: [9, 11], clean: 30 },
      effect: { stun: 96, hits: 6, star: true, say: 'THE SHAPE BREAKS!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'THE LAST STAR OF A LONG SHAPE FLICKERS JUST BEFORE IT CLOSES.' },
      scout: 'A PUNCH IN THE LAST FEW FRAMES OF A HOOK\'S OR UPPERCUT\'S CONSTELLATION, BEFORE HIS TELL, BREAKS THE SHAPE: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'burnedOut', type: 'quirk', name: 'THE NORTH STAR BURNS OUT',
      trigger: { on: 'resolved', move: 'northStar', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'THE STAR BURNS OUT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE BIG STAR TAKES EVERYTHING HE HAS. IT FALLS AND LEAVES HIM DARK.', hidden: true },
      scout: 'SLIP THE NORTH STAR: HE BURNS OUT WITH IT AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'skyWaits', type: 'earlyDodge', name: 'THE SKY WAITS', response: 'hold', moves: ['hook', 'hookL', 'upper'], say: 'THE SKY WAITS!',
      scout: 'SLIP EARLY, BEFORE THE LAST STAR, AND HE HOLDS HIS HOOK OR UPPERCUT SO IT LANDS AS YOUR SLIP RUNS OUT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'zenith', name: 'THE ZENITH', when: { left: 75 }, say: 'THE ZENITH!',
      steps: [{ idle: 20 }, { move: 'jab' }, { idle: 16 }, { move: 'jabR' }, { idle: 18 }, { move: 'upper' }],
    },
  ],
  special: [
    {
      type: 'constellation', pre: 12, at: [0, -70], label: 'CONSTELLATION', closed: ['north'],
      shapes: {
        jab: [[-58, -14], [-42, -18], [-26, -20]],
        jabR: [[58, -14], [42, -18], [26, -20]],
        hook: [[26, -44], [46, -32], [54, -8], [46, 14], [28, 22]],
        hookL: [[-26, -44], [-46, -32], [-54, -8], [-46, 14], [-28, 22]],
        body: [[-56, 8], [-40, 12], [-24, 10], [-10, 18]],
        bodyR: [[56, 8], [40, 12], [24, 10], [10, 18]],
        upper: [[0, 30], [-12, 14], [8, -4], [-8, -22], [2, -40]],
        north: penta(60, -4),
      },
    },
  ],
  titleDefense: null,
  gallery: 'THE ASTRONOMER OF THE STARFIELD. HE NEVER MOVES: THE STARS CONNECT OVER HIS HEAD INTO THE SHAPE OF HIS NEXT PUNCH.',
  medals: { signature: { text: 'SLIP THE NORTH STAR TWICE.', check: 'moveResult', move: 'northStar', result: 'dodged', n: 2 } },
  music: 'polarisWalkup',
};
