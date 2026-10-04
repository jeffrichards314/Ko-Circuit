// #118 THE TIME SHARD — Void III. A clockmaker the Void emptied out. Time is not steady around him: in the middle of a pattern it turns, and
// everything after that (his gaps, his recoveries, the tells of the slow ones) runs FAST or SLOW until it turns again (every 3-6 punches). His
// pace shows under the clock (<< SLOW, FAST >>). His tells never go under 3 frames, even when time races. His super is STOPPED CLOCK.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
const M = {
  jab: vm('jab', { name: 'TICK', avoidBy: ALL4 }),
  cross: vm('jabR', { name: 'TOCK', avoidBy: ALL4 }),
  hook: vm('hook', { name: 'MINUTE HAND' }),
  hookL: vm('hookL', { name: 'MINUTE HAND (L)' }),
  body: vm('body', { name: 'PENDULUM' }),
  bodyR: vm('bodyR', { name: 'PENDULUM (R)' }),
  upper: only(D2, vm('upper', { name: 'CHIME' })),
  haymaker: only(D2, vm('haymaker', { name: 'MIDNIGHT' })),
  stopped: only(D2, superMove('STOPPED CLOCK', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'bellToll', swing: 'crash' } })),
};
const P = (id, seed, moves, gaps) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps, rest: { every: 8, steps: [{ idle: 26 }, { move: 'haymaker' }, { idle: 40 }] } }) });

export default {
  id: 'timeShard',
  name: 'THE TIME SHARD',
  short: 'TIME SHARD',
  nickname: 'THE LATE HOUR',
  circuit: 'v3',
  rank: 2,
  isChampion: false,
  card: { age: 0, weight: 150, record: '0-0 0KO', hometown: 'BETWEEN TICKS', quote: 'DO YOU HAVE THE TIME? I HAVE ALL OF IT. I HAVE NONE.' },
  lines: { win: 'YOU RAN OUT OF TIME.', lose: 'THE HOUR... IS... PAST...' },

  build: 'lean',
  palette: 'timeShard',
  spriteLayers: 'timeShard',

  stats: stats({ health: 410, damageMult: 2.3, stunResistance: 5, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 30 } }),
  guardCounter: 'haymaker',

  moves: M,
  patterns: [
    P('hour1', 1181, [['jab', 3], ['cross', 3], ['hook', 2], ['hookL', 2], ['body', 2], ['bodyR', 2], ['upper', 2]], [12, 26]),
    P('hour2', 2189, [['hook', 3], ['hookL', 3], ['upper', 2], ['jab', 2], ['cross', 2], ['body', 2], ['bodyR', 2]], [14, 28]),
    P('hour3', 3197, [['body', 3], ['bodyR', 3], ['jab', 3], ['cross', 3], ['hook', 1], ['hookL', 1], ['upper', 2]], [12, 24]),
  ],

  super: { hit: 'head', move: 'stopped', golden: 'windup', window: [12, 15], taunt: 48, shout: 'STOPPED CLOCK!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: ['slowTime'],

  exploits: [
    {
      id: 'timeTurns', type: 'stunTrigger', name: 'TIME TURNS',
      trigger: { state: ['idle', 'recovery', 'block'], since: { event: 'timeShift', frames: [0, 26] } },
      effect: { stun: 96, hits: 7, star: true, say: 'TIME TURNS!', sfx: 'glitch' },
      hint: { kind: 'audio', text: 'A RISING FLOURISH WHEN TIME SPEEDS UP, A LOW GROAN WHEN IT SLOWS. HE TAKES A BREATH TO CATCH UP.' },
      scout: 'HIT HIM IN THE FIRST HALF-SECOND AFTER TIME SPEEDS UP OR SLOWS DOWN (THE PACE CHANGES UNDER THE CLOCK): STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'slowHour', type: 'quirk', name: 'THE SLOW HOUR',
      trigger: { on: 'resolved', move: ['jab', 'cross', 'hook', 'hookL', 'body', 'bodyR', 'upper', 'haymaker'], result: ['dodged', 'ducked', 'blocked'], flag: 'slowTime' },
      effect: { open: { frames: 110, anim: 'stunned', comboLimit: 8, star: [0, 44] }, say: 'THE HOUR DRAGS!', sfx: 'groan' },
      hint: { kind: 'visual', text: '<< SLOW UNDER THE CLOCK: EVERYTHING HE DOES DRAGS. A PUNCH THAT MISSES IN SLOW TIME LEAVES HIM STANDING FOR A LONG TIME.' },
      scout: 'WHEN TIME SLOWS DOWN (<< SLOW UNDER THE CLOCK), DEFEND THE PUNCH THAT TURNS IT: HE HANGS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'midnightStrikes', type: 'stunTrigger', name: 'MIDNIGHT STRIKES',
      trigger: { state: 'windup', move: 'haymaker', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 122, hits: 8, star: true, say: 'MIDNIGHT!', sfx: 'bellToll' },
      hint: { kind: 'visual', text: 'AT THE TOP OF MIDNIGHT BOTH HIS HANDS POINT STRAIGHT UP.', hidden: true },
      scout: 'A COUNTER ON THE LATE FRAMES OF MIDNIGHT (THE HAYMAKER, BOTH HANDS UP): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'borrowedTime', type: 'passivity', name: 'BORROWED TIME', response: 'buff', frames: 240, gain: 1 / 520, decay: 1 / 220, dmg: 0.3, rec: 0.15, meter: 'BORROWED', say: 'HE BORROWS TIME!',
      scout: 'STAND STILL AND HE BORROWS TIME: HIS PUNCHES HIT HARDER AND RECOVER FASTER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
  ],
  scriptedMoments: [
    { id: 'lastMinute', name: 'THE LAST MINUTE', when: { left: 60 }, say: 'THE LAST MINUTE!', steps: [{ idle: 16 }, { move: 'jab' }, { idle: 14 }, { move: 'cross' }, { idle: 14 }, { move: 'hook' }, { idle: 14 }, { move: 'hookL' }, { idle: 30 }, { move: 'haymaker' }, { idle: 40 }] },
  ],
  special: [{ type: 'timewarp', every: [3, 6], paces: [0.6, 1, 1.5], minRecovery: 14 }],
  titleDefense: null,
  gallery: 'A CLOCKMAKER THE VOID EMPTIED OUT. IN THE MIDDLE OF A PATTERN TIME SPEEDS UP OR SLOWS DOWN AROUND HIM.',
  medals: { signature: { text: 'HIT HIM WHEN TIME TURNS.', check: 'cueCount', cue: '!exploit:timeTurns', n: 1 } },
  music: 'timeShardWalkup',
};
