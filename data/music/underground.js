// "Cage Match": Underground Circuit fight theme (original).
// E Phrygian at 172 bpm, the dirtiest theme in the game: a grinding
// root-and-flat-second riff, a bass that stomps on the downbeat and slides up
// the octave, a thin nasal lead, clanking hats like chain-link and a crash at
// the top of every half. The flat second (F over E) is the whole mood.
// Form (16 bars): Em Em F F | C Am Dm Em | Em G C Am | Em B F Em, loop.

export default {
  id: 'undergroundFight',
  tempo: 172,
  channels: {
    p1: {
      duty: 0, env: { decay: 0.22, sustain: 0.6 }, vibrato: true,
      mml: `v12
        o4 e8 e8 f4 e8 d8 e4 | o4 g8 f8 e8 d8 e2 | o4 e8 e8 f4 g8 a8 b-4 | o4 a8 g8 f8 e8 f2 |
        o5 c4 o4 b8 a8 b4 g4 | o4 a4 g8 f8 e2 | o4 f8 g8 a8 b-8 a4 g4 | o4 e1 |
        o5 e4 d8 e8 f4 e4 | o5 d8 c8 o4 b8 a8 b2 | o5 c4 d4 e8 f8 e4 | o5 d4 c8 o4 b8 a2 |
        o4 b8 b8 o5 c4 o4 b8 a8 g4 | o4 f+8 g8 a8 b8 o5 c4 o4 b4 | o4 a8 g8 f8 e8 f4 d4 | o4 e2. r4 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.04, sustain: 0.2 },
      mml: `l8 v6
        o3 [e8 b8]4 | o3 [e8 b8]4 | o3 [f8 >c8<]4 | o3 [f8 >c8<]4 |
        o3 [c8 g8]4 | o3 [a8 >e8<]4 | o3 [d8 a8]4 | o3 [e8 b8]4 |
        o3 [e8 b8]4 | o3 [g8 >d8<]4 | o3 [c8 g8]4 | o3 [a8 >e8<]4 |
        o3 [e8 b8]4 | o3 [b8 >f+8<]4 | o3 [f8 >c8<]4 | o3 [e8 b8]4 |`,
    },
    tri: {
      env: { decay: 0.12, sustain: 0.55 },
      mml: `l8 v15
        o2 [e8 e8 >e8< e8]2 | o2 [e8 e8 >e8< e8]2 | o2 [f8 f8 >f8< f8]2 | o2 [f8 f8 >f8< f8]2 |
        o2 [c8 c8 >c8< c8]2 | o1 [a8 a8 >a8< a8]2 | o2 [d8 d8 >d8< d8]2 | o2 [e8 e8 >e8< e8]2 |
        o2 [e8 e8 >e8< e8]2 | o2 [g8 g8 >g8< g8]2 | o2 [c8 c8 >c8< c8]2 | o1 [a8 a8 >a8< a8]2 |
        o2 [e8 e8 >e8< e8]2 | o1 [b8 b8 >b8< b8]2 | o2 [f8 f8 >f8< f8]2 | o2 [e8 e8 >e8< e8]2 |`,
    },
    noise: {
      mml: `v11
        x8 h8 s8 h8 k8 k8 s8 h8 | [k8 h8 s8 h8 k8 k8 s8 h8]6 | k8 h8 s8 s8 s16 s16 s16 s16 s8 s8 |
        x8 h8 s8 h8 k8 k8 s8 h8 | [k8 h8 s8 h8 k8 k8 s8 h8]6 | s8 s8 s8 s8 s16 s16 s16 s16 x4 |`,
    },
  },
};

// The Warden's entrance: a cell-block siren, a guard's whistle, then a heavy
// march on the flat second (non-looping).
export const wardenEntrance = {
  id: 'wardenEntrance',
  tempo: 108,
  loop: false,
  channels: {
    p1: { duty: 1, env: { decay: 0.4, sustain: 0.7 }, mml: 'o5 l4 v11 c+2 o4 a2 | o5 c+2 o4 a2 | o4 e8 e8 f4 e8 e8 f4 | o4 e8 f8 g8 f8 e2' },
    p2: { duty: 2, env: { decay: 0.5, sustain: 0.5 }, mml: 'o4 l2 v6 a e | a e | o3 b4 >c4< b4 >c4< | o3 b4 >c4< b2' },
    tri: { mml: 'o2 l4 v15 e r e r | e r e r | e e f f | e f e2' },
    noise: { mml: 'l4 v11 r1 | r2 x2 | k k s k | k8 k8 s8 s8 x2' },
  },
};
