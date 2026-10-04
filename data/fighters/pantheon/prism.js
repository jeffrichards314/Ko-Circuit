// #75 Prism — Pantheon VI's champion, the Mirror Sanctum. Light, split. For every punch he throws he
// becomes THREE: a red, a green and a blue copy, spread across the ring, and only one is real. The
// ring light tells you which: two lamps on the corner posts and a bar of light along the rope flash the
// REAL colour. Match the colour to the copy, and read THAT copy: the other two are mimes, throwing other
// punches at nothing.
// His super is the SPECTRUM: he splits into all three colours at once and the white light comes down.
// A knockdown: slip it. Counter it on the glint and the light goes out.
// Pantheon VI difficulty: 5-frame tells, shuffled and adaptive, hearts 12; a champion.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 5;

export default {
  id: 'prism',
  name: 'PRISM',
  short: 'PRISM',
  nickname: 'THE SPECTRUM',
  circuit: 'p6',
  rank: 0,
  isChampion: true,
  card: {
    age: 30,
    weight: 155,
    record: '83-0 66KO',
    hometown: 'THE HEART OF THE SANCTUM',
    quote: 'THREE OF ME, ONE OF THEM REAL. YOU\'VE ALWAYS BEEN BAD AT CHOOSING.',
  },
  lines: { win: 'YOU CHOSE WRONG.', lose: 'ALL... THREE... OF ME...' },

  build: 'medium',
  palette: 'prism',
  spriteLayers: 'prism',

  stats: stats({ health: 380, damageMult: 2.1, stunResistance: 6, starLossChance: 0.6, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),

  moves: {
    jab: mv('jab', W, { sfx: { tell: 'chime' } }),
    jabR: mv('jabR', W, { sfx: { tell: 'chime' } }),
    hook: mv('hook', W, { sfx: { tell: 'chime' } }),
    hookL: mv('hookL', W, { sfx: { tell: 'chime' } }),
    body: mv('body', W, { sfx: { tell: 'chime' } }),
    bodyR: mv('bodyR', W, { sfx: { tell: 'chime' } }),
    upper: mv('upper', W, { name: 'BEAM UPPERCUT', sfx: { tell: 'chime' } }),
    spectrum: superMove('SPECTRUM', { sfx: { tell: 'fanfare', swing: 'swingHeavy' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'lightAndShade', weight: 3, when: { rounds: [1] }, steps: steps('i28 jab i16 hook i18 bodyR i34 upper i28 jabR i16 hookL i40') },
    { id: 'refraction', weight: 3, steps: steps('i24 hookL i14 body i16 hook i32 upper i22 bodyR i14 jab i40') },
    { id: 'fullSpectrum', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 hook i12 hookL i14 upper i26 body i12 bodyR i14 jab i14 jabR i36') },
    { id: 'whiteout', weight: 1, script: 'whiteout', steps: steps('i14 jab i12 hookL i12 bodyR i22 upper i14 hook i36') },
  ],

  super: { hit: 'body', move: 'spectrum', golden: 'windup', window: [10, 13], taunt: 48, shout: 'SPECTRUM!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'scatteredLight', type: 'quirk', name: 'SCATTERED LIGHT',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'THE LIGHT SCATTERS!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'A BEAM THAT MISSES SPILLS ALL OVER THE FLOOR, AND HE WITH IT.', hidden: true },
      scout: 'SLIP HIS BEAM UPPERCUT: THE LIGHT SCATTERS AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'brokenBeam', type: 'stunTrigger', name: 'A BROKEN BEAM',
      trigger: { state: 'windup', move: 'hookL', counter: true, frames: [3, 6] },
      effect: { stun: 100, hits: 6, star: true, say: 'THE BEAM BREAKS!', sfx: 'glass' },
      hint: { kind: 'audio', text: 'A CHIME RINGS TWICE ON THE LEFT HOOK: THE LIGHT IS BENDING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF HIS LEFT HOOK BREAKS THE BEAM: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'oneLight', type: 'quirk', name: 'BACK TO ONE',
      trigger: { on: 'getUp' },
      effect: { open: { frames: 66, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'HE\'S ONLY ONE!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'WHEN HE GETS UP HE CAN\'T HOLD THE THREE OF THEM TOGETHER.', hidden: true },
      scout: 'WHEN HE GETS UP AFTER A KNOCKDOWN HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'bendsThrough', type: 'turtling', name: 'BENDS THROUGH THE GUARD', response: 'unblockable', moves: ['body', 'bodyR'], span: 480, share: 0.45, cue: 'NO BLOCK!', say: 'BENDS THROUGH!',
      scout: 'BLOCK TOO MUCH AND HIS BODY BLOWS BEND THROUGH YOUR GUARD: THEY CAN\'T BE BLOCKED, ONLY SLIPPED.',
    },
    {
      id: 'stolenLight', type: 'starHoard', name: 'STOLEN LIGHT', hold: 420, moves: ['jab', 'jabR', 'hook', 'hookL', 'upper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT HEAD PUNCH TAKES ONE, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullSpectrum', name: 'THE FULL SPECTRUM', when: { left: 90 }, say: 'THE FULL SPECTRUM!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 14 }, { move: 'hookL' }, { idle: 16 }, { move: 'bodyR' }, { idle: 24 }, { move: 'upper' }],
    },
    { id: 'whiteLight', name: 'WHITE LIGHT', when: { health: 0.3 }, say: 'WHITE LIGHT!', patterns: 'whiteout', steps: [{ idle: 16 }] },
  ],
  special: [
    {
      type: 'prism', spread: 54,
      palettes: { r: 'prism.r', g: 'prism.g', b: 'prism.b' },
      lights: { r: [31, 8, 8], g: [8, 28, 10], b: [10, 14, 31] },
    },
  ],
  titleDefense: null,
  gallery: 'LIGHT, SPLIT. HE BECOMES THREE COPIES, RED, GREEN AND BLUE: THE REAL ONE MATCHES THE RING LIGHT.',
  medals: { signature: { text: 'SLIP THE SPECTRUM.', check: 'moveResult', move: 'spectrum', result: 'dodged', n: 1 } },
  music: 'prismEntrance',
};
