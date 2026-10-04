// NES-style password (§8): 15 characters from 0-9 A-Z (Phase A of the Ascension). Older
// codes still work: 13-character codes (Phase 9) restore everything but the Ascension
// (Pantheon progress, whether the sky is open, Dash's Ascension fights), 12-character
// codes (Phase 7) also miss the rival fights won, and 10-character codes (Phase 2)
// everything but those and the training camp.
//
// The career state is packed as a mixed-radix number (every field only takes
// as many values as it needs), multiplied by a checksum modulus and offset by a
// checksum of the payload. The base-36 digits are then scrambled with a running
// key (every digit also mixes in the checksum digit) so neighbouring saves don't
// look alike and a typo breaks the checksum. 36^15 ~ 2^77.6; the payload uses
// ~68 bits, so about 1 random code in 800 passes the checksum (the 13-character code
// had 1 in 400; a 14-character code would only have had 1 in 4).
//
// Not encoded (NES-style): the player's name, the win/loss record, and exact
// drill scores (only the medal: a restored best is that medal's score).

import { CIRCUIT_ORDER, MAIN_PATH, RIVALS, ASC_RIVALS } from '../../data/circuits.js';
import { SKINS, HAIR_STYLES, HAIR_COLORS, TRUNKS, GLOVES, SHOES, TRAINERS, NICKNAMES } from '../../data/customization.js';
import { PERKS } from '../../data/perks.js';
import { DRILL_IDS, DRILL_MEDALS } from '../../data/drills.js';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FLAGS = ['carnivalUnlocked', 'carnivalCleared', 'undergroundUnlocked', 'undergroundCleared', 'jaxBeaten', 'nightmareCleared', 'zeroBeaten',
  'pantheonOpen', // (V4: the sky has been opened: the medal gate was passed and the Pantheon entered)
  'originBeaten', 'originTrueBeaten']; // (V5, 2026-10-04: the secret final boss beaten in the Gauntlet, and his true form beaten in Title Defense: Practice, the costume and the title)
const LEGACY_FLAGS = 7; // V1-V3 only had the first seven
const V4_FLAGS = 8;     // V4 had eight

// Field order is part of the format: only ever append (in a new format).
const V1_FIELDS = [
  ['active', CIRCUIT_ORDER.length],
  ['main', MAIN_PATH.length + 1],
  ['beaten', 6],
  ['lives', 2],                             // the low bit of lives 1..3 stored as 0..2; the high bit rides in `pending` (the training session that used to wait there is gone, 2026-10-04: a code from before it has pending=1 only right after a belt, when the lives are full, and the clamp to the circuit's own gives that back)
  ['lostHere', 2],
  ['flags', 1 << LEGACY_FLAGS],
  ['skin', SKINS.length],
  ['hair', HAIR_STYLES.length],
  ['hairColor', HAIR_COLORS.length],
  ['trunks', TRUNKS.length],
  ['gloves', GLOVES.length],
  ['shoes', SHOES.length],
  ['trainer', TRAINERS.length],
  ['nick', NICKNAMES.length],
];
const V2_FIELDS = [
  ...V1_FIELDS,
  ['medals', 4 ** DRILL_IDS.length],        // best medal per drill (none/bronze/silver/gold); perks won follow from it
  ['equipped', 1 << PERKS.length],          // bit i = PERKS[i] equipped
  ['pending', 2],                           // a training session is waiting
];

function format(digits, fields, key) {
  const space = fields.reduce((a, [, n]) => a * BigInt(n), 1n);
  const check = 36n ** BigInt(digits) / space;
  return { digits, fields, key, space, check };
}
const V1 = format(10, V1_FIELDS, [7, 29, 13, 3, 31, 19, 11, 23, 5, 17]);
const V2 = format(12, V2_FIELDS, [7, 29, 13, 3, 31, 19, 11, 23, 5, 17, 2, 27]);
// V3: the rival (§11b). `active` also covers the four rival fights (appended to
// the circuit order), and `rival` holds the fights won (bit n-1 = Dash n).
const V3_ORDER = [...CIRCUIT_ORDER, ...RIVALS];
const V3_FIELDS = [['active', V3_ORDER.length], ...V2_FIELDS.slice(1), ['rival', 1 << RIVALS.length]];
const V3 = format(13, V3_FIELDS, [7, 29, 13, 3, 31, 19, 11, 23, 5, 17, 2, 27, 14]);
// V4: the Ascension (§18). The circuit ids the Ascension will ever use are reserved here so the
// code never changes when a later phase builds them (never reorder, only append). Dash's
// Ascension fights come one after another, so their progress is a count, not a mask.
export const ASC_RESERVED_CIRCUITS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'vorgath', 'v1', 'v2', 'v3', 'zeroTrue',
  'rival5', 'rival6', 'rival7', 'rival8', 'rival9'];
export const ASC_STAGES = 19; // p1-p7, halcyon, u1-u6, vorgath, v1-v3, zeroTrue: `asc` counts the ones cleared
const V4_ORDER = [...V3_ORDER, ...ASC_RESERVED_CIRCUITS];
const V4_FIELDS = [
  ['active', V4_ORDER.length], ['main', MAIN_PATH.length + 1], ['beaten', 7],
  ...V2_FIELDS.slice(3, 5), ['flags', 1 << V4_FLAGS], ...V2_FIELDS.slice(6),
  ['rival', 1 << RIVALS.length], ['ascRival', 6], ['asc', ASC_STAGES + 1],
];
const V4 = format(15, V4_FIELDS, [7, 29, 13, 3, 31, 19, 11, 23, 5, 17, 2, 27, 14, 9, 21]);
// V5 (2026-10-04): sixteen characters. The same fields with two more flags (ORIGIN beaten, his true form beaten); every older code still works.
const V5_FIELDS = V4_FIELDS.map(([k, n]) => (k === 'flags' ? [k, 1 << FLAGS.length] : [k, n]));
const V5 = format(16, V5_FIELDS, [7, 29, 13, 3, 31, 19, 11, 23, 5, 17, 2, 27, 14, 9, 21, 25]);
const orderOf = (F) => (F === V4 || F === V5 ? V4_ORDER : F === V3 ? V3_ORDER : CIRCUIT_ORDER);

function checksum(payload, F) {
  let h = (payload * 2654435761n + 97n) % 1000003n;
  h = (h * h + payload % 7919n) % F.check;
  return h;
}

export function toFields(career) {
  const p = career.profile, T = career.training || { best: {}, equipped: [] };
  let flags = 0;
  FLAGS.forEach((f, i) => { if (career.flags && career.flags[f]) flags |= 1 << i; });
  let medals = 0;
  DRILL_IDS.forEach((g, i) => { medals += medalOf(g, (T.best || {})[g] || 0) * 4 ** i; });
  let equipped = 0;
  PERKS.forEach((k, i) => { if ((T.equipped || []).includes(k.id)) equipped |= 1 << i; });
  return {
    active: V4_ORDER.indexOf(career.circuit),
    main: career.main,
    beaten: career.beaten,
    lives: (Math.max(1, Math.min(3, career.lives)) - 1) & 1,
    lostHere: career.lostHere ? 1 : 0,
    flags,
    skin: p.skin, hair: p.hair, hairColor: p.hairColor, trunks: p.trunks, gloves: p.gloves, shoes: p.shoes, trainer: p.trainer, nick: p.nick,
    medals, equipped, pending: (Math.max(1, Math.min(3, career.lives)) - 1) >> 1,
    rival: (career.rival || 0) & ((1 << RIVALS.length) - 1),
    ascRival: ascRivalCount(career.rival || 0),
    asc: Math.max(0, Math.min(ASC_STAGES, career.asc || 0)),
  };
}
// Dash's Ascension fights won, as a count (they come in order)
function ascRivalCount(mask) {
  let n = 0;
  while (n < ASC_RIVALS.length && mask & (1 << (RIVALS.length + n))) n++;
  return n;
}

const medalOf = (g, score) => DRILL_MEDALS[g].reduce((m, v, i) => (score >= v ? i + 1 : m), 0);

export function encode(career, F = V5) {
  const f = toFields(career);
  let payload = 0n;
  for (const [k, n] of F.fields) {
    const v = f[k] | 0;
    if (v < 0 || v >= n) throw new Error(`password: ${k}=${v} out of range`);
    payload = payload * BigInt(n) + BigInt(v);
  }
  let value = payload * F.check + checksum(payload, F);
  const d = [];
  for (let i = 0; i < F.digits; i++) { d.push(Number(value % 36n)); value /= 36n; }
  // d[0] is the least significant (mostly checksum): chain the scramble from there
  let prev = 0;
  const out = d.map((x, i) => { const e = (x + prev * 7 + F.key[i] + (i ? d[0] * (i + 3) : 0)) % 36; prev = x; return e; });
  return out.reverse().map((x) => ALPHABET[x]).join('');
}

// Returns the fields, or null if the code is invalid. `training` is null for an
// old 10-character code.
export function decode(code) {
  code = String(code).toUpperCase().replace(/[^0-9A-Z]/g, '');
  const F = [V5, V4, V3, V2, V1].find((x) => x.digits === code.length) || null;
  if (!F) return null;
  const e = [...code].reverse().map((ch) => ALPHABET.indexOf(ch));
  if (e.some((x) => x < 0)) return null;
  let prev = 0;
  const d = [];
  e.forEach((x, i) => { const v = (((x - prev * 7 - F.key[i] - (i ? d[0] * (i + 3) : 0)) % 36) + 36) % 36; d.push(v); prev = v; });
  let value = 0n;
  for (let i = F.digits - 1; i >= 0; i--) value = value * 36n + BigInt(d[i]);
  const payload = value / F.check, chk = value % F.check;
  if (payload >= F.space || checksum(payload, F) !== chk) return null;
  const f = {};
  let rest = payload;
  for (let i = F.fields.length - 1; i >= 0; i--) {
    const [k, n] = F.fields[i];
    f[k] = Number(rest % BigInt(n));
    rest /= BigInt(n);
  }
  if (f.active >= orderOf(F).length || f.main > MAIN_PATH.length) return null;
  if ((F === V4 || F === V5) && f.asc > ASC_STAGES) return null;
  const flags = {};
  FLAGS.forEach((name, i) => { flags[name] = !!(f.flags & (1 << i)); });
  let training = null;
  if (F !== V1) {
    const best = {}, perks = [];
    DRILL_IDS.forEach((g, i) => {
      const m = Math.floor(f.medals / 4 ** i) % 4;
      if (m) best[g] = DRILL_MEDALS[g][m - 1];
      // silver wins the drill's first perk, gold its second
      PERKS.filter((p) => p.game === g).forEach((p, j) => { if (m >= j + 2) perks.push(p.id); });
    });
    const equipped = PERKS.filter((p, i) => f.equipped & (1 << i) && perks.includes(p.id)).map((p) => p.id).slice(0, 3);
    training = { best, perks, equipped, pending: false };
  }
  return {
    circuit: orderOf(F)[f.active],
    rival: (f.rival || 0) | (((1 << (f.ascRival || 0)) - 1) << RIVALS.length),
    asc: f.asc || 0,
    main: f.main,
    beaten: f.beaten,
    lives: (f.lives | ((f.pending || 0) << 1)) + 1,
    lostHere: !!f.lostHere,
    flags,
    training,
    profile: { skin: f.skin, hair: f.hair, hairColor: f.hairColor, trunks: f.trunks, gloves: f.gloves, shoes: f.shoes, trainer: f.trainer, nick: f.nick },
  };
}

export const PASSWORD_CHARS = ALPHABET;
// For display: slashed zeros and a gap in the middle ("CYRØT SIEØC").
// typed or pasted text -> code characters (case-insensitive; spaces, dashes and anything else dropped)
export const cleanPassword = (t) => String(t).toUpperCase().replace(/[^0-9A-Z]/g, '');
export const showChar = (ch) => (ch === '0' ? 'Ø' : ch);
// (shown in groups of four, XXXX-XXXX-XXXX-XXX: the screens draw it through src/engine/textbox.js drawPassword, which breaks the line between groups
// when the box is narrow)
export const PASSWORD_ODDS = V5.check; // 1 in PASSWORD_ODDS random codes pass the checksum
export const __testEncodeV2 = (career) => encode(career, V2); // (tools/career-test.mjs: old codes)
export const PASSWORD_LENGTH = V5.digits;
export const OLD_PASSWORD_LENGTHS = [V4.digits, V3.digits, V2.digits, V1.digits];
export const __testEncodeV4 = (career) => encode(career, V4); // (tools/career-test.mjs, save-test.mjs: the 15-letter codes of before ORIGIN)
