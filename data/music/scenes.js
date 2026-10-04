// Music for the presentation pass (spec §19 G6, original): the boss intros' own themes and the secret circuits' invitation.
// (The arrivals, ceremonies and entrances reuse the jogging, belt, Ferryman, Pantheon and Void songs and each fighter's entrance jingle.)

// Jax Crane: a stadium on its feet. E minor, thunder in the bass, a riff that will not sit down.
export const bossJax = {
  id: 'bossJax', tempo: 138,
  channels: {
    p1: { duty: 2, env: { decay: 0.3, sustain: 0.62 }, vibrato: true, mml: `o4 l8 v12
      e4 e8 e8 g4 b4 | a4 a8 a8 g4 e4 | e4 e8 e8 g4 b4 | >d2< b2 |
      >e4 e8 e8 e4 d4< | b4 b8 b8 a4 g4 | a4 a8 a8 b4 >d4< | e2. r4 |` },
    p2: { duty: 0, env: { decay: 0.05, sustain: 0.3 }, mml: `o4 l16 v5
      [e g b g]4 | [a >c e c<]4 | [e g b g]4 | [d f+ a f+]4 | [e g b g]4 | [g b >d< b]4 | [a >c e c<]4 | [b >d f+ d<]4 |` },
    tri: { env: { decay: 0.1, sustain: 0.7 }, mml: `l8 v15
      o2 [e]8 | [a]8 | [e]8 | [d]8 | [e]8 | [g]8 | [a]8 | [b]8 |` },
    noise: { mml: `l8 v10
      [k h s h k k s h]3 | k8 h8 s8 h8 s16 s16 s16 s16 s8 x8 | [k h s h k k s h]3 | s16 s16 s16 s16 s16 s16 s16 s16 x4 r4 |` },
  },
};

// ZERO: almost nothing. A long low note, one high point far away.
export const bossZero = {
  id: 'bossZero', tempo: 60,
  channels: {
    p1: { duty: 0, env: { decay: 0.6, sustain: 0.2 }, mml: 'o6 l4 v6 r1 | r1 | r2 e2 | r1 | r1 | r2. e4 | r1 | b1' },
    p2: { duty: 1, env: { decay: 0.8, sustain: 0.5 }, mml: 'o5 l1 v3 r | b | r | g | r | b | r | e' },
    tri: { env: { decay: 0.9, sustain: 0.9 }, mml: 'o2 l1 v12 e | e | c | c | e | e | a | b' },
  },
};

// Halcyon: a hymn, dawn in C major, the arpeggios shimmering under it.
export const bossHalcyon = {
  id: 'bossHalcyon', tempo: 72,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.7 }, vibrato: true, mml: 'o5 l2 v11 c e | g >c< | b g | a f | e g | >c e< | d f | c1' },
    p2: { duty: 0, env: { decay: 0.1, sustain: 0.3 }, mml: 'o4 l8 v6 [c e g e]2 | [c e g >c<]2 | [g b >d< b]2 | [f a >c< a]2 | [e a >c< a]2 | [e g >c< g]2 | [d f a f]2 | [c e g e]2' },
    tri: { env: { decay: 0.7, sustain: 0.9 }, mml: 'o2 l1 v15 c | c | g | f | a | c | g | c' },
  },
};

// Vorgath: a bell that tolls once a bar, a drone under it and a heart that will not stop. D minor, very slow.
export const bossVorgath = {
  id: 'bossVorgath', tempo: 54,
  channels: {
    p1: { duty: 1, env: { decay: 0.7, sustain: 0.8 }, mml: 'o3 l1 v9 d | d | b- | a | d | d | b- | a' },
    p2: { duty: 2, env: { decay: 0.9, sustain: 0.1 }, mml: 'o5 l4 v6 d r r r | r r r r | a r r r | r r r r | d r r r | r r r r | f r r r | r r r r' },
    tri: { env: { decay: 0.8, sustain: 0.9 }, mml: 'o1 l1 v15 d | d | b- | a | d | d | b- | a' },
    noise: { mml: 'l8 v8 [k8 r8 k8 r8 r8 r8 r8 r8]8' },
  },
};

// Dash Unbound: his rival theme, stuttering, as if the tape were failing. A minor.
export const bossDash = {
  id: 'bossDash', tempo: 104,
  channels: {
    p1: { duty: 1, env: { decay: 0.2, sustain: 0.5 }, mml: `o5 l8 v11
      a16 r16 a16 r16 a8 e8 a4 r4 | c8 e8 a4 g8 e8 d4 | a16 r16 a16 r16 a8 e8 a4 r4 | c8 e8 g4 a4 e4 |
      a16 r16 a16 r16 a8 e8 a4 r4 | c8 e8 a4 g8 e8 d4 | f16 r16 f16 r16 f8 c8 f4 r4 | e16 r16 e16 r16 e4 g+4 r4 |` },
    p2: { duty: 0, env: { decay: 0.05, sustain: 0.2 }, mml: 'o4 l8 v6 [r8 e8]4 | [r8 e8]4 | [r8 e8]4 | [r8 e8]4 | [r8 e8]4 | [r8 e8]4 | [r8 c8]4 | [r8 e8]4' },
    tri: { env: { decay: 0.2, sustain: 0.8 }, mml: 'o2 l8 v14 [a8 r8]4 | [a8 r8]4 | [a8 r8]4 | [a8 r8]4 | [a8 r8]4 | [a8 r8]4 | [f8 r8]4 | [e8 r8]4' },
    noise: { mml: 'l8 v9 [k h s h k k s h]7 | s16 s16 s16 s16 s16 s16 s16 s16 x4 r4' },
  },
};

// ZERO, true form: the whole of nothing. E minor, very wide: a deep tone, a thin high one, a slow chord between.
export const bossZeroTrue = {
  id: 'bossZeroTrue', tempo: 66,
  channels: {
    p1: { duty: 0, env: { decay: 0.5, sustain: 0.3 }, mml: 'o6 l4 v7 e r r r | r r g r | r r r r | b r r r | e r r r | r r r r | r r >c< r | r r r r' },
    p2: { duty: 2, env: { decay: 0.6, sustain: 0.6 }, mml: 'o4 l2 v4 e b | e b | c g | c g | e b | e b | a >e< | b >f+<' },
    tri: { env: { decay: 0.9, sustain: 0.9 }, mml: 'o1 l1 v13 e | e | c | c | e | e | a | b' },
  },
};

// The invitation: a music box in three-four, A minor, that does not quite resolve.
export const invitation = {
  id: 'invitation', tempo: 84,
  channels: {
    p1: { duty: 2, env: { decay: 0.15, sustain: 0.2 }, mml: 'o5 l4 v9 e a >c< | b a e | d f a | g f d | e a >c< | >e c <a | g+ b >d< | a2.' },
    p2: { duty: 0, env: { decay: 0.1, sustain: 0.3 }, mml: 'o4 l4 v5 r c e | r g g | r f a | r g b | r c e | r c e | r b >d< | r2.' },
    tri: { env: { decay: 0.3, sustain: 0.8 }, mml: 'o2 l4 v14 a r r | e r r | d r r | g r r | a r r | a r r | e r r | a2.' },
  },
};

export const SCENE_SONGS = [bossJax, bossZero, bossHalcyon, bossVorgath, bossDash, bossZeroTrue, invitation];
