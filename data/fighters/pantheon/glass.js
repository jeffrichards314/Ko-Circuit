// #73 Glass — Pantheon VI, the Mirror Sanctum. A man of crystal. Hit him hard (a counter, a Star
// Punch, or a run of plain hits) and he SHATTERS: he bursts into shards, out of reach, and then
// re-forms in a flash. THE MOMENT HE RE-FORMS IS THE ONLY STAR WINDOW: none of his punches carry a star
// for you. So don't chase him into the shards: wait for the flash and hit him as he comes back together.
// His super is the SHATTER STRIKE: a knockdown, slipped. Counter it on the glint and he goes to pieces.
// Pantheon VI difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const dull = (m) => ({ ...m, starWindow: null, punishStar: null });

export default {
  id: 'glass',
  name: 'GLASS',
  short: 'GLASS',
  nickname: 'THE CRYSTAL MAN',
  circuit: 'p6',
  rank: 2,
  isChampion: false,
  card: {
    age: 27,
    weight: 143,
    record: '37-3 30KO',
    hometown: 'THE HALL OF MIRRORS',
    quote: 'HIT ME ANYWHERE. ALL YOU\'LL BREAK IS YOURSELF.',
  },
  lines: { win: 'SHATTERPROOF. ALMOST.', lose: 'I... FELL... TO PIECES...' },

  build: 'lean',
  palette: 'glass',
  spriteLayers: 'glass',

  stats: stats({ health: 300, damageMult: 2.05, stunFrames: 40, hitstun: 10 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 12 } }),

  moves: {
    jab: dull(mv('jab', W, { sfx: { tell: 'glass' } })),
    jabR: dull(mv('jabR', W, { sfx: { tell: 'glass' } })),
    hook: dull(mv('hook', W, { sfx: { tell: 'glass' } })),
    hookL: dull(mv('hookL', W, { sfx: { tell: 'glass' } })),
    body: dull(mv('body', W, { sfx: { tell: 'glass' } })),
    bodyR: dull(mv('bodyR', W, { sfx: { tell: 'glass' } })),
    upper: dull(mv('upper', W, { name: 'CRYSTAL UPPERCUT', sfx: { tell: 'glass' } })),
    shardSweep: dull(mv('sweep', W, { name: 'SHARD SWEEP', sfx: { tell: 'glass', swing: 'swingHeavy' } })),
    shatterStrike: dull(superMove('SHATTER STRIKE', { sfx: { tell: 'glass', swing: 'shatter' }, kdWindow: [10, 13] })),
  },

  patterns: [
    { id: 'facets', weight: 3, when: { rounds: [1] }, steps: steps('i26 jab i14 hook i18 bodyR i32 shardSweep i34 jabR i14 hookL i40') },
    { id: 'refract', weight: 3, steps: steps('i22 hookL i14 jab i16 body i30 upper i24 shardSweep i32 jabR i14 hook i40') },
    { id: 'cutGlass', weight: 2, when: { rounds: [2, 3] }, steps: steps('i18 jab i10 jabR i12 hook i22 upper i16 bodyR i14 hookL i28 shardSweep i36') },
  ],

  super: { hit: 'Lbody', move: 'shatterStrike', golden: 'windup', window: [10, 13], taunt: 44, shout: 'SHATTER STRIKE!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'stressFracture', type: 'stunTrigger', name: 'A STRESS FRACTURE',
      trigger: { state: 'windup', move: 'hook', side: 'L', height: 'low', frames: [3, 6], clean: 30 },
      effect: { stun: 88, hits: 5, say: 'HE CRACKS!', sfx: 'glass' },
      hint: { kind: 'audio', text: 'THE CRYSTAL PINGS WHEN HE THROWS THE RIGHT HOOK: A HAIRLINE CRACK RUNS ACROSS HIS BODY.' },
      scout: 'A LEFT-HAND BODY SHOT ON THE FIRST FRAMES OF HIS RIGHT HOOK STUNS HIM FOR 5 HITS WITHOUT SHATTERING HIM.',
    },
    {
      id: 'reflectedSweep', type: 'quirk', name: 'THE SWEEP CUTS HIM',
      trigger: { on: 'resolved', move: 'shardSweep', result: 'ducked' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 5 }, say: 'HE CUTS HIMSELF!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'HIS SHARD SWEEP LEAVES A SLIVER IN HIS OWN LEG.', hidden: true },
      scout: 'DUCK HIS SHARD SWEEP: HE CUTS HIMSELF AND IS OPEN FOR 5 HITS, WITHOUT SHATTERING.',
    },
  ],
  antiStrategies: [
    {
      id: 'sharpEdge', type: 'jabSpam', name: 'A SHARP EDGE', streak: 4, counter: ['shardSweep'], say: 'SHARP EDGE!',
      scout: 'KEEP JABBING AND HE PARRIES THE 4TH PUNCH ON A SHARP EDGE AND ANSWERS WITH THE SHARD SWEEP: DUCK IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'spreadingCracks', name: 'THE CRACKS SPREAD', when: { left: 60 }, say: 'THE CRACKS SPREAD!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 12 }, { move: 'hookL' }, { idle: 14 }, { move: 'upper' }],
    },
  ],
  special: [{ type: 'glass', acc: 26, span: 90, frames: 46, reform: { open: 56, star: 26, hits: 4 } }],
  titleDefense: null,
  gallery: 'A MAN OF CRYSTAL. HE SHATTERS WHEN HE\'S HIT HARD, AND HIS RE-FORMING IS THE ONLY STAR WINDOW HE HAS.',
  medals: { signature: { text: 'SHATTER HIM THREE TIMES.', check: 'cueCount', cue: '!shatter', n: 3 } },
  music: 'glassWalkup',
};
