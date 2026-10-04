// #107 The Herald — Underworld VI's champion, the voice of Vorgath. He does not fight with anything of his own: he speaks the King's
// mind, and the King's mind is every champion the Underworld has made. He has taken the signature move of each: Moros's REQUIEM,
// Queen Soot's FIRE STORM, the Jailer's LIFE SENTENCE, the Fallen King's GUILLOTINE and Crucible's MELTDOWN, each pulled from that
// champion's own data, announced by name, and tinted in that champion's colour. You know all five. Every one is slipped.
// His super is a random one of the five, with a glint of its own.
// Underworld difficulty: 3-frame ordinary tells (a medium fighter), adaptive, 10 hearts, one life; a champion.

import { mv, stats, anims, steps } from '../pantheon/_kit.js';
import moros from './moros.js';
import soot from './soot.js';
import jailer from './jailer.js';
import fkarver from './fkarver.js';
import crucible from './crucible.js';

const W = 3;
// a champion's signature, exactly his own numbers (damage, defenses), thrown with the Herald's overhead poses and a glint of its own
const pull = (champ, id, sig, name, sfx) => {
  const m = champ.moves[id], w = m.windupFrames, k = Math.round(w * 0.55);
  return {
    name, sig, knockdown: true, noFake: true,
    windupFrames: w, activeFrames: m.activeFrames, recoveryFrames: m.recoveryFrames, damage: m.damage,
    avoidBy: m.avoidBy.slice(),
    counterWindow: [5, w - 3], starWindow: [5, 8], kdWindow: [k, k + 3], punishStar: ['dodged'],
    sfx: { tell: sfx || (m.sfx && m.sfx.tell) || 'fanfare', swing: (m.sfx && m.sfx.swing) || 'swingHeavy' },
    animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: Math.max(4, Math.round(w / 2)), active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  };
};
const SIGS = {
  requiem: pull(moros, 'requiem', 'moros', 'MOROS: REQUIEM'),
  fireStorm: pull(soot, 'fireStorm', 'soot', 'SOOT: FIRE STORM'),
  lifeSentence: pull(jailer, 'lifeSentence', 'jailer', 'THE JAILER: LIFE SENTENCE'),
  guillotine: pull(fkarver, 'guillotine', 'fkarver', 'THE FALLEN KING: GUILLOTINE'),
  meltdown: pull(crucible, 'meltdown', 'crucible', 'CRUCIBLE: MELTDOWN'),
};
const TEAL = [6, 22, 21], EMBER = [31, 14, 4], IRON = [19, 20, 26], RUBY = [28, 6, 10], WHITE = [31, 26, 14];
const SIGN = Object.keys(SIGS);

export default {
  id: 'herald',
  name: 'THE HERALD',
  short: 'HERALD',
  nickname: 'THE KING\'S VOICE',
  circuit: 'u6',
  rank: 0,
  isChampion: true,
  card: { age: 1000, weight: 180, record: '5-0 5KO', hometown: 'THE KING\'S DOORWAY', quote: 'I DO NOT SPEAK FOR MYSELF. THE KING SPEAKS, AND YOU ARE THE ANSWER.' },
  lines: { win: 'THE KING HAS SPOKEN.', lose: 'THE KING... WILL HAVE MY... VOICE...' },

  build: 'medium',
  palette: 'herald',
  spriteLayers: 'herald',

  stats: stats({ health: 520, damageMult: 2.2, stunResistance: 8, starLossChance: 0.65, stunFrames: 50, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 18 } }),
  guardCounter: 'bellow',

  moves: {
    jab: mv('jab', W, { name: 'PROCLAMATION', sfx: { tell: 'trumpetHi' } }),
    hook: mv('hook', W, { name: 'DECREE HOOK', sfx: { tell: 'trumpetHi' } }),
    hookL: mv('hookL', W, { name: 'DECREE HOOK (L)', sfx: { tell: 'trumpetHi' } }),
    body: mv('body', W, { name: 'EDICT', sfx: { tell: 'trumpetLo' } }),
    bodyR: mv('bodyR', W, { name: 'EDICT (R)', sfx: { tell: 'trumpetLo' } }),
    upper: mv('upper', W, { name: 'ANNOUNCEMENT', sfx: { tell: 'trumpetHi', swing: 'swingHeavy' } }),
    // the answer to being rushed: a slow bellow
    bellow: mv('upper', W, { name: 'BELLOW', windupFrames: 12, counterWindow: [4, 10], starWindow: [4, 7], damage: 16, punishStar: ['dodged'], noFake: true, sfx: { tell: 'roar', swing: 'swingHeavy' } }),
    ...SIGS,
  },

  patterns: [
    { id: 'moros', homage: 'MOROS', color: TEAL, weight: 2, fixed: true, steps: steps('i26 jab i16 hookL i24 requiem i40 bodyR i44') },
    { id: 'soot', homage: 'QUEEN SOOT', color: EMBER, weight: 2, fixed: true, steps: steps('i26 hook i16 body i24 fireStorm i40 jab i44') },
    { id: 'jailer', homage: 'THE JAILER', color: IRON, weight: 2, fixed: true, steps: steps('i26 hookL i16 bodyR i24 lifeSentence i40 upper i44') },
    { id: 'fkarver', homage: 'THE FALLEN KING', color: RUBY, weight: 2, fixed: true, when: { rounds: [2, 3] }, steps: steps('i24 upper i16 jab i24 guillotine i40 hookL i44') },
    { id: 'crucible', homage: 'CRUCIBLE', color: WHITE, weight: 2, fixed: true, when: { rounds: [2, 3] }, steps: steps('i24 hook i14 hookL i24 meltdown i40 upper i44') },
    { id: 'ownVoice', weight: 2, steps: steps('i22 hookL i14 hook i16 upper i30 bodyR i14 jab i16 body i40') },
  ],

  super: { hit: 'head', moves: SIGN, keep: true, golden: 'windup', window: [9, 13], from: 'borrowedVoice', taunt: 50, shout: 'THE KING SPEAKS!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'echoFades', type: 'quirk', name: 'THE ECHO FADES',
      trigger: { on: 'resolved', move: SIGN, result: 'dodged' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'THE ECHO FADES!', sfx: 'wail' },
      hint: { kind: 'visual', text: 'A BORROWED SIGNATURE THAT MISSES LEAVES HIM HOARSE.', hidden: true },
      scout: 'SLIP ANY OF HIS BORROWED SIGNATURES: HE IS HOARSE AND OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'mastersVoice', type: 'bait', name: 'HIS MASTER\'S VOICE', limit: 2,
      trigger: { on: 'passive', frames: 280 },
      effect: { script: [{ open: 64, anim: 'taunt', id: 'proclaim', comboLimit: 4, star: [0, 28] }], say: 'HE PROCLAIMS!' },
      hint: { kind: 'quote', text: 'THE KING SPEAKS, AND YOU ARE THE ANSWER.', hidden: true },
      scout: 'STAND STILL FOR ABOUT 5 SECONDS AND HE PROCLAIMS: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'wordsBack', type: 'rushing', name: 'THE KING WILL NOT BE INTERRUPTED', span: 150, count: 3, counter: ['bellow'], say: 'BELLOW!',
      scout: 'PUNCH INTO HIS GUARD THREE TIMES IN QUICK SUCCESSION AND HE BELLOWS BACK: A SLOW UPPERCUT (SLIP IT).',
    },
    {
      id: 'kingsTax', type: 'starHoard', name: 'THE KING\'S TAX', hold: 400, moves: ['jab', 'hook', 'hookL', 'upper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT PROCLAMATION, HOOK OR ANNOUNCEMENT TAKES ONE, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    { id: 'proclamation', name: 'THE PROCLAMATION', when: { left: 90 }, say: 'THE PROCLAMATION!', steps: [{ idle: 18 }, { move: 'requiem' }, { idle: 40 }, { move: 'fireStorm' }, { idle: 40 }, { move: 'lifeSentence' }] },
    { id: 'kingsWord', name: 'THE KING\'S WORD', when: { health: 0.3 }, say: 'THE KING\'S WORD!', steps: [{ idle: 16 }, { move: 'guillotine' }, { idle: 40 }, { move: 'meltdown' }, { idle: 40 }, { move: 'requiem' }] },
  ],
  special: [{ type: 'homage' }],
  titleDefense: null,
  gallery: 'THE KING\'S VOICE. HE FIGHTS WITH THE SIGNATURE MOVE OF EVERY UNDERWORLD CHAMPION: YOU HAVE MET THEM ALL.',
  medals: { signature: { text: 'SLIP EVERY BORROWED SIGNATURE.', check: 'cueCount', cue: '!exploit:echoFades', n: 4 } },
  music: 'heraldEntrance',
};
