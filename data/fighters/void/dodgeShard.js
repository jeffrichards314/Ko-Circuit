// #108 THE DODGE SHARD — Void I, The Fundamentals. A runner the Void emptied out. EVERY attack of his can only be dodged: a block does
// nothing against him and neither does a duck (the tell pose shows the side: a hook cocked on the right is slipped left, and the other way).
// They come from both sides in patterns of 32 moves, on 3-frame tells, in chains too tight to punish: you are meant to string slips together.
// The slips also count: his FLOW meter under the clock fills with every slip in a row (a hit empties it), and at eight he is winded.
// The haymaker ending each run of eight is the opening: slip it (or counter its long tell) and he is yours. His super is BREAKNECK.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const D2 = ['dodgeL', 'dodgeR'];
const run = { recoveryFrames: 14 };
const M = {
  jab: only(D2, vm('jab', { name: 'RUNNING JAB', ...run })),
  cross: only(D2, vm('jabR', { name: 'RUNNING CROSS', ...run })),
  hook: only(['dodgeL'], vm('hook', { name: 'SWERVE HOOK', ...run })),
  hookL: only(['dodgeR'], vm('hookL', { name: 'SWERVE HOOK (L)', ...run })),
  body: only(['dodgeL'], vm('body', { name: 'LOW SWERVE', ...run })),
  bodyR: only(['dodgeR'], vm('bodyR', { name: 'LOW SWERVE (R)', ...run })),
  upper: only(D2, vm('upper', { name: 'LEAP UPPERCUT', recoveryFrames: 18 })),
  haymaker: only(D2, vm('haymaker', { name: 'FULL STRIDE' })),
  breakneck: only(D2, superMove('BREAKNECK', { windupFrames: 22, counterWindow: [5, 19], starWindow: [5, 9], sfx: { tell: 'whoosh', swing: 'crash' } })),
};
const ALL = ['jab', 'cross', 'hook', 'hookL', 'body', 'bodyR', 'upper'];
const open = { idle: 26 }, tail = [{ move: 'haymaker' }, { idle: 46 }];
const P = (id, seed, weights, gaps) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves: weights, count: 32, gaps, rest: { every: 8, steps: [open, ...tail] } }) });

export default {
  id: 'dodgeShard',
  name: 'THE DODGE SHARD',
  short: 'DODGE SHARD',
  nickname: 'THE FIRST FALL',
  circuit: 'v1',
  rank: 4,
  isChampion: false,
  card: { age: 0, weight: 140, record: '0-0 0KO', hometown: 'THE FIRST STEP', quote: 'DON\'T STAND THERE. NOTHING I THROW CAN BE BLOCKED. MOVE.' },
  lines: { win: 'STILL. YOU STOOD STILL.', lose: 'I REMEMBER... I WAS... FAST...' },

  build: 'lean',
  palette: 'dodgeShard',
  spriteLayers: 'dodgeShard',

  stats: stats({ health: 380, damageMult: 2.1, stunResistance: 4, starLossChance: 0.6, stunFrames: 50, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 12 } }),
  guardCounter: 'haymaker',

  moves: M,
  patterns: [
    P('stride1', 1081, [['jab', 3], ['cross', 3], ['hook', 3], ['hookL', 3], ['body', 2], ['bodyR', 2], ['upper', 2]], [9, 18]),
    P('stride2', 2093, [['hook', 4], ['hookL', 4], ['jab', 2], ['cross', 2], ['upper', 2], ['body', 1], ['bodyR', 1]], [10, 20]),
    P('stride3', 3307, [['body', 3], ['bodyR', 3], ['hook', 2], ['hookL', 2], ['jab', 3], ['cross', 3], ['upper', 1]], [8, 16]),
  ],

  super: { hit: 'body', move: 'breakneck', golden: 'windup', window: [11, 14], taunt: 48, shout: 'BREAKNECK!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: ['winded'],

  exploits: [
    {
      id: 'winded', type: 'quirk', name: 'WINDED',
      trigger: { on: 'resolved', move: ALL.concat(['haymaker']), result: 'dodged', flag: 'winded' },
      effect: { open: { frames: 104, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'HE\'S WINDED!', sfx: 'pant' },
      hint: { kind: 'visual', text: 'THE FLOW METER UNDER THE CLOCK FILLS WITH EVERY SLIP IN A ROW. WHEN IT REACHES EIGHT HE GASPS.' },
      scout: 'SLIP EIGHT OF HIS PUNCHES IN A ROW WITHOUT BEING HIT (THE FLOW METER): HE IS WINDED AND OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'swingAndMiss', type: 'quirk', name: 'A SWING AND A MISS',
      trigger: { on: 'resolved', move: 'haymaker', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'ALL THAT STRIDE, FOR NOTHING!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE FULL STRIDE TAKES ALL OF HIM WITH IT. WHEN IT MISSES THERE IS NOTHING BEHIND IT.' },
      scout: 'SLIP THE FULL STRIDE (THE HAYMAKER THAT ENDS EACH RUN OF EIGHT): HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'caughtMidStride', type: 'stunTrigger', name: 'CAUGHT MID-STRIDE',
      trigger: { state: 'windup', move: 'haymaker', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 118, hits: 8, star: true, say: 'CAUGHT MID-STRIDE!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE FULL STRIDE HIS WHOLE BODY LEANS BACK FOR A MOMENT.', hidden: true },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE FULL STRIDE (WHILE HE LEANS BACK): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'cutsYouOff', type: 'dodgeBias', name: 'CUTS OFF YOUR SIDE', moves: ['jab', 'cross', 'upper'], min: 5, share: 0.75, say: 'HE CUTS YOU OFF!',
      scout: 'SLIP THE SAME WAY OVER AND OVER AND HIS JABS AND UPPERCUTS COME FROM THAT SIDE: THE TELL POSE SHOWS WHICH GLOVE HE COCKS.',
    },
  ],
  scriptedMoments: [
    { id: 'theLongRun', name: 'THE LONG RUN', when: { left: 75 }, say: 'THE LONG RUN!', steps: [{ idle: 18 }, { move: 'hook' }, { idle: 10 }, { move: 'hookL' }, { idle: 10 }, { move: 'hook' }, { idle: 10 }, { move: 'bodyR' }, { idle: 10 }, { move: 'jab' }, { idle: 10 }, { move: 'hookL' }, { idle: 30 }] },
  ],
  special: [{ type: 'dodgeflow', n: 8 }],
  titleDefense: null,
  gallery: 'A RUNNER THE VOID EMPTIED OUT. NOTHING HE THROWS CAN BE BLOCKED OR DUCKED: ONLY SLIPPED, BOTH WAYS.',
  medals: { signature: { text: 'WIND HIM BY SLIPPING EIGHT IN A ROW.', check: 'cueCount', cue: '!winded', n: 1 } },
  music: 'dodgeShardWalkup',
};
