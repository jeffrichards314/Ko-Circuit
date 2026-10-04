// "Undisputed": the Dream Fight theme, for "Thunder" Jax Crane (original).
// C minor at 196 bpm, the fastest and heaviest theme in the game: galloping
// sixteenth arpeggios, a bass that hammers eighth-note octaves, a lead that
// swings between a defiant rising line and a storm of falling runs, and a
// snare barrage with a crash to close every eight bars.
// Form (16 bars): Cm Ab Bb G7 | Cm Ab Fm G7 | Ab Bb Cm Cm | Fm G7 Cm G7, loop.

export default {
  id: 'dreamFight',
  tempo: 196,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.28, sustain: 0.66 }, vibrato: true,
      mml: `l4 v13
        o5 c4 e-4 g4 o6 c4 | o6 c4. o5 b-8 a-4 e-4 | o5 f2 d4 o4 b-4 | o5 d2. o4 b4 |
        o5 g4 a-4 g4 e-4 | o5 c8 e-8 a-8 o6 c8 o5 b-4 a-4 | o5 a-4 g4 f4 e-4 | o5 d2 o4 g2 |
        o5 e-8 f8 g8 a-8 b-4 a-4 | o5 b-4 o6 d4 f4 d4 | o6 e-2 c2 | o6 c8 o5 b-8 g8 e-8 c4 g4 |
        o5 a-4. g8 f4 a-4 | o5 b4 o6 d4 f4 d4 | o6 c2 o5 g2 | o5 b8 o6 c8 d8 f8 e-8 d8 c8 o5 b8 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.04, sustain: 0.25 },
      mml: `l16 v6
        o4 [c16 e-16 g16 >c16<]4 | o3 [a-16 >c16 e-16 a-16<]4 | o3 [b-16 >d16 f16 b-16<]4 | o3 [g16 b16 >d16 f16<]4 |
        o4 [c16 e-16 g16 >c16<]4 | o3 [a-16 >c16 e-16 a-16<]4 | o3 [f16 a-16 >c16 f16<]4 | o3 [g16 b16 >d16 f16<]4 |
        o3 [a-16 >c16 e-16 a-16<]4 | o3 [b-16 >d16 f16 b-16<]4 | o4 [c16 e-16 g16 >c16<]4 | o4 [c16 e-16 g16 >c16<]4 |
        o3 [f16 a-16 >c16 f16<]4 | o3 [g16 b16 >d16 f16<]4 | o4 [c16 e-16 g16 >c16<]4 | o3 [g16 b16 >d16 f16<]4 |`,
    },
    tri: {
      env: { decay: 0.1, sustain: 0.6 },
      mml: `l8 v15
        o2 [c8 >c8<]4 | o1 [a-8 >a-8<]4 | o1 [b-8 >b-8<]4 | o1 [g8 >g8<]4 |
        o2 [c8 >c8<]4 | o1 [a-8 >a-8<]4 | o1 [f8 >f8<]4 | o1 [g8 >g8<]4 |
        o1 [a-8 >a-8<]4 | o1 [b-8 >b-8<]4 | o2 [c8 >c8<]4 | o2 [c8 >c8<]4 |
        o1 [f8 >f8<]4 | o1 [g8 >g8<]4 | o2 [c8 >c8<]4 | o1 [g8 >g8<]4 |`,
    },
    noise: {
      mml: `l16 v12
        [k16 h16 s16 h16 k16 k16 s16 h16 k16 h16 s16 h16 k16 k16 s16 s16]7 | [s16]8 x2 |
        [k16 h16 s16 h16 k16 k16 s16 h16 k16 h16 s16 h16 k16 k16 s16 s16]7 | [s16]8 x2 |`,
    },
  },
};

// Jax Crane's entrance: thunder rolling in, then the champion's riff (non-looping).
export const jaxEntrance = {
  id: 'jaxEntrance',
  tempo: 120,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.35, sustain: 0.7 }, vibrato: true, mml: 'o4 l8 v13 e8 e8 e8 e8 g4 a4 | b8 b8 b8 b8 o5 d4 e4 | o5 e2. d8 c8 | o4 b1' },
    p2: { duty: 1, env: { decay: 0.4, sustain: 0.6 }, mml: 'o4 l4 v9 b4 b4 o5 e4 e4 | f+4 f+4 a4 a4 | g2. f+4 | d+1' },
    tri: { mml: 'o2 l8 v15 e8 e8 e8 e8 e8 e8 e8 e8 | e8 e8 e8 e8 e8 e8 e8 e8 | c8 c8 c8 c8 c8 c8 c8 c8 | o1 b1' },
    noise: { mml: 'l4 v12 x4 k4 k4 s4 | k4 k4 k4 s4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x1' },
  },
};
