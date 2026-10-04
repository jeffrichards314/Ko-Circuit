// #112 THE SIGHT SHARD — Void II, The Senses. A watcher the Void emptied out. He fights in COMPLETE SILENCE: no music, no sound effects, not even
// the bell, so every tell is one you can only see. Every windup lights a halo round his head and a border round the screen in the colour of the
// defense: WHITE slip (the pose shows the side), RED block, YELLOW duck. He blinks (his one eye shuts for a moment every few seconds in his stance):
// a punch in that moment stuns him. His super is the GAZE.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const M = {
  jab: vm('jab', { name: 'GLANCE', avoidBy: ALL4 }),
  cross: vm('jabR', { name: 'STARE', avoidBy: ALL4 }),
  hook: vm('hook', { name: 'SIDELONG' }),
  hookL: vm('hookL', { name: 'SIDELONG (L)' }),
  body: vm('body', { name: 'BELOW THE LINE' }),
  bodyR: vm('bodyR', { name: 'BELOW THE LINE (R)' }),
  upper: vm('upper', { name: 'RAISED BROW' }),
  sweep: only(['duck'], vm('sweep', { name: 'LOWERED LID' })),
  gaze: superMove('THE GAZE', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: {}, }),
};
for (const m of Object.values(M)) m.sfx = {}; // (silence: he makes no sound)
const P = (id, seed, moves) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps: [10, 22], rest: { every: 8, steps: [{ idle: 24 }, { open: 56, anim: 'stunned', star: [2, 18], comboLimit: 4, id: 'lidsDown' }] }, after: (a) => (a === 'sweep' ? 8 : 0) }) });

export default {
  id: 'sightShard',
  name: 'THE SIGHT SHARD',
  short: 'SIGHT SHARD',
  nickname: 'THE WATCHER',
  circuit: 'v2',
  rank: 4,
  isChampion: false,
  card: { age: 0, weight: 172, record: '0-0 0KO', hometown: 'THE LAST THING YOU SEE', quote: '...' },
  lines: { win: '...', lose: '...' },

  build: 'medium',
  palette: 'sightShard',
  spriteLayers: 'sightShard',
  silent: true,

  stats: stats({ health: 390, damageMult: 2.2, stunResistance: 5, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),
  guardCounter: 'upper',

  moves: M,
  patterns: [
    P('watch1', 1141, [['jab', 3], ['cross', 3], ['hook', 2], ['hookL', 2], ['body', 2], ['bodyR', 2], ['upper', 2], ['sweep', 1]]),
    P('watch2', 2147, [['hook', 3], ['hookL', 3], ['upper', 3], ['sweep', 2], ['jab', 2], ['cross', 2], ['body', 1], ['bodyR', 1]]),
    P('watch3', 3163, [['body', 3], ['bodyR', 3], ['jab', 3], ['cross', 3], ['sweep', 2], ['hook', 1], ['hookL', 1], ['upper', 1]]),
  ],

  super: { move: 'gaze', golden: 'windup', window: [9, 12], hit: 'head', from: 'eyeOfTheStorm', taunt: 50, shout: 'THE GAZE!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'aBlink', type: 'stunTrigger', name: 'A BLINK',
      trigger: { state: 'idle', since: { event: 'blink', frames: [0, 14] } },
      effect: { stun: 92, hits: 6, star: true, say: 'HE BLINKED!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'EVERY FEW SECONDS HIS ONE EYE SHUTS FOR A MOMENT IN HIS STANCE.' },
      scout: 'HIT HIM WHILE HIS EYE IS SHUT (HE BLINKS EVERY FEW SECONDS IN HIS STANCE): STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'lidDrops', type: 'quirk', name: 'THE LID DROPS',
      trigger: { on: 'resolved', move: 'sweep', result: 'ducked' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'THE LID DROPS!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE YELLOW HALO IS THE LOWERED LID: WHEN IT MISSES, THE EYE STAYS SHUT.' },
      scout: 'DUCK THE LOWERED LID (THE SWEEP WITH THE YELLOW HALO): HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'watchesYourHands', type: 'comboRepeat', name: 'WATCHES YOUR HANDS', gap: 45, delay: 14, counter: ['upper'], say: 'HE SAW THAT!',
      scout: 'THROW THE SAME TWO-PUNCH COMBO TWICE IN A ROW AND HE CATCHES THE SECOND AND ANSWERS WITH THE RAISED BROW (AN UPPERCUT).',
    },
  ],
  scriptedMoments: [
    { id: 'eyesWideOpen', name: 'EYES WIDE OPEN', when: { left: 70 }, say: 'EYES WIDE OPEN!', steps: [{ idle: 16 }, { move: 'hook' }, { idle: 14 }, { move: 'hookL' }, { idle: 14 }, { move: 'upper' }, { idle: 30 }, { move: 'sweep' }, { idle: 36 }] },
  ],
  special: [{ type: 'sightEye', first: 420, every: 520, frames: 16 }],
  titleDefense: null,
  gallery: 'A WATCHER THE VOID EMPTIED OUT. HE FIGHTS IN COMPLETE SILENCE: THE ONLY TELLS ARE THE COLOURS ROUND HIS HEAD. HE BLINKS.',
  medals: { signature: { text: 'HIT HIM WHILE HE BLINKS.', check: 'cueCount', cue: '!exploit:aBlink', n: 1 } },
  music: 'sightShardWalkup',
};
