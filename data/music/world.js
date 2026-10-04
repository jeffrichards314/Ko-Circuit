// "Floodlights": World Circuit fight theme (original).
// A stadium anthem in E minor at 156 bpm: pounding power-chord eighths, a
// big singable lead the whole stadium could chant, a lift to C and D, and a
// B7 turnaround that drags you back in.
// Form (16 bars): Em C G D Em C D B7 | C D Em Em C D B7 B7, loop.

export default {
  id: 'worldFight',
  tempo: 156,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.3, sustain: 0.65 }, vibrato: true,
      mml: `l4 v12
        o4 e4 g4 b4 o5 e4 | o5 e4 d4 c4 o4 g4 | o4 b2 a4 g4 | o4 f+2 d2 |
        o4 e4 g4 b4 o5 e4 | o5 g4 f+4 e4 c4 | o5 d4 c4 o4 b4 a4 | o4 b1 |
        o5 c4. o4 b8 a4 g4 | o4 a4. g8 f+4 d4 | o4 e8 f+8 g8 a8 b4 o5 e4 | o5 e2 o4 b2 |
        o5 c8 d8 e4 c4 o4 a4 | o5 d8 e8 f+4 d4 o4 b4 | o4 b4 o5 d+4 f+4 a4 | o5 b2 o4 b2 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.05, sustain: 0.3 },
      mml: `l8 v6
        o3 [e8 b8 >e8< b8]2 | o3 [c8 g8 >c8< g8]2 | o2 [g8 >d8 g8 d8<]2 | o3 [d8 a8 >d8< a8]2 |
        o3 [e8 b8 >e8< b8]2 | o3 [c8 g8 >c8< g8]2 | o3 [d8 a8 >d8< a8]2 | o2 [b8 >f+8 b8 f+8<]2 |
        o3 [c8 g8 >c8< g8]2 | o3 [d8 a8 >d8< a8]2 | o3 [e8 b8 >e8< b8]2 | o3 [e8 b8 >e8< b8]2 |
        o3 [c8 g8 >c8< g8]2 | o3 [d8 a8 >d8< a8]2 | o2 [b8 >f+8 b8 f+8<]2 | o2 [b8 >f+8 b8 f+8<]2 |`,
    },
    tri: {
      env: { decay: 0.15, sustain: 0.6 },
      mml: `l4 v15
        o2 e4 e4 >e4< e4 | o2 c4 c4 >c4< c4 | o2 g4 g4 >g4< g4 | o2 d4 d4 >d4< d4 |
        o2 e4 e4 >e4< e4 | o2 c4 c4 >c4< c4 | o2 d4 d4 >d4< d4 | o1 b4 b4 >b4< b4 |
        o2 c4 c4 >c4< c4 | o2 d4 d4 >d4< d4 | o2 e4 e4 >e4< e4 | o2 e4 e4 >e4< e4 |
        o2 c4 c4 >c4< c4 | o2 d4 d4 >d4< d4 | o1 b4 b4 >b4< b4 | o1 b4 >b4< b4 >b4< |`,
    },
    noise: {
      mml: `l8 v11
        [k8 h8 s8 h8 k8 k8 s8 h8]7 | k8 s16 s16 s8 s8 s16 s16 s16 s16 x4 |
        [k8 h8 s8 h8 k8 k8 s8 h8]7 | k8 s16 s16 s8 s8 s16 s16 s16 s16 x4 |`,
    },
  },
};

// Maestro Vale's entrance: a grand orchestral cadence in C minor (non-looping).
export const maestroEntrance = {
  id: 'maestroEntrance',
  tempo: 96,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.75 }, vibrato: true, mml: 'o5 l4 v12 c4 e-4 g4 >c4< | a-4 g4 f4 e-4 | d4 f4 b4 >d4< | c1' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.65 }, mml: 'o4 l4 v9 e-4 g4 >c4 e-4< | >c4 e-4< a-4 >c4< | g4 b4 >d4 f4< | e-1' },
    tri: { mml: 'o2 l4 v15 c1 | f1 | g1 | c1' },
    noise: { mml: 'l4 v10 x2 k4 k4 | k4 r4 k4 r4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x1' },
  },
};
