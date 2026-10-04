// "Ballroom Blitz Waltz": Continental Circuit fight theme (original).
// A dark Viennese waltz in G minor at 192 bpm (3/4): oom-pah-pah under a
// sweeping, slightly sinister lead that climbs through the hall's chandeliers,
// then turns to E-flat before falling back to G minor.
// Form (16 bars): Gm Gm Cm Cm D7 D7 Gm D7 | Gm Gm Eb Eb Cm D7 Gm Gm, loop.

export default {
  id: 'continentalFight',
  tempo: 192,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.25, sustain: 0.6 }, vibrato: true,
      mml: `l4 v12
        o4 d4 g4 b-4 | o5 d2. | o4 c4 e-4 g4 | o5 c2 o4 b-4 | o4 a4 f+4 a4 | o5 c4 o4 a4 f+4 | o4 g4 b-8 a8 g4 | o4 f+2 d4 |
        o4 d4 g4 b-4 | o5 d4 f4 d4 | o4 e-4 g4 b-4 | o5 e-2 d4 | o5 c8 d8 e-4 c4 | o4 a4 f+4 a4 | o4 g4 d4 b-4 | o4 g2. |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.3 },
      mml: `o4 l4 v7
        r b- b- | r b- b- | r g g | r g g | r f+ f+ | r f+ f+ | r b- b- | r f+ f+ |
        r b- b- | r b- b- | r g g | r g g | r g g | r f+ f+ | r b- b- | r b- b- |`,
    },
    tri: {
      env: { decay: 0.2, sustain: 0.6 },
      mml: `l4 v15
        o2 g4 r2 | o2 g4 r2 | o3 c4 r2 | o3 c4 r2 | o3 d4 r2 | o3 d4 r2 | o2 g4 r2 | o3 d4 r2 |
        o2 g4 r2 | o2 g4 r2 | o3 e-4 r2 | o3 e-4 r2 | o3 c4 r2 | o3 d4 r2 | o2 g4 r2 | o2 g4 o3 d4 o2 g4 |`,
    },
    noise: {
      mml: `l4 v10
        [k4 h4 h4]7 | k4 s8 s8 s4 |
        [k4 h4 h4]7 | k4 s8 s8 x4 |`,
    },
  },
};

// The Baron's entrance: a baroque fencing fanfare in D (non-looping).
export const baronEntrance = {
  id: 'baronEntrance',
  tempo: 120,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.35, sustain: 0.7 }, vibrato: true, mml: 'o5 l8 v12 d8 r16 d16 d8 a8 >d4< a4 | f+8 e8 d8 c+8 d4 a4 | b8 a8 g8 f+8 e8 d8 c+8 e8 | d2 r2' },
    p2: { duty: 1, env: { decay: 0.35, sustain: 0.6 }, mml: 'o4 l8 v8 f+8 r16 f+16 f+8 >c+8 f+4 c+4< | a8 g8 f+8 e8 f+4 >c+4< | g8 f+8 e8 d8 c+8 <b8 a8 >c+8 | f+2 r2' },
    tri: { mml: 'o2 l4 v15 d a d a | d a d f+ | g a a a | d2 r2' },
    noise: { mml: 'l8 v11 x4 k8 k8 s4 s4 | k8 k8 s4 k8 k8 s4 | k8 s8 k8 s8 s16 s16 s16 s16 s4 | x2 r2' },
  },
};
