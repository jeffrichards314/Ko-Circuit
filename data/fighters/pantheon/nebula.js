// #67 Nebula — Pantheon IV's champion, the Starfield. She isn't quite there: a woman of gas and
// starlight, half see-through, and she doesn't wind up. Her stance never changes. Her tells
// happen INSIDE her body and show only as a change of colour, the whole of her flushing
//   RED-GOLD  a punch at your head (a jab, a hook, the uppercut)
//   BLUE      a blow at your body
//   GREEN     a sweep along the canvas: duck it
//   WHITE-GOLD  her super
// with a glow over the side it comes from (a hook slips the side the glow ISN'T on: her left
// glow is a left punch). Read the colour, then move.
// Her super is the SUPERNOVA: she goes white-gold and the star inside her lets go. A knockdown:
// slip it. Counter it on the glint and she collapses.
// Pantheon IV difficulty: 5-frame tells (colour only), shuffled and adaptive, hearts 12; a champion.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;
const q = (hue, side, o = {}) => ({ hue, side, sfx: { tell: 'whisper' }, ...o });

export default {
  id: 'nebula',
  name: 'NEBULA',
  short: 'NEBULA',
  nickname: 'THE STELLAR NURSERY',
  circuit: 'p4',
  rank: 0,
  isChampion: true,
  card: {
    age: 4,
    weight: 0,
    record: '99-0 99KO',
    hometown: 'THE CRAB NEBULA',
    quote: 'YOU CAN\'T HIT WHAT ISN\'T THERE. YOU CAN\'T DODGE WHAT YOU CAN\'T SEE.',
  },
  lines: { win: 'DISPERSED. I WILL RETURN.', lose: 'I... AM STARDUST... AGAIN...' },

  build: 'giant',
  palette: 'nebula',
  spriteLayers: 'nebula',

  stats: stats({ health: 370, damageMult: 2.0, stunResistance: 6, starLossChance: 0.6, stunFrames: 46, hitstun: 12, betweenRoundHeal: 0.2 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 30 } }),

  moves: {
    flare: mv('jab', W, q('hot', 'L', { name: 'FLARE' })),
    flareR: mv('jabR', W, q('hot', 'R', { name: 'FLARE (R)' })),
    sear: mv('hook', W, q('hot', 'R', { name: 'SEARING HOOK' })),
    searL: mv('hookL', W, q('hot', 'L', { name: 'SEARING HOOK (L)' })),
    fallout: mv('upper', W, q('hot', null, { name: 'FALLOUT' })),
    chill: mv('body', W, q('cold', 'L', { name: 'COLD FRONT' })),
    chillR: mv('bodyR', W, q('cold', 'R', { name: 'COLD FRONT (R)' })),
    tide: mv('sweep', W, q('green', null, { name: 'TIDE OF GAS' })),
    // the super: the star inside her lets go
    supernova: superMove('SUPERNOVA', { hue: 'gold', sfx: { tell: 'whisper', swing: 'swingHeavy' }, kdWindow: [10, 13] }),
  },

  patterns: [
    { id: 'dust', weight: 3, when: { rounds: [1] }, steps: steps('i30 flare i16 sear i22 chill i36 tide i28 flareR i16 searL i40') },
    { id: 'gasCloud', weight: 3, steps: steps('i28 chillR i16 flare i14 searL i34 fallout i24 chill i18 sear i44') },
    { id: 'fusion', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 fallout i18 tide i26 chill i14 chillR i28 sear i16 flareR i40') },
    { id: 'collapse', weight: 1, script: 'collapse', steps: steps('i14 flare i12 sear i12 chill i22 tide i16 fallout i36') },
  ],

  super: { hit: 'head', move: 'supernova', golden: 'windup', window: [10, 13], taunt: 50, shout: 'SUPERNOVA!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'coldSnap', type: 'stunTrigger', name: 'COLD SNAP',
      trigger: { state: 'windup', move: ['chill', 'chillR'], height: 'high', frames: [3, 7], clean: 30 },
      effect: { stun: 90, hits: 6, star: true, say: 'COLD SNAP!', sfx: 'ice' },
      hint: { kind: 'visual', text: 'WHEN SHE GOES BLUE SHE DRAWS HER HEAT DOWN INTO HER BODY: HER HEAD IS LEFT COLD AND SLOW.' },
      scout: 'A HEAD SHOT ON THE FIRST FRAMES OF A BLUE (BODY-BLOW) FLUSH STUNS HER: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'dispersed', type: 'quirk', name: 'DISPERSED',
      trigger: { on: 'resolved', move: 'tide', result: 'ducked' },
      effect: { open: { frames: 104, anim: 'stunned', comboLimit: 6, star: [0, 40] }, say: 'SHE DISPERSES!', sfx: 'whoosh' },
      hint: { kind: 'visual', text: 'THE GREEN TIDE THINS HER OUT AS IT GOES: NOTHING LEFT OF HER FOR A MOMENT.', hidden: true },
      scout: 'DUCK HER GREEN TIDE OF GAS: SHE DISPERSES AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'condensed', type: 'quirk', name: 'CONDENSED',
      trigger: { on: 'getUp' },
      effect: { open: { frames: 70, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'SHE CONDENSES!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'WHEN SHE GETS UP SHE HAS TO GATHER HERSELF TOGETHER.', hidden: true },
      scout: 'WHEN SHE GETS UP AFTER A KNOCKDOWN SHE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'seepsThrough', type: 'turtling', name: 'SEEPS THROUGH THE GUARD', response: 'unblockable', moves: ['chill', 'chillR'], span: 480, share: 0.45, cue: 'NO BLOCK!', say: 'SEEPS THROUGH!',
      scout: 'BLOCK TOO MUCH AND HER COLD FRONTS SEEP THROUGH YOUR GUARD: THEY CAN\'T BE BLOCKED, ONLY SLIPPED.',
    },
    {
      id: 'gravitational', type: 'starHoard', name: 'GRAVITATIONAL PULL', hold: 420, moves: ['flare', 'flareR', 'sear', 'searL', 'fallout'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HER NEXT HEAD PUNCH PULLS ONE OUT OF YOUR GLOVE, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'bigBang', name: 'THE BIG BANG', when: { left: 90 }, say: 'THE BIG BANG!',
      steps: [{ idle: 18 }, { move: 'flare' }, { idle: 16 }, { move: 'chillR' }, { idle: 20 }, { move: 'fallout' }, { idle: 26 }, { move: 'tide' }],
    },
    { id: 'dyingStar', name: 'A DYING STAR', when: { health: 0.3 }, say: 'A DYING STAR!', patterns: 'collapse', steps: [{ idle: 16 }] },
  ],
  special: [
    {
      type: 'gas',
      hues: { hot: 'nebula.hot', cold: 'nebula.cold', gold: 'nebula.gold', green: 'nebula.green' },
      glow: { hot: [31, 16, 8], cold: [8, 20, 31], gold: [31, 28, 12], green: [10, 28, 14] },
    },
  ],
  titleDefense: null,
  gallery: 'A CLOUD OF GAS AND STARLIGHT THAT BOXES. HER TELLS ARE INSIDE HER, AND SHOW ONLY AS COLOUR.',
  medals: { signature: { text: 'DUCK THE TIDE OF GAS THREE TIMES.', check: 'moveResult', move: 'tide', result: 'ducked', n: 3 } },
  music: 'nebulaEntrance',
};
