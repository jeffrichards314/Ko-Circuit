// The Pantheon's music (spec §18 A7), all original: bright, choir-like pulse leads that grow
// grander as you climb. Each circuit's fight theme is 16 bars of 4/4 (tools/audio-audit.mjs
// checks every channel is the same length).
//   gateFight      "Dawn at the Gate"     D major, 144 bpm: a fanfare climbing with the sun
//   cloudFight     "Above the Weather"    A major, 132 bpm: airy, high, arpeggios that never land
//   heroesFight    "March of the Heroes"  G major, 126 bpm: a march, the choir in harmony
//   rivalAscendant "Same Day, Higher Up"  the rival melody again, a choir pulse under it (Dash V)
//   pantheonMap    the staircase's theme: slow, bright, a long climb
//   ascend         the sky opening (cutscene)
//   auroraEntrance / cirrusEntrance / oldGuardEntrance   the three champions' walk-ins
// and a three-bar walk-up jingle for every other fighter (`<id>Walkup`).

// --- chord tables ------------------------------------------------------------------
// a chord as [octave, root, third, fifth] note names for a bar of eighth-note arpeggio (up-down)
const CH = {
  D: ['o4', 'd', 'f+', 'a'], A: ['o3', 'a', '>c+', 'e'], Bm: ['o3', 'b', '>d', 'f+'], G: ['o3', 'g', 'b', '>d'],
  E: ['o3', 'e', 'g+', 'b'], F: ['o4', 'f+', 'a', '>c+'], // F#m
  C: ['o4', 'c', 'e', 'g'], Em: ['o3', 'e', 'g', 'b'],
};
const ROOT = { D: 'd', A: 'a', Bm: 'b', G: 'g', E: 'e', F: 'f+', C: 'c', Em: 'e' };
const ROCT = { D: 2, A: 1, Bm: 1, G: 1, E: 1, F: 1, C: 2, Em: 1 };
// (the third and fifth carry octave marks (>) relative to the chord's octave: undo them after each use)
const arpBar = (ch, len = 8) => {
  const [o, r, t, f] = CH[ch];
  const up = (n) => (n.startsWith('>') ? [n.slice(1), 1] : [n, 0]);
  const [tn, ti] = up(t), [fn, fi] = up(f);
  const seq = [[r, 0], [tn, ti], [fn, fi], [tn, ti]];
  const oct = +o.slice(1);
  const body = seq.map(([n, i]) => `o${oct + i} ${n}${len}`).join(' ');
  return `${body} ${body}`; // two passes = 8 eighths (or 16 sixteenths with len 16 and four passes)
};
const arp16 = (ch) => { const one = arpBar(ch, 16); return `${one} ${one}`; };
const bassBar = (ch) => `o${ROCT[ch]} [${ROOT[ch]}8 >${ROOT[ch]}8<]4`;
const bassLong = (ch) => `o${ROCT[ch]} ${ROOT[ch]}4 ${ROOT[ch]}4 >${ROOT[ch]}4< ${ROOT[ch]}4`;
const bars = (list, f) => list.map(f).join(' | ') + ' |';
const KICK = 'k8 h8 s8 h8 k8 k8 s8 h8';
const FILL = 'k8 h8 s8 h8 s16 s16 s16 s16 s8 x8';

// --- P1: Dawn at the Gate ------------------------------------------------------------
const GATE = ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A', 'D', 'A'];
export const gateFight = {
  id: 'gateFight',
  tempo: 144,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.32, sustain: 0.72 }, vibrato: true,
      mml: `l8 v12
        o5 d4 f+4 a4 f+4 | o5 e4 a4 o6 c+4 o5 a4 | o5 f+4 b4 o6 d4 o5 b4 | o5 g4 b4 o6 d4. c+8 |
        o6 d2 c+4 o5 b4 | o5 a4. b8 o6 c+4 e4 | o5 b4 o6 d4 g4 f+4 | o6 e2. r4 |
        o5 b4 o6 d4 f+4 d4 | o5 b4 o6 d4 g2 | o6 f+4 a4 o7 d4 o6 a4 | o6 g4 e4 c+4 e4 |
        o6 d4 g4 b4 g4 | o6 e4 a4 g4 e4 | o6 f+2 d2 | o6 e4 c+4 o5 a4 e4 |`,
    },
    // the choir: the same melody a third below, breathing in long notes
    p2: {
      duty: 1, env: { decay: 0.4, sustain: 0.6 },
      mml: `l4 v7
        o4 f+2 a2 | o4 g2 o5 c+2 | o4 b2 o5 d2 | o4 b2 g2 |
        o5 f+2 e2 | o4 e2 a2 | o4 g2 b2 | o5 c+2 r2 |
        o4 f+2 a2 | o4 g2 b2 | o5 a2 d2 | o5 e2 c+2 |
        o5 d2 g2 | o5 c+2 e2 | o5 a2 f+2 | o5 c+2 o4 a2 |`,
    },
    // rising arpeggios underneath (the light coming up)
    p3: undefined,
    tri: { env: { decay: 0.14, sustain: 0.6 }, mml: `v15 ${bars(GATE, bassBar)}` },
    noise: { mml: `v10 [${KICK} |]15 ${FILL} |` },
  },
};
// (drop the unused placeholder channel)
delete gateFight.channels.p3;

// --- P2: Above the Weather -----------------------------------------------------------
const CLOUD = ['A', 'E', 'F', 'D', 'A', 'E', 'D', 'E', 'F', 'D', 'A', 'E', 'D', 'E', 'A', 'E'];
export const cloudFight = {
  id: 'cloudFight',
  tempo: 132,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.36, sustain: 0.68 }, vibrato: true,
      mml: `l8 v11
        o5 a4 o6 c+4 e4 c+4 | o5 b4 o6 e4 g+4 e4 | o6 c+4 f+4 a4 f+4 | o6 d4 f+4 a2 |
        o6 e2 c+4 o5 a4 | o5 g+4. a8 b4 o6 e4 | o6 f+4 d4 o5 a4 o6 d4 | o5 b2. r4 |
        o6 c+4 e4 f+4 e4 | o6 d4 f+4 a4 o7 d4 | o6 e4 c+4 o5 a4 o6 c+4 | o5 g+4 b4 o6 e2 |
        o6 f+4 a4 o7 d2 | o7 c+4 o6 b4 g+4 e4 | o6 a2 e2 | o6 e4 c+4 o5 b4 g+4 |`,
    },
    // sixteenth-note sparkle: nothing ever lands
    p2: { duty: 0, env: { decay: 0.05, sustain: 0.3 }, mml: `v6 ${bars(CLOUD, arp16)}` },
    tri: { env: { decay: 0.3, sustain: 0.75 }, mml: `v15 ${bars(CLOUD, bassLong)}` },
    noise: { mml: `v8 [h8 r8 s8 r8 h8 r8 s8 h8 |]15 ${FILL} |` },
  },
};

// --- P3: March of the Heroes ---------------------------------------------------------
const HEROES = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'D'];
export const heroesFight = {
  id: 'heroesFight',
  tempo: 126,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.3, sustain: 0.75 }, vibrato: true,
      mml: `l8 v12
        o5 g4 b4 o6 d4 o5 b4 | o5 a4 o6 d4 f+4 d4 | o5 b4 o6 e4 g4 e4 | o6 c4 e4 g2 |
        o6 d2 o5 b4 g4 | o5 a4. b8 o6 c4 d4 | o6 e4 c4 o5 g4 o6 c4 | o6 d2. r4 |
        o6 e4 g4 b4 g4 | o6 c4 e4 g4 e4 | o6 d4 o5 b4 g4 b4 | o6 a4 f+4 d4 f+4 |
        o6 e4 g4 o7 c2 | o6 a4 o7 d4 c4 o6 a4 | o6 g2 b2 | o6 f+4 a4 g4 f+4 |`,
    },
    // the choir in thirds: a second pulse a step above
    p2: {
      duty: 2, env: { decay: 0.3, sustain: 0.7 }, vibrato: true,
      mml: `l8 v8
        o5 b4 o6 d4 g4 d4 | o6 d4 f+4 a4 f+4 | o5 g4 b4 o6 e4 b4 | o6 e4 g4 o7 c2 |
        o6 g2 d4 o5 b4 | o6 c4. d8 e4 f+4 | o6 g4 e4 c4 e4 | o6 f+2. r4 |
        o6 g4 b4 o7 d4 o6 b4 | o6 e4 g4 o7 c4 o6 g4 | o6 f+4 d4 o5 b4 o6 d4 | o6 d4 a4 f+4 a4 |
        o6 g4 b4 o7 e2 | o6 c4 f+4 e4 c4 | o6 b2 d2 | o6 a4 o7 c4 o6 b4 a4 |`,
    },
    tri: { env: { decay: 0.1, sustain: 0.6 }, mml: `v15 ${bars(HEROES, bassBar)}` },
    // a march: kick on the beat, snare on two and four, a roll into each fourth bar
    noise: { mml: `v11 [k8 h8 s8 h8 k8 h8 s8 h8 |]3 k8 k8 s8 s8 s16 s16 s16 s16 x8 h8 | [k8 h8 s8 h8 k8 h8 s8 h8 |]3 k8 k8 s8 s8 s16 s16 s16 s16 x8 h8 | [k8 h8 s8 h8 k8 h8 s8 h8 |]3 k8 k8 s8 s8 s16 s16 s16 s16 x8 h8 | [k8 h8 s8 h8 k8 h8 s8 h8 |]3 ${FILL} |` },
  },
};

// --- Dash V: the same melody as his other fights, a choir pulse under it ------------------
const RIVAL_LEAD = `
  o5 e8 e8 g8 b8 o6 e4 o5 b4 | o5 c8 e8 g8 o6 c8 o5 b4 g4 | o5 a8 f+8 d8 f+8 a4. g8 | o5 f+4 d+4 o4 b4 r4 |
  o5 e8 g8 b8 o6 e8 g4 e4 | o6 e8 d8 c8 o5 b8 g4 e4 | o5 a8 b8 o6 c8 e8 d4 c4 | o5 b2 a8 g8 f+8 d+8 |
  o5 g4 e8 g8 o6 c4 c4 | o6 d4. c8 o5 b8 a8 f+4 | o5 g4 b4 o6 e4 g4 | o6 f+8 e8 d+8 e8 o5 b2 |
  o5 a8 o6 c8 e8 a8 g4 e4 | o6 f+8 d+8 o5 b8 o6 d+8 f+4 a4 | o6 g4. f+8 e4 o5 b4 | o5 a8 b8 o6 c8 o5 b8 a8 g8 f+8 d+8 |`;
const RCH = ['em', 'c', 'd', 'b7', 'em', 'c', 'am', 'b7', 'c', 'd', 'em', 'em', 'am', 'b7', 'em', 'b7'];
const RARP = { em: 'o4 e g b >e<', c: 'o4 c e g >c<', d: 'o4 d f+ a >d<', b7: 'o3 b >d+ f+ a<', am: 'o3 a >c e a<' };
const RROOT = { em: 'e', c: 'c', d: 'd', b7: 'b', am: 'a' };
const RROCT = { em: 2, c: 2, d: 2, b7: 1, am: 1 };
export const rivalAscendant = {
  id: 'rivalAscendant',
  tempo: 152,
  channels: {
    p1: { duty: 2, env: { decay: 0.3, sustain: 0.7 }, vibrato: true, mml: `l8 v12 ${RIVAL_LEAD}` },
    // the choir: the melody a third up in long notes, over a pulse
    p2: {
      duty: 1, env: { decay: 0.4, sustain: 0.6 },
      mml: `v7 ${RCH.map((c) => { const [o, ...n] = RARP[c].split(' '); return `${o} [${n.map((x) => x.replace(/^([<>]?)([a-g][+]?)([<>]?)$/, '$1$28$3')).join(' ')}]2`; }).join(' | ')} |`,
    },
    tri: { env: { decay: 0.12, sustain: 0.6 }, mml: `v15 ${RCH.map((c) => `o${RROCT[c]} [${RROOT[c]}8 >${RROOT[c]}8<]4`).join(' | ')} |` },
    noise: { mml: `v10 [k8 h8 s8 h8 k8 k8 s8 h8]15 | k8 s16 s16 s8 s16 s16 s8 s8 x4 |` },
  },
};

// --- the staircase, and the sky opening ------------------------------------------------
export const pantheonMap = {
  id: 'pantheonMap',
  tempo: 96,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.5, sustain: 0.7 }, vibrato: true,
      mml: `l4 v10
        o5 d2 f+2 | o5 e2 a2 | o5 f+2 b2 | o5 g2 o6 d2 |
        o6 d2 c+2 | o5 b2 a2 | o5 g2 f+2 | o5 e1 |`,
    },
    p2: { duty: 1, env: { decay: 0.3, sustain: 0.5 }, mml: `v6 ${bars(['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'A'], (c) => arpBar(c, 8))}` },
    tri: { env: { decay: 0.4, sustain: 0.8 }, mml: `l2 v14 o2 d d | o1 a a | o1 b b | o1 g g | o2 d d | o1 a a | o1 g g | o1 a a |` },
  },
};
export const ascend = {
  id: 'ascend',
  tempo: 72,
  channels: {
    p1: { duty: 2, env: { decay: 0.6, sustain: 0.6 }, vibrato: true, mml: `l4 v9 o5 d2 f+2 | o5 a2 o6 d2 | o6 c+2 o5 a2 | o5 b2 o6 d2 | o6 d1 |` },
    p2: { duty: 1, env: { decay: 0.6, sustain: 0.5 }, mml: `l4 v6 o4 a2 >d2< | o4 f+2 a2 | o4 e2 a2 | o4 g2 b2 | o5 f+1 |` },
    tri: { env: { decay: 0.5, sustain: 0.8 }, mml: `l2 v14 o2 d d | o1 b b | o1 a a | o1 g g | o2 d1 |` },
  },
};

// --- entrances: the three champions' walk-ins -----------------------------------------------
export const auroraEntrance = {
  id: 'auroraEntrance', tempo: 116, loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.75 }, vibrato: true, mml: 'o5 l8 v12 f+4 a4 o6 d4 c+8 d8 | o6 e4. d8 c+4 o5 a4 | o5 b4 o6 d4 f+4 a4 | o6 a1' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o4 l4 v8 a4 >d4 f+4 d4< | a4 >c+4 e4 c+4< | b4 >d4 f+4 d4< | f+1' },
    tri: { mml: 'o2 l4 v15 d4 d4 d4 d4 | a4 a4 a4 a4 | b4 b4 b4 b4 | d1' },
    noise: { mml: 'l4 v9 k4 h8 h8 s4 h4 | k4 h8 h8 s4 h4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x1' },
  },
};
export const cirrusEntrance = {
  id: 'cirrusEntrance', tempo: 104, loop: false,
  channels: {
    p1: { duty: 1, env: { decay: 0.6, sustain: 0.7 }, vibrato: true, mml: 'o6 l8 v11 e4 c+4 o5 a4 o6 c+4 | o6 f+4. e8 d4 c+4 | o5 b4 o6 d4 g+4 b4 | o6 e1' },
    p2: { duty: 2, env: { decay: 0.6, sustain: 0.5 }, mml: 'o5 l4 v7 a2 e2 | f+2 d2 | e2 b2 | g+1' },
    tri: { mml: 'o2 l2 v15 a a | d d | e e | e1' },
    noise: { mml: 'l4 v7 h4 r4 h4 r4 | h4 r4 h4 r4 | h4 r4 s16 s16 s16 s16 s4 | x1' },
  },
};
export const oldGuardEntrance = {
  id: 'oldGuardEntrance', tempo: 100, loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.75 }, vibrato: true, mml: 'o5 l8 v12 g4. g8 b4 o6 d4 | o6 e4. d8 c4 o5 b4 | o5 a4 o6 c4 e4 g4 | o6 g1' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o4 l4 v9 b4 >d4 g4 d4< | c4 e4 g4 e4 | a4 >c4 e4 c4< | b1' },
    tri: { mml: 'o2 l4 v15 g4 g4 g4 g4 | c4 c4 c4 c4 | a4 a4 a4 a4 | g1' },
    noise: { mml: 'l4 v10 k4 s8 s8 k4 s4 | k4 s8 s8 k4 s4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x1' },
  },
};

// --- walk-up jingles: three bars each (like data/music/walkups.js) ----------------------------
const P = (duty, decay = 0.3, sustain = 0.6) => ({ duty, env: { decay, sustain } });
function walkup(id, tempo, [p1, p2, tri, noise], { d1 = 1, d2 = 0, v1 = 11, v2 = 7, env1, env2 } = {}) {
  const ch = {
    p1: { ...P(d1, ...(env1 || [])), mml: `v${v1} ${p1}` },
    p2: { ...P(d2, ...(env2 || [0.2, 0.4])), mml: `v${v2} ${p2}` },
    tri: { mml: `v15 ${tri}` },
  };
  if (noise) ch.noise = { mml: noise };
  return { id: id + 'Walkup', tempo, loop: false, channels: ch };
}
export const PANTHEON_WALKUPS = [
  walkup('oro', 100, [ // a slow march of plate on marble
    'o4 l8 d d f+ d a4 f+4 | g8 g8 b8 g8 o5 d4 o4 b4 | a4 f+4 d2',
    'o3 l8 a a >c+< a >e4 c+4< | b8 b8 >d8< b8 >f+4 d4< | e4 c+4 a2',
    'o2 l4 d d d d | g g g g | a a d2',
    'l8 v10 [k r s r]4 k4 k4 s4 x4',
  ], { d1: 2, d2: 2 }),
  walkup('lark', 152, [ // a herald's fanfare
    'o5 l16 d f+ a >d< a f+ d f+ a >d< f+ a >d< f+ a d | o6 l8 e d c+ d e4 f+4 | o6 g8 f+8 e8 d8 d4 r4',
    'o4 l8 f+ a >d< a f+ a >d< a< | g b >e< b g b >e< b< | b >d<b >d< d4 r4',
    'o3 l8 d d d d d d d d | g g g g g g g g | d4 d4 d4 r4',
    'l8 v9 [k h s h]4 k8 k8 s8 s8 x4 r4',
  ], { d1: 2 }),
  walkup('ember', 84, [ // a lamp being lit
    'o5 l4 a2 f+4 e4 | d2. r4 | e2 a2',
    'o4 l4 f+2 d4 c+4 | d2. r4 | c+2 e2',
    'o2 l2 d a | d1 | a a',
    null,
  ], { d1: 0, v1: 9, env1: [0.6, 0.6] }),
  walkup('zephyr', 168, [ // a breeze with a bounce
    'o5 l16 e g+ b >e< b g+ e g+ b >e< g+ e< b g+ e g+ | a >c+ e a< e c+ a >c+ e a< e c+ e4 | e8 r8 e8 r8 >e4< r4',
    'o4 l8 b >e< b >e< b >e< g+4 | a >c+< a >c+< b4 g+4 | g+8 r8 g+8 r8 b4 r4',
    'o3 l8 e >e< e >e< e >e< e >e< | a >a< a >a< e >e< e >e< | e4 e4 e4 r4',
    'l8 v8 [h s h s]5 h s x4',
  ], { d1: 2 }),
  walkup('nimbus', 76, [ // low thunder rolling
    'o3 l2 a e | f+ e | a1',
    'o2 l2 a e | f+ e | a1',
    'o1 l1 a | f+ | a',
    'l2 v6 x r x r x r',
  ], { d1: 2, d2: 2, v1: 12, env1: [0.8, 0.7] }),
  walkup('ulla', 148, [ // wind over the terrace
    'o5 l8 a >c+ e< a >c+ e a4 | g+8 b8 >e8< b8 g+4 e4 | f+8 a8 >c+8< a8 e2',
    'o4 l8 e a >c+< a e a >c+< a | e g+ b g+ e g+ b g+ | f+ a >c+< a e2',
    'o3 l4 a e a e | e b e b | f+ a e2',
    'l8 v9 [k h s h]4 k8 k8 s4 x4 r4',
  ], { d1: 1, d2: 2 }),
  walkup('tom', 108, [ // an old music-hall stomp
    'o4 l8 g4 b8 >d8< g4 d4 | c4 e8 g8 >c4< g4 | b8 a8 g8 f+8 g4 r4',
    'o3 l8 d4 g4 d4 g4 | e4 c4 e4 c4 | d4 d4 g4 r4',
    'o2 l4 g d g d | c g c g | d d g r',
    'l8 v9 [k r s r]4 k4 s4 s4 r4',
  ], { d1: 2, d2: 2, env1: [0.2, 0.5] }),
  walkup('jules', 128, [ // a showman's flourish, in three-quarter time
    'o5 l8 c e g >c< g e | d f a >d< a f | e g >c4< r4',
    'o4 l4 e g e | f a f | g >c< g',
    'o3 l4 c g c | d a d | e g e',
    'l4 v7 k s s | k s s | k s x',
  ], { d1: 0, d2: 1, env1: [0.4, 0.6] }),
  walkup('reuben', 116, [ // a jukebox slugger
    'o4 l8 e g a b- b4 a4 | g8 e8 d8 e8 g4 e4 | e4 r8 e8 e2',
    'o3 l8 b >d e f e d< b >d< | b-8 >d8 e8 d8< b4 g4 | b4 r8 b8 b2',
    'o2 l8 e e e e e e e e | a a a a b- b- b- b- | e4 r8 e8 e2',
    'l8 v10 [k k s r]4 k8 k8 s4 x2',
  ], { d1: 2, d2: 2 }),
  walkup('simone', 122, [ // a disco lick
    'o5 l16 e e e r e r g r a r a r >c4<< | b16 b16 b16 r b16 r >d16 r e4 e8< r8 | e8 g8 b8 >e8< e4 r4',
    'o4 l8 e r e r g r a r | b r b r >d r e r< | e g b >e4< r8 r4',
    'o2 l8 e e >e<< e >e e< e >e | e e >e< e >e<< e e >e< | e4 e4 e4 r4',
    'l16 v9 [k h s h k h s s]5 x4 r4',
  ], { d1: 2, d2: 1 }),
];
