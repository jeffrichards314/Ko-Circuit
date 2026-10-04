// #80 Radiant Rho — Pantheon VII's champion, the Summit. The light at the top of the stairs, and he
// doesn't fight with his own tricks: he fights with yours. He has borrowed the signature move of
// every champion of the Pantheon you have beaten (Aurora's FIRST LIGHT, Cirrus Crown's STORM
// FIST, the Old Guard's FIRST CHAMPION, Nebula's SUPERNOVA, Forgemaster Hale's FORGE FALL and Prism's
// SPECTRUM), each pulled from that champion's own data, each announced by name, and each
// tinted in that champion's colour. You know all six. Every one is slipped.
// His super is a random one of the six, with a glint of its own.
// Pantheon VII difficulty: 5-frame ordinary tells, shuffled and adaptive, hearts 12; a champion.

import { mv, stats, anims, GETUP, steps } from './_kit.js';
import aurora from './aurora.js';
import cirrus from './cirrus.js';
import oldguard from './oldguard.js';
import nebula from './nebula.js';
import hale from './hale.js';
import prism from './prism.js';

const W = 5;
// A champion's signature, exactly his own numbers (damage, defenses, the knockdown), thrown
// with Rho's overhead poses and a glint of its own (never the champion's gimmick fields).
const pull = (champ, id, sig, name, sfx) => {
  const m = champ.moves[id], w = m.windupFrames, k = Math.round(w * 0.55);
  return {
    name, sig, knockdown: true, noFake: true,
    windupFrames: w, activeFrames: m.activeFrames, recoveryFrames: m.recoveryFrames, damage: m.damage,
    avoidBy: m.avoidBy.slice(),
    counterWindow: [5, w - 3], starWindow: [5, 8], kdWindow: [k, k + 3], punishStar: ['dodged'],
    sfx: { tell: sfx || (m.sfx && m.sfx.tell && m.sfx.tell !== 'whisper' ? m.sfx.tell : 'fanfare'), swing: (m.sfx && m.sfx.swing) || 'swingHeavy' },
    animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: Math.max(4, Math.round(w / 2)), active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  };
};
const SIGS = {
  firstLight: pull(aurora, 'firstLight', 'aurora', 'AURORA: FIRST LIGHT'),
  stormFist: pull(cirrus, 'stormFist', 'cirrus', 'CIRRUS: STORM FIST'),
  firstChampion: pull(oldguard, 'firstChampion', 'oldguard', 'OLD GUARD: FIRST CHAMPION'),
  supernova: pull(nebula, 'supernova', 'nebula', 'NEBULA: SUPERNOVA', 'whisper'),
  forgeFall: pull(hale, 'forgeFall', 'hale', 'HALE: FORGE FALL'),
  spectrum: pull(prism, 'spectrum', 'prism', 'PRISM: SPECTRUM'),
};
const ROSE = [31, 14, 20], SKY = [10, 24, 31], SEPIA = [26, 20, 12], VIOLET = [24, 12, 30], EMBER = [31, 14, 4], CYAN = [14, 28, 31];

export default {
  id: 'rho',
  name: 'RADIANT RHO',
  short: 'RHO',
  nickname: 'THE LAST LIGHT',
  circuit: 'p7',
  rank: 1,
  isChampion: true,
  card: {
    age: 1000,
    weight: 168,
    record: '1-0 1KO',
    hometown: 'THE GATES OF LIGHT',
    quote: 'I HAVE BORROWED EVERY LIGHT ON THE WAY UP. NOW I WILL SHOW YOU THEM ALL.',
  },
  lines: { win: 'THE LIGHT IS ONLY EVER BORROWED.', lose: 'THE GATE... IS... YOURS...' },

  build: 'medium',
  palette: 'rho',
  spriteLayers: 'rho',

  stats: stats({ health: 400, damageMult: 2.1, stunResistance: 7, starLossChance: 0.6, stunFrames: 48, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 18 } }),

  moves: {
    jab: mv('jab', W, { name: 'RADIANT JAB', sfx: { tell: 'chime' } }),
    jabR: mv('jabR', W, { name: 'RADIANT CROSS', sfx: { tell: 'chime' } }),
    hook: mv('hook', W, { name: 'RADIANT HOOK', sfx: { tell: 'chime' } }),
    hookL: mv('hookL', W, { name: 'RADIANT HOOK (L)', sfx: { tell: 'chime' } }),
    body: mv('body', W, { name: 'RADIANT BLOW', sfx: { tell: 'chime' } }),
    bodyR: mv('bodyR', W, { name: 'RADIANT BLOW (R)', sfx: { tell: 'chime' } }),
    upper: mv('upper', W, { name: 'RADIANT UPPERCUT', sfx: { tell: 'chime' } }),
    ...SIGS,
  },

  patterns: [
    { id: 'aurora', homage: 'AURORA VESS', color: ROSE, weight: 2, fixed: true, steps: steps('i26 jab i16 hookL i24 firstLight i40 bodyR i44') },
    { id: 'cirrus', homage: 'CIRRUS CROWN', color: SKY, weight: 2, fixed: true, steps: steps('i26 jabR i16 hook i24 stormFist i40 body i44') },
    { id: 'oldguard', homage: 'THE OLD GUARD', color: SEPIA, weight: 2, fixed: true, steps: steps('i26 hook i16 bodyR i24 firstChampion i40 jab i44') },
    { id: 'nebula', homage: 'NEBULA', color: VIOLET, weight: 2, fixed: true, when: { rounds: [2, 3] }, steps: steps('i24 upper i16 jabR i24 supernova i40 hookL i44') },
    { id: 'hale', homage: 'FORGEMASTER HALE', color: EMBER, weight: 2, fixed: true, when: { rounds: [2, 3] }, steps: steps('i24 hookL i14 hook i24 forgeFall i40 upper i44') },
    { id: 'prism', homage: 'PRISM', color: CYAN, weight: 2, fixed: true, steps: steps('i24 jab i14 bodyR i24 spectrum i40 hookL i44') },
    { id: 'ownLight', weight: 2, steps: steps('i22 hookL i14 hook i16 upper i30 bodyR i14 jab i16 jabR i40') },
  ],

  // his super: one of the six, at random (each with its own perfect-hit window), the others stay in his patterns
  super: { hit: 'body', moves: Object.keys(SIGS), keep: true, golden: 'windup', window: [8, 14], from: 'borrowedLight', taunt: 50, shout: 'GLORY!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'spentLight', type: 'quirk', name: 'SPENT LIGHT',
      trigger: { on: 'resolved', move: Object.keys(SIGS), result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6, star: [0, 30] }, say: 'THE LIGHT IS SPENT!', sfx: 'chime' },
      hint: { kind: 'visual', text: 'A BORROWED SIGNATURE THAT MISSES LEAVES HIM DIM.', hidden: true },
      scout: 'SLIP ANY OF HIS BORROWED SIGNATURES: HE IS DIM AND OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'ownReflection', type: 'bait', name: 'HIS OWN GLORY', limit: 2,
      trigger: { on: 'passive', frames: 300 },
      effect: { script: [{ open: 62, anim: 'taunt', id: 'bask', comboLimit: 4, star: [0, 26] }], say: 'HE BASKS!' },
      hint: { kind: 'quote', text: 'I HAVE BORROWED EVERY LIGHT ON THE WAY UP.', hidden: true },
      scout: 'STAND STILL FOR 5 SECONDS AND HE BASKS IN HIS OWN LIGHT: OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'lightRises', type: 'getUpMash', name: 'THE LIGHT RISES', response: 'harder', punches: 3, mult: 1.3, say: 'THE LIGHT RISES!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
    {
      id: 'lightTax', type: 'starHoard', name: 'THE LIGHT\'S TAX', hold: 420, moves: ['jab', 'jabR', 'hook', 'hookL', 'upper'], say: 'STAR STOLEN!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT HEAD PUNCH TAKES ONE, EVEN BLOCKED.',
    },
  ],
  scriptedMoments: [
    {
      id: 'rollOfHonour', name: 'ROLL OF HONOUR', when: { left: 90 }, say: 'ROLL OF HONOUR!',
      steps: [{ idle: 18 }, { move: 'firstLight' }, { idle: 40 }, { move: 'stormFist' }, { idle: 40 }, { move: 'firstChampion' }],
    },
    { id: 'lastLight', name: 'THE LAST LIGHT', when: { health: 0.3 }, say: 'THE LAST LIGHT!', steps: [{ idle: 16 }, { move: 'spectrum' }, { idle: 40 }, { move: 'supernova' }, { idle: 40 }, { move: 'forgeFall' }] },
  ],
  special: [
    { type: 'homage' },
    {
      type: 'sigTint',
      palettes: { aurora: 'rho.aurora', cirrus: 'rho.cirrus', oldguard: 'rho.oldguard', nebula: 'rho.nebula', hale: 'rho.hale', prism: 'rho.prism' },
      names: { aurora: 'AURORA: FIRST LIGHT', cirrus: 'CIRRUS: STORM FIST', oldguard: 'OLD GUARD: FIRST CHAMPION', nebula: 'NEBULA: SUPERNOVA', hale: 'HALE: FORGE FALL', prism: 'PRISM: SPECTRUM' },
      colors: { aurora: ROSE, cirrus: SKY, oldguard: SEPIA, nebula: VIOLET, hale: EMBER, prism: CYAN },
    },
  ],
  titleDefense: null,
  gallery: 'THE LIGHT AT THE TOP OF THE STAIRS. HE FIGHTS WITH THE SIGNATURE MOVE OF EVERY PANTHEON CHAMPION.',
  medals: { signature: { text: 'SLIP THREE BORROWED SIGNATURES.', check: 'moveResult', move: 'firstLight', result: 'dodged', n: 1 } },
  music: 'rhoEntrance',
};
