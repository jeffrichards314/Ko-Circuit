// #114 THE RHYTHM SHARD — Void II. A drummer the Void emptied out. Every punch lands ON A BEAT: a click runs through the fight (a stronger one
// on each bar's first beat), and he waits until his punch can land on the next. The tempo keeps changing (84, 112, 148 or 176 bpm, every four
// bars, never the same twice running) and the music changes with it. Slip on the DOWNBEAT and he loses the count; land a punch just after a
// tempo change and he is off it. He holds the beat on anyone who slips early (Holds the Beat). His super is the CRESCENDO.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const rec = { recoveryFrames: 16 };
const M = {
  jab: vm('jab', { name: 'TAP', avoidBy: ALL4, ...rec }),
  cross: vm('jabR', { name: 'TAP-TAP', avoidBy: ALL4, ...rec }),
  hook: vm('hook', { name: 'RIM SHOT', ...rec }),
  hookL: vm('hookL', { name: 'RIM SHOT (L)', ...rec }),
  body: vm('body', { name: 'KICK', ...rec }),
  bodyR: vm('bodyR', { name: 'KICK (R)', ...rec }),
  upper: vm('upper', { name: 'CYMBAL', recoveryFrames: 22 }),
  crash: vm('haymaker', { name: 'CRASH', recoveryFrames: 40 }),
  crescendo: superMove('CRESCENDO', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'drumroll', swing: 'crash' } }),
};
const P = (id, seed, moves) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps: [4, 12], rest: { every: 8, steps: [{ idle: 20 }, { move: 'crash' }, { idle: 30 }] } }) });

export default {
  id: 'rhythmShard',
  name: 'THE RHYTHM SHARD',
  short: 'RHYTHM SHARD',
  nickname: 'THE DOWNBEAT',
  circuit: 'v2',
  rank: 2,
  isChampion: false,
  card: { age: 0, weight: 160, record: '0-0 0KO', hometown: 'ON THE ONE', quote: 'ONE, TWO, THREE, YOU. KEEP UP, OR DON\'T.' },
  lines: { win: 'YOU WERE OFF THE BEAT.', lose: 'I LOST... THE COUNT...' },

  build: 'medium',
  palette: 'rhythmShard',
  spriteLayers: 'rhythmShard',

  stats: stats({ health: 400, damageMult: 2.2, stunResistance: 5, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 14 } }),
  guardCounter: 'crash',

  moves: M,
  patterns: [
    P('bar1', 1171, [['jab', 3], ['cross', 3], ['hook', 3], ['hookL', 3], ['body', 2], ['bodyR', 2], ['upper', 1]]),
    P('bar2', 2179, [['hook', 3], ['hookL', 3], ['body', 3], ['bodyR', 3], ['jab', 2], ['cross', 2], ['upper', 2]]),
    P('bar3', 3191, [['jab', 4], ['cross', 4], ['upper', 2], ['hook', 2], ['hookL', 2], ['body', 1], ['bodyR', 1]]),
  ],

  super: { hit: 'head', move: 'crescendo', golden: 'windup', window: [12, 15], taunt: 48, shout: 'CRESCENDO!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: ['downbeat'],

  exploits: [
    {
      id: 'losesTheCount', type: 'quirk', name: 'LOSES THE COUNT',
      trigger: { on: 'resolved', move: ['jab', 'cross', 'hook', 'hookL', 'body', 'bodyR', 'upper'], result: ['dodged', 'ducked', 'blocked'], flag: 'downbeat' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'HE LOST THE COUNT!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE BAR\'S FIRST CLICK IS THE LOUD ONE. A PUNCH THAT LANDS ON IT AND MISSES HAS NOWHERE LEFT TO GO.' },
      scout: 'DEFEND A PUNCH THAT LANDS ON THE FIRST (LOUD) BEAT OF THE BAR: HE LOSES THE COUNT AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'offTheTempo', type: 'stunTrigger', name: 'OFF THE TEMPO',
      trigger: { state: 'idle', since: { event: 'tempoChange', frames: [0, 36] } },
      effect: { stun: 96, hits: 7, star: true, say: 'HE DROPPED THE BEAT!', sfx: 'glitch' },
      hint: { kind: 'audio', text: 'EVERY TEMPO CHANGE RINGS A FALLING-THEN-RISING FLOURISH. HE TAKES HALF A SECOND TO CATCH IT.' },
      scout: 'HIT HIM IN HIS STANCE IN THE HALF-SECOND AFTER A TEMPO CHANGE (THE FLOURISH): STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'crashLanded', type: 'stunTrigger', name: 'THE CRASH CYMBAL',
      trigger: { state: 'windup', move: 'crash', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 116, hits: 8, star: true, say: 'THE CYMBAL RINGS OUT!', sfx: 'cymbal' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE CRASH BOTH ARMS ARE RAISED OVER HIS HEAD: THE BIGGEST BEAT IN THE BAR.', hidden: true },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE CRASH (BOTH ARMS RAISED): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'holdsTheBeat', type: 'earlyDodge', name: 'HOLDS THE BEAT', response: 'hold', moves: ['hook', 'hookL', 'upper'], lead: 12, say: 'HELD THE BEAT!',
      scout: 'SLIP EARLY (AT LEAST 12 FRAMES BEFORE HIS HOOK OR UPPERCUT LANDS) AND HE HOLDS THE BEAT: THE PUNCH LANDS AS YOUR SLIP RUNS OUT. WAIT FOR THE CLICK.',
    },
  ],
  scriptedMoments: [
    { id: 'doubleTime', name: 'DOUBLE TIME', when: { left: 70 }, say: 'DOUBLE TIME!', steps: [{ idle: 16 }, { move: 'jab' }, { idle: 4 }, { move: 'cross' }, { idle: 4 }, { move: 'jab' }, { idle: 4 }, { move: 'cross' }, { idle: 30 }] },
  ],
  special: [{ type: 'beatgrid', tempos: [84, 112, 148, 176], start: 1, bars: 4, songs: { 84: 'rhythmSlow', 112: 'rhythmMid', 148: 'rhythmFast', 176: 'rhythmRush' } }],
  titleDefense: null,
  gallery: 'A DRUMMER THE VOID EMPTIED OUT. EVERY PUNCH LANDS ON THE BEAT, AND THE TEMPO KEEPS CHANGING UNDER YOUR FEET.',
  medals: { signature: { text: 'MAKE HIM LOSE THE COUNT.', check: 'cueCount', cue: '!exploit:losesTheCount', n: 1 } },
  music: 'rhythmShardWalkup',
};
