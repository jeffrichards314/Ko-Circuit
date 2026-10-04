// "Victory Lap": Grand Prix fight theme (original).
// F# minor at 184 bpm: a racing anthem for the biggest crowd in the game.
// Sixteenth-note arpeggios revving underneath, an octave-jumping bass that
// never lets off the throttle, a lead that surges up and over like a
// last-lap overtake, and a crash every eight bars.
// Form (16 bars): F#m D E C#7 | F#m D Bm C#7 | D E F#m F#m | Bm C#7 F#m C#7, loop.

export default {
  id: 'grandprixFight',
  tempo: 184,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.28, sustain: 0.62 }, vibrato: true,
      mml: `l4 v12
        o5 c+4 f+4 a4 f+4 | o5 a4 f+4 d4 f+4 | o5 g+2 b4 g+4 | o5 g+4. f8 g+4 c+4 |
        o5 f+8 g+8 a8 b8 o6 c+4 o5 a4 | o5 f+8 a8 o6 d8 c+8 o5 b4 a4 | o5 b4 a4 f+4 d4 | o5 c+2 f2 |
        o5 a8 b8 o6 c+8 d8 e4 d4 | o6 e4 d4 c+4 o5 b4 | o6 c+2 o5 a4 f+4 | o5 f+1 |
        o5 d8 f+8 b8 o6 d8 f+4 d4 | o6 c+4 f4 g+4 f4 | o6 f+2 c+2 | o5 g+8 f8 g+8 b8 o6 c+8 o5 b8 g+8 f8 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.04, sustain: 0.25 },
      mml: `l16 v6
        o4 [f+16 a16 >c+16 f+16<]4 | o4 [d16 f+16 a16 >d16<]4 | o4 [e16 g+16 b16 >e16<]4 | o4 [c+16 f16 g+16 b16]4 |
        o4 [f+16 a16 >c+16 f+16<]4 | o4 [d16 f+16 a16 >d16<]4 | o3 [b16 >d16 f+16 b16<]4 | o4 [c+16 f16 g+16 b16]4 |
        o4 [d16 f+16 a16 >d16<]4 | o4 [e16 g+16 b16 >e16<]4 | o4 [f+16 a16 >c+16 f+16<]4 | o4 [f+16 a16 >c+16 f+16<]4 |
        o3 [b16 >d16 f+16 b16<]4 | o4 [c+16 f16 g+16 b16]4 | o4 [f+16 a16 >c+16 f+16<]4 | o4 [c+16 f16 g+16 b16]4 |`,
    },
    tri: {
      env: { decay: 0.12, sustain: 0.6 },
      mml: `l8 v15
        o2 [f+8 >f+8<]4 | o2 [d8 >d8<]4 | o2 [e8 >e8<]4 | o2 [c+8 >c+8<]4 |
        o2 [f+8 >f+8<]4 | o2 [d8 >d8<]4 | o1 [b8 >b8<]4 | o2 [c+8 >c+8<]4 |
        o2 [d8 >d8<]4 | o2 [e8 >e8<]4 | o2 [f+8 >f+8<]4 | o2 [f+8 >f+8<]4 |
        o1 [b8 >b8<]4 | o2 [c+8 >c+8<]4 | o2 [f+8 >f+8<]4 | o2 [c+8 >c+8<]4 |`,
    },
    noise: {
      mml: `l16 v11
        [k16 h16 h16 h16 s16 h16 k16 h16 k16 h16 h16 h16 s16 h16 k16 s16]7 | k8 s16 s16 s16 s16 s16 s16 x2 |
        [k16 h16 h16 h16 s16 h16 k16 h16 k16 h16 h16 h16 s16 h16 k16 s16]7 | k8 s16 s16 s16 s16 s16 s16 x2 |`,
    },
  },
};

// King Karver's entrance: a slow royal fanfare in D (non-looping).
export const karverEntrance = {
  id: 'karverEntrance',
  tempo: 92,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.75 }, vibrato: true, mml: 'o5 l8 v12 d4. d8 f+4 a4 | b4. a8 g4 f+4 | e4 f+8 g8 a4 o6 d4 | o6 d1' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o4 l4 v9 f+4 f+4 a4 >d4< | g4 g4 e4 d4 | c+4 d4 e4 f+4 | f+1' },
    tri: { mml: 'o2 l4 v15 d4 d4 d4 d4 | g4 g4 g4 g4 | a4 a4 a4 a4 | d1' },
    noise: { mml: 'l4 v10 k4 s8 s8 k4 s4 | k4 s8 s8 k4 s4 | k8 k8 s8 s8 s16 s16 s16 s16 s4 | x1' },
  },
};
