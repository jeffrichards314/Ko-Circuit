// #79 Verity — Pantheon VII, the Summit. A judge, and blindfolded, because she can hear every one of
// your punches. She bows to you now and then, hands folded, and it looks like an opening. IT'S A TRAP:
// hitting her while she bows is a FOUL. Three fouls and you're disqualified: you lose. (FOULS under the
// clock.) Her real openings are what she leaves after her own punches.
// If you turtle, she calls a SIDEBAR: a body blow that breaks your guard.
// Her super is the FINAL JUDGMENT: a gavel the size of the ring. A knockdown: slip it. Counter it on the
// glint and it's her own verdict that falls on her.
// Pantheon VII difficulty: 5-frame tells, shuffled and adaptive, hearts 12.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;
const bow = { open: 44, anim: 'bow', id: 'bow', trap: true, comboLimit: 0 };

export default {
  id: 'verity',
  name: 'VERITY',
  short: 'VERITY',
  nickname: 'THE JUDGE',
  circuit: 'p7',
  rank: 2,
  isChampion: false,
  card: {
    age: 999,
    weight: 145,
    record: '0 APPEALS',
    hometown: 'THE HIGH COURT',
    quote: 'THE COURT WILL BE PATIENT. THE COURT WILL DISQUALIFY YOU ANYWAY.',
  },
  lines: { win: 'THE COURT FINDS AGAINST YOU.', lose: 'THE COURT... ADJOURNS...' },

  build: 'medium',
  palette: 'verity',
  spriteLayers: 'verity',

  stats: stats({ health: 330, damageMult: 2.1, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 }, bow: ['bow'] }),

  moves: {
    jab: mv('jab', W, { name: 'OBJECTION', sfx: { tell: 'clang' } }),
    jabR: mv('jabR', W, { name: 'SUSTAINED', sfx: { tell: 'clang' } }),
    hook: mv('hook', W, { name: 'VERDICT', sfx: { tell: 'clang' } }),
    hookL: mv('hookL', W, { name: 'VERDICT (L)', sfx: { tell: 'clang' } }),
    bodyR: mv('bodyR', W, { name: 'OVERRULED', sfx: { tell: 'clang' } }),
    gavel: mv('haymaker', W, { name: 'GAVEL', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'clang', swing: 'crash' } }),
    // the turtle's answer: a body blow that breaks the guard
    sidebar: mv('body', W, { name: 'SIDEBAR', defenseCost: { block: { guardBreak: 80, say: 'CONTEMPT OF COURT!' } }, sfx: { tell: 'clang' } }),
    finalJudgment: superMove('FINAL JUDGMENT', { sfx: { tell: 'clang', swing: 'crash' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'inSession', weight: 3, when: { rounds: [1] }, steps: [...steps('i28 jab i16 hook i20 bodyR i34 gavel'), bow, ...steps('i26 jabR i16 hookL i40')] },
    { id: 'recess', weight: 3, steps: [...steps('i24 hookL i14 jab i18 bodyR i32 hook'), bow, ...steps('i26 gavel i34 jabR i40')] },
    { id: 'contempt', weight: 2, when: { rounds: [2, 3] }, steps: [...steps('i20 jabR i12 hook i14 bodyR i26 hookL i14 jab'), bow, ...steps('i24 gavel i16 hook i36')] },
  ],

  super: { hit: 'head', move: 'finalJudgment', golden: 'windup', window: [10, 13], taunt: 48, shout: 'FINAL JUDGMENT!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'overruled', type: 'stunTrigger', name: 'OVERRULED',
      trigger: { state: 'windup', move: 'gavel', counter: true, frames: [11, 15] },
      effect: { stun: 100, hits: 6, star: true, say: 'OVERRULED!', sfx: 'clang' },
      hint: { kind: 'audio', text: 'THE GAVEL RINGS ONCE AT THE TOP OF THE SWING, LIKE A COURT COMING TO ORDER.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF HER GAVEL SWING OVERRULES HER: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'contemptOfCourt', type: 'quirk', name: 'SHE\'S IN CONTEMPT',
      trigger: { on: 'resolved', move: 'sidebar', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'CONTEMPT OF COURT!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'A JUDGE WHO MISSES WITH A SIDEBAR HAS BROKEN HER OWN RULES.', hidden: true },
      scout: 'SLIP HER SIDEBAR (THE GUARD-BREAKING BODY BLOW): SHE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'sidebar', type: 'turtling', name: 'CALLS A SIDEBAR', response: 'move', move: 'sidebar', span: 480, share: 0.45, cooldown: 480, say: 'A SIDEBAR!',
      scout: 'BLOCK TOO MUCH AND SHE CALLS A SIDEBAR: A BODY BLOW THAT BREAKS YOUR GUARD. SLIP IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'adjourned', name: 'COURT IS ADJOURNED', when: { left: 60 }, say: 'COURT IS ADJOURNED!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 14 }, { move: 'hook' }, { idle: 16 }, { move: 'gavel' }],
    },
  ],
  special: [{ type: 'judge', step: 'bow', fouls: 3 }],
  titleDefense: null,
  gallery: 'A BLINDFOLDED JUDGE. HITTING HER WHILE SHE BOWS IS A FOUL: THREE FOULS AND YOU\'RE DISQUALIFIED.',
  medals: { signature: { text: 'WIN WITHOUT A SINGLE FOUL.', check: 'noCue', cue: '!foul' } },
  music: 'verityWalkup',
};
