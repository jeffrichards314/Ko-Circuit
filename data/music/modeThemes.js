// The fight themes of the post-game modes (spec §6, §12), original, generated from small tables so the five divisions and five intensities stay in step.
//
//   tdFight<Division>      Title Defense: the championship hall's anthem. Brass-bright pulse leads over a marching bass and a big backbeat: a
//                          fanfare in the Classic (C major), higher and brighter in the Pantheon (D major, a quicker arpeggio), slow and
//                          heavy in the Underworld (D minor, a drone), jagged and glitching in the Void (tritones, a stuttering hat), and the
//                          Combined's is all four of them in turn, two bars of each.
//   gFight<Division><0-4>  the Gauntlet's: one song in five intensities that the run climbs (src/screens/fight.js picks the step from how far
//                          through the run you are). Step 0 is a bass line and a heartbeat of drums; each step adds a voice and a quicker pulse
//                          (the arpeggio, the lead, the double-time hat, the octave-doubled lead and the crash) and the tempo climbs with it.
//                          All five steps of a division share their notes, so the song seems to grow rather than change.
// Every channel of a song is exactly eight bars of four beats (tools/audio-audit.mjs).
const NAMES = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
// a line of notes as MML: entries are [semitone from C0 | null, length] ('8', '4', '2', '4.'...), octave commands only when they change
function line(entries) {
  let oct = -1, out = '';
  for (const [s, len] of entries) {
    if (s == null) { out += `r${len} `; continue; }
    const o = Math.floor(s / 12);
    if (o !== oct) { out += `o${o} `; oct = o; }
    out += `${NAMES[((s % 12) + 12) % 12]}${len} `;
  }
  return out.trim();
}
const CHORD = { M: [0, 4, 7], m: [0, 3, 7], t: [0, 6, 7], d: [0, 3, 6] };
// the progressions: eight bars of [root semitone from C, chord kind]
const PROG = {
  classic: [[0, 'M'], [5, 'M'], [7, 'M'], [0, 'M'], [9, 'm'], [5, 'M'], [7, 'M'], [0, 'M']],
  pantheon: [[2, 'M'], [7, 'M'], [9, 'M'], [2, 'M'], [11, 'm'], [7, 'M'], [9, 'M'], [2, 'M']],
  underworld: [[2, 'm'], [2, 'm'], [10, 'M'], [9, 'M'], [2, 'm'], [7, 'm'], [10, 'M'], [9, 'M']],
  void: [[0, 't'], [1, 't'], [6, 'd'], [5, 't'], [0, 't'], [8, 'd'], [6, 't'], [11, 'd']],
};
// the lead's rhythm for a bar, as [chord tone index (0 root, 1 third, 2 fifth, 3 the octave), length] (two shapes a division alternates)
const LEAD = {
  classic: [[[0, '8'], [0, '8'], [2, '4'], [3, '4.'], [2, '8']], [[2, '8'], [2, '8'], [3, '4'], [2, '4'], [0, '4']]],
  pantheon: [[[0, '8'], [1, '8'], [2, '8'], [3, '8'], [2, '4'], [3, '4']], [[3, '4.'], [2, '8'], [1, '4'], [0, '4']]],
  underworld: [[[0, '4.'], [0, '8'], [1, '4'], [0, '4']], [[2, '4.'], [1, '8'], [0, '2']]],
  void: [[[0, '16'], [1, '16'], [0, '16'], [2, '16'], [3, '8'], [1, '8'], [2, '4'], [0, '4']], [[3, '8'], [3, '16'], [2, '16'], [1, '8'], [0, '8'], [2, '4'], [1, '4']]],
};
const TEMPO = { classic: 112, pantheon: 124, underworld: 88, void: 132 };
const KEYS = Object.keys(PROG);
const tonesOf = (root, kind) => [...CHORD[kind].map((x) => root + x), root + 12];

// one voice's eight bars for a division (`bars` picks which bars of the progression, for the Combined's medley)
function voices(div, bars = [0, 1, 2, 3, 4, 5, 6, 7]) {
  const P = PROG[div], L = LEAD[div];
  const bass = [], arp = [], lead = [], leadHi = [];
  bars.forEach((b, n) => {
    const [root, kind] = P[b], T = tonesOf(root, kind);
    const r = 24 + root; // the bass: octave 2
    if (div === 'underworld') bass.push([r, '2'], [r, '4'], [r + 7, '4']);
    else if (div === 'void') bass.push([r, '8'], [null, '8'], [r, '8'], [r + 6, '8'], [r, '8'], [null, '8'], [r + 1, '8'], [r, '8']);
    else bass.push([r, '8'], [r, '8'], [r + 12, '8'], [r, '8'], [r, '8'], [r + 12, '8'], [r + 7, '8'], [r, '8']);
    // the arpeggio: octave 4 up and down the chord
    const A = T.map((x) => x + 48), pat = div === 'underworld' ? [0, 2, 1, 2] : [0, 1, 2, 3, 2, 1, 2, 1];
    for (const i of pat) arp.push([A[i], div === 'underworld' ? '4' : '8']);
    // the lead: octave 5 on the chord's tones
    const shape = L[(b + n) & 1];
    for (const [i, len] of (b === 7 || n === bars.length - 1) && div !== 'void' ? [[0, '4'], [2, '4'], [3, '2']] : shape) lead.push([T[i] + 60, len]);
    for (const [i, len] of shape) leadHi.push([T[i] + 72, len]);
  });
  return { bass, arp, lead, leadHi };
}
// the drum bar by intensity (0-4): kick k, snare s, hat h, crash x, in eighths (or sixteenths for the double-time hat)
const DRUMS = {
  classic: ['k r r r s r r r', 'k r h r s r h r', 'k h s h k h s h', 'k h s h k k s h', 'k h s h k k s x'],
  pantheon: ['k r r r s r r r', 'k r h r s r h r', 'k h s h k h s h', 'k h s s k h s h', 'k h s h k k s x'],
  underworld: ['k r r r s r r r', 'k r r h s r r h', 'k r h r s r k h', 'k r k r s h k h', 'k r k r s k k x'],
  void: ['k r h r s r r h', 'k h r h s r h h', 'k h s h k r s h', 'k s h s k h s s', 'k s k s s k s x'],
};
const drumBar = (div, tier) => DRUMS[div][tier].split(' ').map((c) => (c === 'r' ? 'r8' : `${c}8`)).join(' ');
const drums = (div, tier, nBars = 8) => {
  const bar = drumBar(div, tier);
  let out = '';
  for (let b = 0; b < nBars; b++) out += (b === nBars - 1 && tier >= 2 ? bar.replace(/ [khsr]8$/, ' x8') : bar) + ' | ';
  return out;
};
const doubleHats = (nBars = 8) => `l16 v5 ${'h h h h h h h h h h h h h h h h | '.repeat(nBars)}`;

const CH = {
  lead: { duty: 2, env: { decay: 0.3, sustain: 0.6 }, vibrato: true },
  arp: { duty: 0, env: { decay: 0.08, sustain: 0.25 } },
  tri: { env: { decay: 0.5, sustain: 0.9 } },
};

// ------------------------------------------------------------------------------------------------ Title Defense
function tdSong(div) {
  const medley = div === 'combined';
  const parts = medley ? KEYS.map((k) => ({ k, v: voices(k, [0, 1, 2, 3, 4, 5, 6, 7].slice(0, 8)) })) : [{ k: div, v: voices(div) }];
  // (the medley: two bars of each division's anthem in turn, four times through = eight bars... of each 2 bars)
  let bass, arp, lead, dr;
  if (medley) {
    const two = KEYS.map((k) => voices(k, [0, 1]));
    bass = two.flatMap((v) => v.bass); arp = two.flatMap((v) => v.arp); lead = two.flatMap((v) => v.lead);
    dr = KEYS.map((k) => drums(k, 3, 2)).join('');
  } else { bass = parts[0].v.bass; arp = parts[0].v.arp; lead = parts[0].v.lead; dr = drums(div, 3); }
  const t = medley ? 112 : TEMPO[div];
  return {
    id: `tdFight${div[0].toUpperCase()}${div.slice(1)}`, tempo: t,
    channels: {
      p1: { ...CH.lead, mml: `l8 v11 ${line(lead)}` },
      p2: { ...CH.arp, mml: `l8 v6 ${line(arp)}` },
      tri: { ...CH.tri, mml: `l8 v15 ${line(bass)}` },
      noise: { mml: `l8 v10 ${dr}` },
    },
  };
}

// ------------------------------------------------------------------------------------------------ the Gauntlet, five intensities
function gSong(div, tier) {
  const medley = div === 'combined';
  const base = medley ? 'underworld' : div;
  const V = voices(base);
  const t = (medley ? 100 : TEMPO[div]) - 8 + tier * 7;
  const ch = { tri: { ...CH.tri, mml: `l8 v15 ${line(V.bass)}` }, noise: { mml: `l8 v${8 + (tier >> 1)} ${drums(base, tier)}${tier >= 3 ? '' : ''}` } };
  if (tier >= 1) ch.p2 = { ...CH.arp, mml: `l8 v6 ${line(V.arp)}` };
  if (tier >= 2) ch.p1 = { ...CH.lead, duty: tier >= 4 ? 1 : 2, mml: `l8 v${9 + (tier >> 1)} ${line(tier >= 4 ? V.leadHi.map((e) => e) : V.lead)}` };
  if (tier >= 4) ch.p2 = { ...CH.arp, duty: 1, mml: `l8 v7 ${line(V.arp.map(([s, l]) => [s + 12, l]))}` };
  // (the double-time hat rides on top of the drum channel's own bars: a fourth voice in the noise channel is not possible, so it replaces the hat bars)
  if (tier >= 3) ch.noise = { mml: `l8 v${10} ${drums(base, tier)}` };
  return { id: `gFight${div[0].toUpperCase()}${div.slice(1)}${tier}`, tempo: t, channels: ch };
}
void doubleHats;

export const MODE_SONGS = {};
for (const div of [...KEYS, 'combined']) {
  const s = tdSong(div); MODE_SONGS[s.id] = s;
  for (let tier = 0; tier < 5; tier++) { const g = gSong(div, tier); MODE_SONGS[g.id] = g; }
}
export const tdSongId = (div) => `tdFight${div[0].toUpperCase()}${div.slice(1)}`;
// the step of a Gauntlet run's theme: 0 on the first fight, 4 on the last
export const gSongId = (div, idx, total) => `gFight${div[0].toUpperCase()}${div.slice(1)}${Math.max(0, Math.min(4, Math.floor((5 * idx) / Math.max(1, total))))}`;
