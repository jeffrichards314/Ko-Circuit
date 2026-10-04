// #113 THE SOUND SHARD — Void II. A listener the Void emptied out, and almost nothing of him is left to see: a ghost of him, a pixel in sixteen,
// drifts in the ring. He shows fully only when you hit him. His tell is a SOUND, and every defense has its own: a rising blip (slip LEFT), a falling
// blip (slip RIGHT), two bright notes (slip either way), a low wub (DUCK), a double click (BLOCK). Listen. He is silent when he is about to be hit.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const snd = (n) => ({ sfx: { tell: n, swing: 'whiff' } });
const M = {
  jab: vm('jab', { name: 'A WHISPER', avoidBy: ALL4, ...snd('soundAny') }),
  cross: vm('jabR', { name: 'A HUM', avoidBy: ALL4, ...snd('soundAny') }),
  hook: vm('hook', { name: 'A RISING TONE', ...snd('soundL') }),
  hookL: vm('hookL', { name: 'A FALLING TONE', ...snd('soundR') }),
  body: only(['block'], vm('body', { name: 'A CLICK', ...snd('soundBlock') })),
  bodyR: only(['block'], vm('bodyR', { name: 'A CLICK (R)', ...snd('soundBlock') })),
  upper: only(['dodgeL', 'dodgeR'], vm('upper', { name: 'A CHIME', ...snd('soundAny') })),
  sweep: only(['duck'], vm('sweep', { name: 'A THROB', ...snd('soundDuck') })),
  chord: superMove('THE CHORD', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'soundAny', swing: 'crash' } }),
};
const P = (id, seed, moves) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps: [12, 24], rest: { every: 8, steps: [{ idle: 30 }, { move: 'upper' }, { idle: 44 }] }, after: (a) => (['sweep', 'body', 'bodyR'].includes(a) ? 10 : 0) }) });

export default {
  id: 'soundShard',
  name: 'THE SOUND SHARD',
  short: 'SOUND SHARD',
  nickname: 'THE LISTENER',
  circuit: 'v2',
  rank: 3,
  isChampion: false,
  card: { age: 0, weight: 120, record: '0-0 0KO', hometown: 'THE HUSH BETWEEN NOTES', quote: 'CLOSE YOUR EYES. YOU WON\'T MISS ANYTHING.' },
  lines: { win: 'YOU NEVER HEARD ME.', lose: 'I HEARD... EVERYTHING... ONCE...' },

  build: 'lean',
  palette: 'soundShard',
  spriteLayers: 'soundShard',

  stats: stats({ health: 370, damageMult: 2.2, stunResistance: 4, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),
  guardCounter: 'upper',

  moves: M,
  patterns: [
    P('echo1', 1151, [['jab', 3], ['cross', 3], ['hook', 3], ['hookL', 3], ['body', 1], ['bodyR', 1], ['upper', 2], ['sweep', 1]]),
    P('echo2', 2161, [['hook', 3], ['hookL', 3], ['upper', 2], ['sweep', 2], ['jab', 2], ['cross', 2], ['body', 2], ['bodyR', 2]]),
    P('echo3', 3181, [['jab', 3], ['cross', 3], ['sweep', 2], ['upper', 2], ['hook', 2], ['hookL', 2], ['body', 1], ['bodyR', 1]]),
  ],

  super: { hit: 'body', move: 'chord', golden: 'windup', window: [12, 15], taunt: 48, shout: 'THE CHORD!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'aQuietMoment', type: 'bait', name: 'A QUIET MOMENT', limit: 2,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ open: 72, anim: 'stunned', id: 'listening', comboLimit: 5, star: [0, 26] }], say: 'HE HEARS HIMSELF!' },
      hint: { kind: 'quote', text: 'CLOSE YOUR EYES. YOU WON\'T MISS ANYTHING.', hidden: true },
      scout: 'STAND STILL FOR 5 SECONDS AND HE STOPS TO LISTEN FOR YOU: OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'wrongNote', type: 'quirk', name: 'A WRONG NOTE',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'A WRONG NOTE!', sfx: 'glitch' },
      hint: { kind: 'audio', text: 'THE CHIME IS THE ONLY BRIGHT NOTE IN HIS SCALE. WHEN IT MISSES, HE HEARS THE SILENCE AFTER IT.' },
      scout: 'SLIP THE CHIME (THE UPPERCUT WITH THE TWO BRIGHT NOTES): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'throbSilenced', type: 'quirk', name: 'THE THROB STOPS',
      trigger: { on: 'resolved', move: 'sweep', result: 'ducked' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'THE THROB STOPS!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE LOW WUB IS A SWEEP: WHEN YOU DUCK IT IT STOPS DEAD.', hidden: true },
      scout: 'DUCK HIS SWEEP (THE LOW WUB): HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'heardYourStars', type: 'starHoard', name: 'HEARS YOUR STARS', hold: 420, moves: ['jab', 'cross', 'hook', 'hookL', 'upper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT JAB, CROSS, HOOK OR UPPERCUT TAKES ONE, EVEN BLOCKED. YOU CAN HEAR THEM.',
    },
  ],
  scriptedMoments: [
    { id: 'aLoudPassage', name: 'A LOUD PASSAGE', when: { left: 70 }, say: 'A LOUD PASSAGE!', steps: [{ idle: 18 }, { move: 'hook' }, { idle: 14 }, { move: 'hookL' }, { idle: 14 }, { move: 'jab' }, { idle: 28 }, { move: 'upper' }, { idle: 40 }] },
  ],
  special: [{ type: 'unseen', reveal: 50, density: 0.07 }],
  titleDefense: null,
  gallery: 'A LISTENER THE VOID EMPTIED OUT. HE CAN BARELY BE SEEN: ONLY A SOUND, DIFFERENT FOR EVERY DEFENSE, GIVES HIM AWAY.',
  medals: { signature: { text: 'DUCK HIS SWEEP TWICE.', check: 'moveResult', move: 'sweep', result: 'ducked', n: 2 } },
  music: 'soundShardWalkup',
};
