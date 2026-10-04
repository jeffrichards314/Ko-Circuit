// #93 Rattle — Underworld III, the Chain Pits. A skeleton, and every one of his tells is the same sound: a
// dry rattle of bones. But not every rattle is a punch. About one in three is a FAKE: the same rattle, cut
// short at three-fifths, and a shrug. The real ones end on a CLACK, the sound of bone on bone at the moment
// of the blow; a fake never clacks. Defend everything; punish the shrugs. (A counter on a fake rattles him
// apart.)
// His super is the DANSE MACABRE: every bone he has, all at once. A knockdown: slip it. Counter it on the glint and
// he comes apart.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const bone = (o = {}) => ({ rattle: true, sfx: { tell: 'boneRattle', swing: 'boneClack' }, ...o });

export default {
  id: 'rattle',
  name: 'RATTLE',
  short: 'RATTLE',
  nickname: 'THE BONE BAG',
  circuit: 'u3',
  rank: 1,
  isChampion: false,
  card: {
    age: 200,
    weight: 88,
    record: '200-3 3KO',
    hometown: 'THE CATACOMB UNDER THE CELLS',
    quote: 'HEAR THAT? THAT\'S ME. OR IT ISN\'T. THAT\'S THE FUN.',
  },
  lines: { win: 'ONE MORE FOR THE COLLECTION.', lose: 'BONES... EVERYWHERE...' },

  build: 'lean',
  palette: 'rattle',
  spriteLayers: 'rattle',

  stats: stats({ health: 320, damageMult: 1.85, stunResistance: 4, stunFrames: 42, hitstun: 10 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 12 } }),

  moves: {
    snap: mv('jab', W, bone({ name: 'BONE SNAP' })),
    snapR: mv('jabR', W, bone({ name: 'BONE SNAP (R)' })),
    clack: mv('hook', W, bone({ name: 'CLACK HOOK' })),
    clackL: mv('hookL', W, bone({ name: 'CLACK HOOK (L)' })),
    ribs: mv('bodyR', W, bone({ name: 'RIB SHOT' })),
    skullBash: mv('upper', W, bone({ name: 'SKULL BASH', windupFrames: 9, counterWindow: [3, 8], starWindow: [3, 5], sfx: { tell: 'boneRattle', swing: 'boneClack' } })),
    // the super
    macabre: superMove('DANSE MACABRE', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'boneRattle', swing: 'crash' } }),
  },

  patterns: [
    { id: 'rattling', weight: 3, when: { rounds: [1] }, steps: steps('i24 snap i14 snapR i16 clack i24 ribs i20 skullBash i32 clackL i40') },
    { id: 'dance', weight: 3, steps: steps('i20 snapR i12 snap i14 clackL i22 skullBash i18 ribs i28 clack i14 clackL i38') },
    { id: 'boneyard', weight: 2, when: { rounds: [2, 3] }, steps: steps('i18 snap i10 snapR i10 clack i12 clackL i24 skullBash i20 ribs i14 snap i36') },
  ],

  super: { hit: 'body', move: 'macabre', golden: 'windup', window: [12, 15], taunt: 46, shout: 'DANSE MACABRE!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'looseBones', type: 'stunTrigger', name: 'LOOSE BONES',
      trigger: { state: 'windup', test: 'fakeTell', counter: true },
      effect: { stun: 96, hits: 6, star: true, say: 'HE RATTLES APART!', sfx: 'boneRattle' },
      hint: { kind: 'audio', text: 'A FAKE RATTLE IS CUT SHORT WITH NO CLACK AT THE END.' },
      scout: 'COUNTER A FAKE (THE RATTLE THAT IS CUT SHORT, WITH NO CLACK): HE RATTLES APART AND IS STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'skullSlip', type: 'quirk', name: 'THE SKULL SLIPS',
      trigger: { on: 'resolved', move: 'skullBash', result: 'dodged' },
      effect: { open: { frames: 80, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'HIS SKULL SLIPS!', sfx: 'boneClack' },
      hint: { kind: 'visual', text: 'A SKULL BASH THAT MISSES SENDS HIS HEAD ROLLING OFF-CENTER.', hidden: true },
      scout: 'SLIP HIS SKULL BASH: HIS HEAD ROLLS OFF-CENTER AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'knowsYourRhythm', type: 'comboRepeat', name: 'KNOWS YOUR RHYTHM', counter: ['skullBash'], gap: 45, say: 'HE KNOWS YOUR RHYTHM!',
      scout: 'THROW THE SAME TWO-PUNCH COMBO TWICE IN A ROW AND HE ANSWERS AT ONCE WITH THE SKULL BASH.',
    },
  ],
  scriptedMoments: [
    {
      id: 'danceOfBones', name: 'A DANCE OF BONES', when: { left: 80 }, say: 'A DANCE OF BONES!',
      steps: [{ idle: 14 }, { move: 'snap' }, { idle: 12 }, { move: 'snapR' }, { idle: 12 }, { move: 'clack' }, { idle: 12 }, { move: 'clackL' }, { idle: 22 }, { move: 'skullBash' }],
    },
  ],
  special: [{ type: 'bones', p: 0.34, rest: 30 }],
  titleDefense: null,
  gallery: 'A SKELETON WHOSE EVERY TELL IS THE SAME BONE RATTLE. ONE IN THREE IS A FAKE, AND FAKES NEVER CLACK.',
  medals: { signature: { text: 'RATTLE HIM APART: COUNTER A FAKE.', check: 'cueCount', cue: '!exploit:looseBones', n: 1 } },
  music: 'rattleWalkup',
};
