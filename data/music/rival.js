// The rival's music (§12, §11b), all original and all built on one melody:
//   rivalFight      "Same Day, Different League": fights I-III. E minor, 160 bpm,
//                   a swaggering lead over a bouncing octave bass.
//   rivalShowdown   the Showdown mix for fight IV: the same melody at 184 bpm,
//                   the lead doubled an octave up on the second pulse, a
//                   sixteenth-note bass and a driving double-time kit.
//   rivalScene      the cutscene arrangement: half-time, sparse, the melody alone.
//   dashEntrance    his walk-out jingle (non-looping).
// Form (16 bars): Em C D B7 | Em C Am B7 | C D Em Em | Am B7 Em B7, loop.

const LEAD = `
  o5 e8 e8 g8 b8 o6 e4 o5 b4 | o5 c8 e8 g8 o6 c8 o5 b4 g4 | o5 a8 f+8 d8 f+8 a4. g8 | o5 f+4 d+4 o4 b4 r4 |
  o5 e8 g8 b8 o6 e8 g4 e4 | o6 e8 d8 c8 o5 b8 g4 e4 | o5 a8 b8 o6 c8 e8 d4 c4 | o5 b2 a8 g8 f+8 d+8 |
  o5 g4 e8 g8 o6 c4 c4 | o6 d4. c8 o5 b8 a8 f+4 | o5 g4 b4 o6 e4 g4 | o6 f+8 e8 d+8 e8 o5 b2 |
  o5 a8 o6 c8 e8 a8 g4 e4 | o6 f+8 d+8 o5 b8 o6 d+8 f+4 a4 | o6 g4. f+8 e4 o5 b4 | o5 a8 b8 o6 c8 o5 b8 a8 g8 f+8 d+8 |`;
const CHORDS = ['em', 'c', 'd', 'b7', 'em', 'c', 'am', 'b7', 'c', 'd', 'em', 'em', 'am', 'b7', 'em', 'b7'];
const ARP = { em: 'o4 e g b >e<', c: 'o4 c e g >c<', d: 'o4 d f+ a >d<', b7: 'o3 b >d+ f+ a<', am: 'o3 a >c e a<' };
const ROOT = { em: 'e', c: 'c', d: 'd', b7: 'b', am: 'a' };
const ROOT_OCT = { em: 2, c: 2, d: 2, b7: 1, am: 1 };

// one bar of arpeggio in the given note length, repeated to fill 4 beats
const arp = (ch, len) => {
  const [o, ...notes] = ARP[ch].split(' ');
  const body = notes.map((n) => n.replace(/^([<>]?)([a-g][+]?)([<>]?)$/, `$1$2${len}$3`)).join(' ');
  return `${o} [${body}]${len / 4}`;
};
const bass = (ch, len) => `o${ROOT_OCT[ch]} [${ROOT[ch]}${len} >${ROOT[ch]}${len}<]${len / 2}`;
const bars = (f) => CHORDS.map(f).join(' | ') + ' |';

export const rivalFight = {
  id: 'rivalFight',
  tempo: 160,
  channels: {
    p1: { duty: 1, env: { decay: 0.3, sustain: 0.6 }, vibrato: true, mml: `l8 v12 ${LEAD}` },
    p2: { duty: 0, env: { decay: 0.05, sustain: 0.3 }, mml: `v6 ${bars((c) => arp(c, 16))}` },
    tri: { env: { decay: 0.12, sustain: 0.6 }, mml: `v15 ${bars((c) => bass(c, 8))}` },
    noise: { mml: `v10 [k8 h8 s8 h8 k8 k8 s8 h8]15 | k8 s16 s16 s8 s16 s16 s8 s8 x4 |` },
  },
};

export const rivalShowdown = {
  id: 'rivalShowdown',
  tempo: 184,
  channels: {
    p1: { duty: 2, env: { decay: 0.26, sustain: 0.7 }, vibrato: true, mml: `l8 v13 ${LEAD}` },
    // the lead again an octave up, thinner: the "remix" doubling
    p2: { duty: 0, env: { decay: 0.2, sustain: 0.45 }, mml: `l8 v7 ${LEAD.replace(/o(\d)/g, (m, d) => `o${+d + 1}`)}` },
    tri: { env: { decay: 0.08, sustain: 0.55 }, mml: `v15 ${bars((c) => bass(c, 16))}` },
    noise: { mml: `v11 [[k16 h16 s16 h16 k16 k16 s16 h16]2]15 | k16 s16 s16 s16 k16 s16 s16 s16 s16 s16 s16 s16 x4 |` },
  },
};

export const rivalScene = {
  id: 'rivalScene',
  tempo: 88,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.5 }, vibrato: true, mml: `l8 v9 ${LEAD.split('|').slice(0, 8).join('|')}|` },
    tri: { env: { decay: 0.3, sustain: 0.5 }, mml: `v12 ${CHORDS.slice(0, 8).map((c) => `o${ROOT_OCT[c]} ${ROOT[c]}2 ${ROOT[c]}2`).join(' | ')} |` },
    noise: { mml: `v6 [k4 h4 s4 h4]8 |` },
  },
};

export const dashEntrance = {
  id: 'dashEntrance',
  tempo: 132,
  loop: false,
  channels: {
    p1: { duty: 1, env: { decay: 0.4, sustain: 0.7 }, vibrato: true, mml: 'o5 l8 v12 e8 g8 b8 o6 e8 d+4 e4 | o5 c8 e8 g8 b8 a4 g4 | o5 a8 b8 o6 c8 d8 d+4 f+4 | o6 e2 r2' },
    p2: { duty: 2, env: { decay: 0.4, sustain: 0.6 }, mml: 'o4 l4 v9 g4 b4 g4 b4 | e4 g4 e4 g4 | f+4 a4 f+4 a4 | b2 r2' },
    tri: { mml: 'o2 l4 v15 e4 e4 e4 e4 | c4 c4 c4 c4 | d4 d4 o1 b4 b4 | o2 e2 r2' },
    noise: { mml: 'l4 v10 k4 s4 k8 k8 s4 | k4 s4 k8 k8 s4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x2 r2' },
  },
};
