// "Hall of Fame": Legends Circuit fight theme (original).
// B minor at 168 bpm: a noble, tragic march for the old masters. A lead that
// climbs in long notes and falls in harmonic-minor runs, rolling eighth-note
// arpeggios, a pumping octave bass, and a snare roll into every eighth bar.
// Form (16 bars): Bm G D A | Bm G Em F#7 | G A Bm Bm | Em F#7 Bm F#7, loop.

export default {
  id: 'legendsFight',
  tempo: 168,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.3, sustain: 0.65 }, vibrato: true,
      mml: `l4 v12
        o5 f+2. e8 d8 | o5 d4 e4 f+4 g4 | o5 a2 f+4 d4 | o5 e2. c+4 |
        o5 b4 a4 f+4 d4 | o5 g4. f+8 e4 d4 | o5 e8 f+8 g8 a8 b4 g4 | o5 a+2 f+2 |
        o5 b4. a8 g4 f+4 | o5 a4. g8 f+4 e4 | o5 f+8 g8 a8 b8 o6 d4 c+4 | o5 b1 |
        o5 g8 f+8 e8 d8 e4 g4 | o5 f+4 a+4 o6 c+4 e4 | o6 d2 o5 b2 | o5 a+8 b8 o6 c+8 d8 e8 d8 c+8 o5 a+8 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.05, sustain: 0.3 },
      mml: `l8 v6
        o3 [b8 >d8 f+8 b8<]2 | o3 [g8 b8 >d8 g8<]2 | o3 [d8 f+8 a8 >d8<]2 | o3 [a8 >c+8 e8 a8<]2 |
        o3 [b8 >d8 f+8 b8<]2 | o3 [g8 b8 >d8 g8<]2 | o3 [e8 g8 b8 >e8<]2 | o3 [f+8 a+8 >c+8 e8<]2 |
        o3 [g8 b8 >d8 g8<]2 | o3 [a8 >c+8 e8 a8<]2 | o3 [b8 >d8 f+8 b8<]2 | o3 [b8 >d8 f+8 b8<]2 |
        o3 [e8 g8 b8 >e8<]2 | o3 [f+8 a+8 >c+8 e8<]2 | o3 [b8 >d8 f+8 b8<]2 | o3 [f+8 a+8 >c+8 e8<]2 |`,
    },
    tri: {
      env: { decay: 0.14, sustain: 0.6 },
      mml: `l8 v15
        o1 [b8 b8 >b8< b8]2 | o2 [g8 g8 >g8< g8]2 | o2 [d8 d8 >d8< d8]2 | o2 [a8 a8 >a8< a8]2 |
        o1 [b8 b8 >b8< b8]2 | o2 [g8 g8 >g8< g8]2 | o2 [e8 e8 >e8< e8]2 | o2 [f+8 f+8 >f+8< f+8]2 |
        o2 [g8 g8 >g8< g8]2 | o2 [a8 a8 >a8< a8]2 | o1 [b8 b8 >b8< b8]2 | o1 [b8 b8 >b8< b8]2 |
        o2 [e8 e8 >e8< e8]2 | o2 [f+8 f+8 >f+8< f+8]2 | o1 [b8 b8 >b8< b8]2 | o2 [f+8 f+8 >f+8< f+8]2 |`,
    },
    noise: {
      mml: `l8 v11
        [k8 h8 s8 h8 k8 k8 s8 h8]7 | k8 s16 s16 s8 s8 s16 s16 s16 s16 x4 |
        [k8 h8 s8 h8 k8 k8 s8 h8]7 | k8 s16 s16 s8 s8 s16 s16 s16 s16 x4 |`,
    },
  },
};

// The Mirror's entrance: a thin, glassy music box that plays itself backwards
// into a low hum (non-looping).
export const mirrorEntrance = {
  id: 'mirrorEntrance',
  tempo: 100,
  loop: false,
  channels: {
    p1: { duty: 0, env: { decay: 0.2, sustain: 0.4 }, mml: 'o6 l8 v11 e8 b8 g8 e8 d+8 b8 f+8 d+8 | c8 g8 e8 c8 o5 b8 >f+8 d+8 o5 b8 | o5 e2 g2 | o5 b1' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o5 l2 v7 e2 d+2 | c2 o4 b2 | o4 g1 | o4 f+1' },
    tri: { mml: 'o2 l1 v15 e1 | a1 | c1 | o1 b1' },
    noise: { mml: 'l4 v8 x1 | r1 | x2 r2 | x1' },
  },
};
