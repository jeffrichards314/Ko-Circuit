// #115 THE MEMORY SHARD — Void II's champion. A scribe the Void emptied out, and he knows exactly one thing: ONE FIXED SEQUENCE OF 60 MOVES, the
// same in every round and every retry, with almost no tell (he does not even change his stance: his windup pose is his idle, and all you get is a
// tiny tick). A counter under the clock says which move he is on (MOVE 17/60). Learning it is the whole fight: the sequence has four phrases of
// fifteen that rhyme, an opening after each, and a long pause in the middle where he loses his place. His super is the RECITAL.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const dull = (m) => ({ ...m, sfx: { tell: 'memTick', swing: 'whiff' }, animation: { ...m.animation, windup: ['idle1'], recovery: ['idle1'] } });
const M = {
  jab: dull(vm('jab', { name: 'LINE', avoidBy: ALL4 })),
  hook: dull(vm('hook', { name: 'VERSE' })),
  hookL: dull(vm('hookL', { name: 'VERSE (L)' })),
  body: dull(vm('body', { name: 'STANZA' })),
  bodyR: dull(vm('bodyR', { name: 'STANZA (R)' })),
  upper: dull(only(['dodgeL', 'dodgeR'], vm('upper', { name: 'REFRAIN' }))),
  finale: only(['dodgeL', 'dodgeR'], vm('haymaker', { name: 'THE LAST LINE' })),
  recital: superMove('THE RECITAL', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'memTick', swing: 'crash' } }),
};
// The sequence: a phrase of 15 moves that rhymes with itself (built from a short motif, seeded), four times with small changes, an opening
// after each phrase and a long pause after the 30th move.
const R = longSteps({ seed: 6015, moves: [['jab', 3], ['hook', 3], ['hookL', 3], ['body', 2], ['bodyR', 2], ['upper', 2]], count: 15, gaps: [14, 22], first: 26, last: 0 }).filter((s) => !(s.idle === 0));
const phrase = (k) => R.map((s) => ({ ...s })).map((s, i) => {
  // each verse changes the motif a little: every third move swaps its hand
  if (s.move && k && (i / 2 | 0) % 3 === 2) { const sw = { hook: 'hookL', hookL: 'hook', body: 'bodyR', bodyR: 'body' }[s.move]; if (sw) return { move: sw }; }
  return s;
});
const open = (id) => [{ idle: 30 }, { open: 62, anim: 'stunned', star: [2, 20], comboLimit: 5, id }, { idle: 30 }];
const steps = [
  ...phrase(0), ...open('recite1'),
  ...phrase(1), { idle: 90 }, ...open('recite2'),
  ...phrase(2), ...open('recite3'),
  ...phrase(3).slice(0, -1), { idle: 24 }, { move: 'finale' }, { idle: 70 },
];
const nMoves = steps.filter((s) => s.move).length;

export default {
  id: 'memoryShard',
  name: 'THE MEMORY SHARD',
  short: 'MEMORY SHARD',
  nickname: 'THE SEQUENCE',
  circuit: 'v2',
  rank: 1,
  isChampion: true,
  card: { age: 0, weight: 300, record: '0-0 0KO', hometown: 'THE LAST PAGE', quote: 'I REMEMBER SIXTY THINGS. YOU WILL REMEMBER THEM TOO.' },
  lines: { win: 'YOU FORGOT THE FORTY-FIRST.', lose: 'SIXTY... AND YOU KNEW THEM ALL...' },

  build: 'heavy',
  palette: 'memoryShard',
  spriteLayers: 'memoryShard',

  stats: stats({ health: 460, damageMult: 2.2, stunResistance: 7, starLossChance: 0.65, stunFrames: 90, hitstun: 12, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),
  guardCounter: 'finale',

  moves: M,
  patterns: [{ id: 'sequence', weight: 1, fixed: true, steps }],
  moveCount: nMoves,

  super: { hit: 'body', move: 'recital', golden: 'windup', window: [12, 15], taunt: 52, shout: 'THE RECITAL!', times: [2, 2] }, // (two a round, a Void champion's share: a super pauses the sequence, it never skips a move)

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'lostHisPlace', type: 'stunTrigger', name: 'LOST HIS PLACE',
      trigger: { state: 'idle', test: 'midPause', frames: [0, 90] },
      effect: { stun: 104, hits: 7, star: true, cancel: 4, say: 'HE LOST HIS PLACE!', sfx: 'glitch' },
      hint: { kind: 'visual', text: 'AFTER THE 30TH MOVE THERE IS A LONG SILENCE: HALFWAY, HE STANDS THERE WITH HIS HANDS DOWN.' },
      scout: 'HIT HIM IN THE LONG PAUSE AFTER THE 30TH MOVE OF THE SEQUENCE: STUNNED FOR 7 HITS, THE FIRST A STAR, AND HE SKIPS FOUR STEPS.',
    },
    {
      id: 'theLastLine', type: 'stunTrigger', name: 'THE LAST LINE',
      trigger: { state: 'windup', move: 'finale', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 124, hits: 8, star: true, say: 'THE LAST LINE, CUT SHORT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE 60TH MOVE IS THE ONLY ONE WITH A REAL WINDUP: BOTH ARMS RAISED.' },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE 60TH MOVE (THE LAST LINE, BOTH ARMS RAISED): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'misreadFinale', type: 'quirk', name: 'A MISQUOTED END',
      trigger: { on: 'resolved', move: 'finale', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'HE MISQUOTED THE END!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'A LAST LINE THAT MISSES LEAVES HIM WITH NOTHING TO SAY.', hidden: true },
      scout: 'SLIP THE 60TH MOVE OF THE SEQUENCE (THE LAST LINE): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'itAllComesBack', type: 'passivity', name: 'IT ALL COMES BACK', response: 'buff', frames: 240, gain: 1 / 520, decay: 1 / 220, dmg: 0.3, rec: 0.1, meter: 'RECALL', say: 'IT ALL COMES BACK!',
      scout: 'STAND STILL AND HIS RECALL FILLS: HIS PUNCHES HIT HARDER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
    {
      id: 'startsAgain', type: 'getUpMash', name: 'FROM THE TOP', response: 'harder', punches: 4, mult: 1.3, say: 'FROM THE TOP!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 4 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'secondVerse', name: 'THE SECOND VERSE', when: { health: 0.66 }, say: 'THE SECOND VERSE!', steps: [{ idle: 40 }] },
    { id: 'lastVerse', name: 'THE LAST VERSE', when: { health: 0.33 }, say: 'THE LAST VERSE!', steps: [{ idle: 40 }] },
  ],
  special: [{ type: 'memcount', total: nMoves }],
  titleDefense: null,
  gallery: 'A SCRIBE THE VOID EMPTIED OUT. ONE SEQUENCE OF SIXTY MOVES, THE SAME EVERY TIME, WITH NEARLY NO TELL.',
  medals: { signature: { text: 'CATCH HIM LOSING HIS PLACE.', check: 'cueCount', cue: '!exploit:lostHisPlace', n: 1 } },
  music: 'memoryShardEntrance',
};
