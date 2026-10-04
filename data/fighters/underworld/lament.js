// #105 Lament — Underworld VI. A mourner who has been crying for a thousand years, and every punch of his starts with a cry. But his
// cries are BACKWARDS: a quiet, low moan is a real punch, and a loud, high shriek is a fake (about a third of his punches: the same
// tell cut short and a shrug). Loud and quiet are in the sound, and drawn as rings round his mouth (a LOUD CRY: A FAKE badge). Defend
// the quiet ones; punish the shrug after a loud one; a counter on a fake breaks his voice.
// His super is THE LAST NOTE, which is always a whisper: slip it, or hit him on the glint while he cries it out.
// Underworld difficulty: 3-frame tells (a medium fighter), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';

const W = 3;

export default {
  id: 'lament',
  name: 'LAMENT',
  short: 'LAMENT',
  nickname: 'THE MOURNER',
  circuit: 'u6',
  rank: 2,
  isChampion: false,
  card: { age: 1000, weight: 172, record: '64-0 40KO', hometown: 'THE GATE STEPS', quote: 'LISTEN. THE LOUD ONES ARE FOR YOU. THE QUIET ONE IS FOR ME.' },
  lines: { win: 'IT WAS ALWAYS GOING TO BE YOU. I CRIED FOR YOU BEFOREHAND.', lose: 'I... HAVE... NO MORE TEARS...' },

  build: 'medium',
  palette: 'lament',
  spriteLayers: 'lament',

  stats: stats({ health: 400, damageMult: 2.0, stunResistance: 5, starLossChance: 0.6, stunFrames: 46, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }),
  guardCounter: 'keen',

  moves: {
    sob: mv('jab', W, { name: 'SOB' }),
    wail: mv('hook', W, { name: 'WAIL HOOK' }),
    wailL: mv('hookL', W, { name: 'WAIL HOOK (L)' }),
    sorrow: mv('body', W, { name: 'SORROW' }),
    keen: mv('upper', W, { name: 'KEEN', sfx: { swing: 'swingHeavy' } }),
    lastNote: superMove('THE LAST NOTE', { windupFrames: 20, counterWindow: [5, 17], starWindow: [5, 8], sfx: { tell: 'cryQuiet', swing: 'crash' } }),
  },

  patterns: [
    { id: 'requiem', weight: 3, when: { rounds: [1] }, steps: steps('i34 sob i30 wail i30 sorrow i34 keen i40 wailL i28 sob i48') },
    { id: 'dirge', weight: 3, steps: steps('i28 sorrow i26 wailL i28 sob i30 keen i32 wail i26 sorrow i44') },
    { id: 'lamentation', weight: 2, when: { health: [0, 0.5] }, steps: steps('i22 wail i20 wailL i20 keen i22 sorrow i22 sob i22 wail i32') },
  ],

  super: { hit: 'head', move: 'lastNote', golden: 'taunt', window: [16, 22], taunt: 44, shout: 'THE LAST NOTE...', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'crackedVoice', type: 'stunTrigger', name: 'A CRACKED VOICE',
      trigger: { state: 'windup', move: ['sob', 'wail', 'wailL', 'sorrow', 'keen'], counter: true, test: 'fakeTell' },
      effect: { stun: 92, hits: 7, star: true, say: 'HIS VOICE BREAKS!', sfx: 'glass' },
      hint: { kind: 'audio', text: 'A LOUD CRY HAS A CRACK IN IT WHEN IT IS A LIE.' },
      scout: 'COUNTER A FAKE (THE LOUD, HIGH CRY): HIS VOICE BREAKS AND HE IS STUNNED FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'tearsFall', type: 'quirk', name: 'THE TEARS FALL',
      trigger: { on: 'resolved', move: 'keen', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 5, star: [0, 34] }, say: 'HE WEEPS!', sfx: 'drip' },
      hint: { kind: 'visual', text: 'A KEEN THAT MISSES SENDS HIM DOWN ON HIS KNEES AND THE TEARS RUN.', hidden: true },
      scout: 'SLIP HIS KEEN (THE UPPERCUT): HE WEEPS AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'griefGrows', type: 'passivity', name: 'GRIEF GROWS', response: 'buff', frames: 240, gain: 1 / 500, decay: 1 / 220, dmg: 0.3, rec: 0.15, meter: 'GRIEF', say: 'THE GRIEF GROWS!',
      scout: 'STAND STILL AND HIS GRIEF FILLS: HIS PUNCHES HIT HARDER AND RECOVER FASTER (NEVER WITH A SHORTER TELL). ANY PUNCH OF YOURS DRAINS IT.',
    },
  ],
  scriptedMoments: [
    { id: 'wailingWall', name: 'THE WAILING WALL', when: { left: 80 }, say: 'THE WAILING WALL!', steps: [{ idle: 22 }, { move: 'sob' }, { idle: 26 }, { move: 'wail' }, { idle: 30 }, { move: 'sob' }, { idle: 36 }, { move: 'keen' }] },
  ],
  special: [{ type: 'reversed', p: 0.34, rest: 32 }],
  titleDefense: null,
  gallery: 'THE MOURNER. HIS CRIES ARE BACKWARDS: THE LOUD ONE IS A FAKE, THE QUIET ONE IS THE PUNCH.',
  medals: { signature: { text: 'BREAK HIS VOICE: COUNTER A FAKE.', check: 'cueCount', cue: '!exploit:crackedVoice', n: 1 } },
  music: 'lamentWalkup',
};
