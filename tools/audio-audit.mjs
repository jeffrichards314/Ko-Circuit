// Audio audit (§12): every song and sound effect the game refers to exists, and
// every song's channels are the same length (a looping song whose channels
// differ drifts out of sync on every loop).
//   node tools/audio-audit.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMML } from '../src/engine/audio.js';
import { SONGS } from '../data/music/index.js';

const root = fileURLToPath(new URL('..', import.meta.url));
let bad = 0;
const warn = (m) => { console.log('  ! ' + m); bad++; };

// --- songs ---------------------------------------------------------------
console.log('Songs');
for (const [id, song] of Object.entries(SONGS)) {
  const lens = Object.entries(song.channels).map(([ch, d]) => [ch, parseMML(d.mml, { tempo: song.tempo, drums: ch === 'noise' }).length]);
  const max = Math.max(...lens.map(([, l]) => l));
  const beats = (l) => (l * song.tempo) / 60;
  const off = lens.filter(([, l]) => Math.abs(l - max) > 1e-6);
  console.log(`  ${id.padEnd(18)} ${String(song.tempo).padStart(3)} bpm  ${max.toFixed(1).padStart(5)}s  ${song.loop === false ? 'jingle' : 'loop'}  [${Object.keys(song.channels).join(' ')}]`);
  if (off.length) warn(`${id}: channel lengths differ (beats): ${lens.map(([c, l]) => `${c}=${beats(l)}`).join(' ')}`);
}

// --- references ----------------------------------------------------------
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p); } };
walk(join(root, 'src')); walk(join(root, 'data'));
const audioSrc = readFileSync(join(root, 'src/engine/audio.js'), 'utf8');
const SFX = new Set([...audioSrc.slice(audioSrc.indexOf('const SFX = {')).matchAll(/^\s{2}([a-zA-Z0-9]+)\(a, t/gm)].map((m) => m[1]));
const used = new Map();
const note = (name, where) => { if (!used.has(name)) used.set(name, new Set()); used.get(name).add(where.replace(root, '')); };
for (const p of files) {
  const s = readFileSync(p, 'utf8');
  for (const m of s.matchAll(/sfx(?:At)?\(\s*'([a-zA-Z0-9]+)'/g)) note(m[1], p);
  for (const m of s.matchAll(/\b(?:tell|swing|sfx|sfxLoop)\s*:\s*'([a-z][a-zA-Z0-9]*)'/g)) note(m[1], p);
  // (and any other quoted name of an effect: ternaries, helper arguments)
  for (const m of s.matchAll(/'([a-z][a-zA-Z0-9]*)'/g)) if (SFX.has(m[1]) && !p.endsWith('audio.js')) note(m[1], p);
}
console.log(`\nSound effects: ${SFX.size} defined, ${used.size} referenced`);
for (const [n, where] of used) if (!SFX.has(n)) warn(`sfx '${n}' is not defined (used in ${[...where].join(', ')})`);
const unused = [...SFX].filter((n) => !used.has(n));
if (unused.length) console.log(`  (defined but never referenced by name: ${unused.join(', ')})`);

const songRefs = new Map();
for (const p of files) {
  const s = readFileSync(p, 'utf8');
  for (const m of s.matchAll(/songs\.([a-zA-Z0-9]+)/g)) songRefs.set(m[1], p);
  for (const m of s.matchAll(/\b(?:music|fightMusic)\s*:\s*'([a-z][a-zA-Z0-9]*)'/g)) songRefs.set(m[1], p);
}
for (const [n, p] of songRefs) if (!SONGS[n]) warn(`song '${n}' is not defined (used in ${p.replace(root, '')})`);

// §12 checklist
const need = ['title', 'map', 'victory', 'defeat', 'belt', 'jog', 'endingMain', 'endingTrue'];
for (const n of need) if (!SONGS[n]) warn(`§12 song missing: ${n}`);
console.log(bad ? `\n${bad} problem(s)` : '\nall good');
process.exit(bad ? 1 : 0);
