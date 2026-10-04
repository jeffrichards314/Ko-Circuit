// ORIGIN's three scenes (2026-10-04), hand-drawn and hosted by the cutscene engine (src/scene/legacy.js), each in full the first time (`noSkipFirst`):
//   OriginIntroScreen    the door opens: the Beginning forms (fragments of every arena, a ring, a column of light), ORIGIN takes shape in it, his halo of belts lights, his
//                        name is shown (the first time it is shown anywhere). args { which: 'g' | 't' }: the true form's is white-gold, its halo a ring of fire
//   OriginVictoryScreen  ORIGIN kneels, the belts of his halo fall and circle you, the fragments settle into place. "THERE'S ONE MORE OF ME." The door of Title Defense
//                        will answer a question now (records.origin.seen.hint)
//   OriginTrueVictoryScreen  the craziest scene in the game: the whole world assembles round the ring piece by piece, every fighter in the game fills the crowd (the freed
//                        Hollowed and Dash among them), ORIGIN hands you the Origin Belt, and a secret credits roll plays over a montage of every fighter
import { talkTick } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { drawBlock } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { fighterSprites, paletteFor } from '../engine/spriteCache.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { EVERYONE } from '../save/records.js';
import { PORTRAITS } from '../../data/sprites/portraits.js';
import { HOLLOWED_COLORS, CRYSTAL_ORDER } from '../../data/fighters/void/crystals.js';
import { BELTS, beltSprite } from '../scene/belts.js';
import { drawHalo } from '../fight/asc/originFx.js';
import { speak, youOf, dashOf } from './void.js';
import { saveRecords } from '../save/records.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const W = c32(31, 31, 31), BLACK = c32(0, 0, 1);
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const BELT_IDS = Object.keys(BELTS);
const fam = (id) => { const B = BELTS[id]; return c32(...B.strap[1]); };

// ORIGIN as a speaker
function originSpeaker(which) {
  const d = FIGHTERS[which === 'g' ? 'origin' : 'originTrue'], p = paletteFor(which === 'g' ? 'origin.z0' : 'originTrue');
  return { portrait: PORTRAITS[d.id](p), pal: p.u32, name: 'ORIGIN', col: c32(31, 28, 10) };
}
const disc = (f, x, y, r, col) => { for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); f.rect(x - w, y + j, w * 2 + 1, 1, col); } };
// a floating slab (a fragment of an arena), tinted by its belt
function slab(f, x, y, w, h, id, lit = 0) {
  const hi = fam(id), lo = c32(...BELTS[id].strap[2]);
  x = Math.round(x); y = Math.round(y);
  if (lit) disc(f, x, y - 1, w + 3, lit > 0.5 ? W : hi);
  for (let j = -h; j <= 0; j++) { const k = 1 + j / h, half = Math.round(w * k); f.rect(x - half, y + j, half * 2 + 1, 1, j < -h * 0.5 ? hi : lo); }
  f.rect(x - w, y + 1, w * 2 + 1, 2, lo);
  for (let j = 0; j < 4; j++) { const half = Math.max(0, Math.round(w * (1 - j / 4) * 0.8)); f.rect(x - half, y + 3 + j, half * 2 + 1, 1, j & 1 ? lo : hi); }
}
const ring = (f, t, a = 1) => {
  for (let j = 0; j < 30; j++) for (let x = 0; x < 256; x++) { if (bayer(x, 160 + j) > a) continue; const dx = (x - 128) / 118, dy = j / 28; if (dx * dx + dy * dy < 1) f.px(x, 160 + j, j < 3 ? W : j % 6 < 3 ? c32(27, 22, 10) : c32(22, 17, 7)); }
  for (let q = 0; q < 90; q++) { const A = (q / 90) * Math.PI * 2; if (bayer(q, 5) < a) f.px(Math.round(128 + Math.cos(A) * 96), Math.round(176 + Math.sin(A) * 11), W); }
  void t;
};
const sky = (f, k = 1) => { for (let y = 0; y < 224; y++) { const u = Math.floor(y / 14) / 16; f.rect(0, y, 256, 1, c32(Math.round((2 + 28 * u * u) * k), Math.round((1 + 22 * u * u) * k), Math.round((5 + 6 * u - 5 * u * u) * k))); } };

class OriginBase {
  constructor(game, args = {}) {
    this.g = game; this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    this.which = (args.which === 't' || args.legacyArgs && args.legacyArgs.which === 't') ? 't' : 'g';
    this.gold = this.which === 't';
    this.bank = fighterSprites(this.gold ? 'originTrue' : 'origin');
    this.you = youOf(game); this.ori = originSpeaker(this.which);
    this.R = rnd(this.gold ? 99 : 33);
  }
  pal(n = null) { return paletteFor(this.gold ? (n && (this.t >> 3) % 7 === 0 ? 'originTrue.fire' : 'originTrue') : `origin.z${n ?? Math.floor(this.t / 20) % 12}`).u32; }
  talk(I, A, lines, then) {
    if (this.line >= 0) {
      if (talkTick(this, lines[this.line][1], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= lines.length) then(); }
      return true;
    }
    return false;
  }
  drawOri(f, x, y, pose, k = 1, scale = 1, dissolve = 1) {
    const s = this.bank.get(pose), pal = this.pal();
    if (dissolve < 1) {
      const ox = Math.round(x) - s.ax * scale, oy = Math.round(y) - s.ay * scale;
      for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) { const v = s.data[j * s.w + i]; if (!v) continue; if (bayer(i + ox, j + oy) < dissolve) f.px(Math.round(ox + i * scale), Math.round(oy + j * scale), pal[v]); }
    } else f.blit(s, x, y, pal, { scale });
    void k;
  }
}

// ============================================================================================================================ the intro
export class OriginIntroScreen extends OriginBase {
  constructor(game, args = {}) {
    super(game, args);
    this.T = { frag: 90, ring: 230, col: 330, form: 440, halo: 600, name: 720, talk: 800 };
    this.lines = this.gold
      ? [['o', 'YOU BEAT THE FIRST OF ME. THE FIRST OF ME WAS THE EASY PART.'], ['o', 'I AM THE ONE WHO THREW IT. AND THE ONE WHO WILL NOT BE THROWN AGAIN.'], ['o', 'SEE WHERE EVERY PUNCH WENT. THEN SEE WHERE IT CAME FROM.']]
      : [['o', 'I THREW THE FIRST PUNCH. THEN EVERYONE ELSE LEARNED HOW.'], ['o', 'EVERY FIGHTER YOU HAVE FACED, EVERY BELT YOU HAVE WON, WAS A COPY OF SOMETHING I DID ONCE.'], ['o', 'ZERO WAS ONLY MY SHADOW. COME, AND SEE WHERE IT STARTED.']];
    this.frags = Array.from({ length: 36 }, (_, i) => ({ id: BELT_IDS[i % BELT_IDS.length], a: this.R() * 6.28, r: 60 + this.R() * 110, y: 20 + this.R() * 90, w: 6 + Math.floor(this.R() * 10), s: 0.004 + this.R() * 0.008 }));
  }
  enter() { this.g.audio.play(this.g.songs.originIntro); this.g.audio.sfx('originGather'); }
  update() {
    const I = this.g.input, A = this.g.audio, T = this.T;
    if (this.talk(I, A, this.lines, () => { this.done = this.t; })) return;
    this.t++;
    const t = this.t;
    if (t === T.ring) A.sfx('rumble');
    if (t === T.form) A.sfx('originFlare');
    if (t === T.name) A.sfx('crash');
    if (this.done) { if (t > this.done + 100) this.leave(); return; }
    const nx = this.lines[this.shown];
    if (nx && t >= T.talk + this.shown * 4) { this.line = this.shown++; this.lineT = 0; }
  }
  leave() { this.g.go('map'); }
  shake() { const t = this.t, T = this.T; return t >= T.name && t < T.name + 16 ? [(t & 1) ? 3 : -3, 0] : [0, 0]; }
  render(f) {
    const t = this.t, T = this.T;
    sky(f, Math.min(1, t / 200) * (this.gold ? 1 : 0.85));
    for (const fr of this.frags) {
      const k = ease((t - T.frag) / 120) , a = fr.a + t * fr.s, x = 128 + Math.cos(a) * fr.r * (2 - k), y = fr.y + Math.sin(a) * 10;
      if (k > 0.02) slab(f, x, y, Math.max(2, Math.round(fr.w * k * 0.5)), 3, fr.id);
    }
    if (t > T.ring) ring(f, t, Math.min(1, (t - T.ring) / 90));
    // the column of light and ORIGIN in it
    if (t > T.col) {
      const k = Math.min(1, (t - T.col) / 100);
      for (let y = 0; y < 176; y++) for (let x = -14; x <= 14; x++) if (bayer(128 + x, y + (t >> 1)) < k * (1 - Math.abs(x) / 15) * 0.8) f.px(128 + x, y, (x + y) & 1 ? W : c32(31, 28, 10));
    }
    if (t > T.form) {
      const k = Math.min(1, (t - T.form) / 140);
      this.drawOri(f, 128, 178, 'idle1', 1, 1.0, k);
      if (t > T.halo) { const h = Math.min(1, (t - T.halo) / 60); if (h > 0.2) drawHalo(f, 128, 178 - 130, t, { fire: this.gold, rx: 52 * h, ry: 10 * h, scale: 1 }); }
    }
    // the name
    if (t < T.name && t > 200) drawTextCentered(f, '???', 128, 10, (t >> 4) & 1 ? COL.grey : COL.dark, { mono: false });
    if (t >= T.name) { drawTextBig(f, 'ORIGIN', 128, 8, (t >> 3) & 1 ? c32(31, 28, 10) : W, COL.black, 3); if (this.gold) drawTextCentered(f, 'TRUE FORM', 128, 34, c32(31, 22, 4), { mono: false }); }
    if (t < 90) f.rect(0, 0, 256, 224, BLACK);
    if (t < 150 && t > 20) drawTextCentered(f, 'THE BEGINNING.', 128, 100, c32(20, 20, 24), { mono: false });
    if (this.line >= 0) speak(f, this.ori, this.lines[this.line][1], this.lineT, t, false, this.shown < this.lines.length);
  }
}

// ============================================================================================================================ victory over ORIGIN
export class OriginVictoryScreen extends OriginBase {
  constructor(game, args = {}) {
    super(game, { ...args, which: 'g' });
    this.T = { kneel: 80, fall: 160, settle: 330, talk: 430 };
    this.lines = [['o', 'THERE\'S ONE MORE OF ME.'], ['o', 'THE FIRST WAS THE ONE WHO HAD TO BE BEATEN. THE LAST IS THE ONE WHO HAS BEEN WAITING.']];
    this.belts = BELT_IDS.map((id, i) => ({ id, a0: (i / BELT_IDS.length) * 6.28, y0: 60 + (i % 3) * 3, d: i * 3 }));
    this.frags = Array.from({ length: 24 }, (_, i) => ({ id: BELT_IDS[(i * 3) % BELT_IDS.length], a: (i / 24) * 6.28, r: 120 + (i % 4) * 10, rest: 100 + (i % 2) * 12, w: 7 + (i % 3) * 2 }));
  }
  enter() { this.g.audio.play(this.g.songs.originVictory); }
  update() {
    const I = this.g.input, A = this.g.audio, T = this.T;
    if (this.talk(I, A, this.lines, () => { this.done = this.t; })) return;
    this.t++;
    const t = this.t;
    if (t === T.kneel) A.sfx('knockdown');
    if (t === T.fall) A.sfx('originFlareBack');
    if (t === T.settle) A.sfx('freed');
    if (this.done) { if (t > this.done + 220) this.leave(); return; }
    const nx = this.lines[this.shown];
    if (nx && t >= T.talk + this.shown * 4) { this.line = this.shown++; this.lineT = 0; }
  }
  leave() {
    const g = this.g, R = g.records;
    R.origin.seen.hint = true; saveRecords(R);
    g.go('map');
  }
  render(f) {
    const t = this.t, T = this.T;
    sky(f, 0.8);
    ring(f, t);
    // the fragments settle into their places round the ring
    for (const fr of this.frags) { const k = ease((t - T.fall) / 220), a = fr.a, x = 128 + Math.cos(a) * (fr.r + (fr.rest * 0 - fr.r) * 0 - k * (fr.r - 118)), y = 40 + Math.sin(a) * 14 + k * (fr.rest - 40) * 0.4; slab(f, x, y, fr.w, 3, fr.id, t > T.settle ? 0.2 : 0); }
    // ORIGIN: standing, then on one knee
    const kneel = t > T.kneel;
    this.drawOri(f, 128, kneel ? 178 : 176, kneel ? 'stunned1' : 'idle1', 1, kneel ? 0.9 : 1);
    // the belts fall from the halo and circle the player
    const you = this.you.bank.get('victory');
    f.blit(you, 190, 214, this.you.sprPal.default.u32);
    for (const b of this.belts) {
      if (t < T.fall + b.d) { if (!kneel || t < T.fall) { const a = b.a0 + t * 0.011, x = 128 + Math.cos(a) * 52, y = 48 + Math.sin(a) * 10; slab(f, x, y, 4, 1, b.id); } continue; }
      const u = Math.min(1, (t - T.fall - b.d) / 100), a = b.a0 + t * 0.02, rx = 52 + (30 - 52) * u, x0 = 128 + Math.cos(b.a0) * 52, y0 = 48 + Math.sin(b.a0) * 10, tx = 190 + Math.cos(a) * 30, ty = 190 + Math.sin(a) * 12;
      const X = x0 + (tx - x0) * ease(u), Y = y0 + (ty - y0) * ease(u) - Math.sin(u * Math.PI) * 24;
      f.rect(Math.round(X) - 4, Math.round(Y) - 1, 9, 3, fam(b.id)); f.rect(Math.round(X) - 1, Math.round(Y) - 2, 3, 5, W);
      void rx;
    }
    if (t > 30 && t < T.talk) drawTextCentered(f, t < T.fall ? 'ORIGIN KNEELS.' : 'THE BELTS COME DOWN.', 128, 10, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
    if (this.line >= 0) speak(f, this.ori, this.lines[this.line][1], this.lineT, t, false, this.shown < this.lines.length);
    else if (this.done) drawBlock(f, 'SOMETHING IN THE HALL OF CHAMPIONS HAS STIRRED.', 10, 8, 236, 3, (t >> 4) & 1 ? COL.yellow : COL.white, { align: 'center', where: 'origin hint' });
  }
}

// ============================================================================================================================ victory over ORIGIN TRUE FORM
export class OriginTrueVictoryScreen extends OriginBase {
  constructor(game, args = {}) {
    super(game, { ...args, which: 't' });
    this.dash = dashOf();
    this.T = { world: 60, crowd: 420, belt: 900, talk: 1080, credits: 1560 };
    this.lines = [['o', 'THAT IS EVERYTHING I HAD. AND IT WAS A GREAT DEAL.'], ['o', 'THE FIRST FIGHTER HAS ALWAYS BEEN THE ONE WHO FELL. TAKE THE BELT. THERE IS NO ONE LEFT TO TAKE IT FROM.'], ['y', 'THE ORIGIN BELT.'], ['o', 'NOW LOOK. THEY CAME TO SEE YOU.']];
    // the world: pieces that fly in and join, in the colours of the six worlds
    const Z = [[4, 22, 31], [31, 20, 6], [26, 6, 26], [31, 28, 14], [28, 6, 3], [18, 20, 30]];
    this.pieces = Array.from({ length: 90 }, (_, i) => { const a = (i / 90) * 6.28 * 3, r = 40 + (i % 30) * 3.2; return { col: Z[i % 6], tx: 128 + Math.cos(a) * r * 1.5, ty: 150 + Math.sin(a) * r * 0.32 - (i % 30), fx: this.R() * 256, fy: -20 - this.R() * 80, d: i * 3, w: 8 + (i % 4) * 3 }; });
    this.folk = EVERYONE.filter((id) => FIGHTERS[id]).slice(0, 140);
    this.hollow = new Set(CRYSTAL_ORDER);
    this.rows = this.buildCredits();
    this.montage = this.folk.filter((id) => FIGHTERS[id].spriteLayers);
    this.pcache = new Map();
    this.beltSp = beltSprite('origin');
  }
  buildCredits() {
    const n = this.g.profile.name, nk = this.g.profile.nick;
    return [['THE ORIGIN BELT', ''], ['STARRING', n], ['AND', 'EVERY FIGHTER YOU EVER MET'], ['THE TWELVE', 'FREED, AND IN THE CROWD'], ['DASH MADDOX', 'IN YOUR CORNER, TO THE LAST'], ['THE FIRST FIGHTER', 'ORIGIN'], ['AND THE SHADOW', 'ZERO'], ['THE ROAD', 'GUS TO JAX'], ['THE PANTHEON', 'AURORA TO HALCYON'], ['THE UNDERWORLD', 'MOROS TO VORGATH'], ['THE VOID', 'THE TWELVE, AND ZERO'], ['EVERY ARENA', 'EVERY BELT'], ['THE FIRST PUNCH', 'THROWN ONCE, THROWN BACK'], ['THANK YOU FOR PLAYING.', '']].map((r) => (r[0] === 'STARRING' ? [r[0], `${n} "THE ${String(nk)}"`] : r));
  }
  enter() { this.g.audio.play(this.g.songs.originTrueVictory); }
  update() {
    const I = this.g.input, A = this.g.audio, T = this.T;
    if (this.talk(I, A, this.lines, () => { this.t = Math.max(this.t, T.credits - 1); })) return;
    this.t++;
    const t = this.t;
    if (t === T.world + 40) A.sfx('rumble');
    if (t === T.crowd + 20) A.sfx('crowd');
    if (t === T.belt) A.sfx('originFlare');
    if (t === T.credits) { A.play(this.g.songs.originCredits); A.sfx('freed'); }
    if (t >= T.talk && t < T.credits && this.shown < this.lines.length && t >= T.talk + this.shown * 4) { this.line = this.shown++; this.lineT = 0; }
    if (t > T.credits + this.creditsLen() + 200 && (I.confirm() || I.pressed('star'))) { A.sfx('confirm'); this.leave(); }
  }
  creditsLen() { return this.rows.length * 52 + 260; }
  leave() { const g = this.g; g.records.origin.seen.victoryTrue = true; saveRecords(g.records); g.go('map'); }
  shake() { const t = this.t, T = this.T; return (t >= T.world + 40 && t < T.world + 70) || (t >= T.belt && t < T.belt + 14) ? [(t & 1) ? 2 : -2, 0] : [0, 0]; }
  portrait(id) {
    if (!this.pcache.has(id)) { const d = FIGHTERS[id], p = paletteFor(d.palette); this.pcache.set(id, { s: (PORTRAITS[id] || PORTRAITS.barney)(p), pal: p.u32 }); }
    return this.pcache.get(id);
  }
  render(f) {
    const t = this.t, T = this.T;
    if (t >= T.credits) return this.renderCredits(f, t - T.credits);
    sky(f, 0.9);
    // the world assembles, piece by piece, round the ring
    for (const p of this.pieces) {
      const k = ease((t - T.world - p.d * 1.2) / 90); if (k <= 0) continue;
      const x = p.fx + (p.tx - p.fx) * k, y = p.fy + (p.ty - p.fy) * k;
      f.rect(Math.round(x) - p.w, Math.round(y), p.w * 2, 5, c32(...p.col)); f.rect(Math.round(x) - p.w, Math.round(y), p.w * 2, 1, W);
    }
    ring(f, t, Math.min(1, (t - T.world) / 60));
    // every fighter in the game fills the crowd: rows from the back, the freed twelve and Dash glowing
    const n = this.folk.length, shown = Math.min(n, Math.max(0, Math.floor((t - T.crowd) / 2.4)));
    for (let i = 0; i < shown; i++) {
      const id = this.folk[i], P = this.portrait(id), row = Math.floor(i / 20), col = i % 20, x = 6 + col * 12.4 + (row & 1 ? 5 : 0), y = 6 + row * 11;
      f.blit(P.s, Math.round(x), Math.round(y), P.pal, { scale: 0.18 });
      if (this.hollow.has(id)) f.rect(Math.round(x), Math.round(y) + 9, 9, 1, c32(...HOLLOWED_COLORS[id]));
    }
    for (let i = 0; i < Math.min(12, Math.floor((t - T.crowd - 340) / 6)); i++) { const id = CRYSTAL_ORDER[i], x = 18 + i * 19, P = this.portrait(id); f.blit(P.s, x, 130, P.pal, { scale: 0.3 }); f.rect(x, 148, 14, 2, c32(...HOLLOWED_COLORS[id])); }
    if (t > T.crowd + 340) { const dt = this.portrait('dash1'); f.blit(dt.s, 224, 128, dt.pal, { scale: 0.34 }); }
    // ORIGIN and the player in the middle of it
    this.drawOri(f, 84, 186, 'idle1', 1, 0.52);
    f.blit(this.you.bank.get('idle1'), 170, 214, this.you.sprPal.default.u32);
    // the belt: from his hands to yours
    if (t > T.belt) { const k = ease((t - T.belt) / 120); const x = 90 + (170 - 90) * k, y = 150 + (184 - 150) * k - Math.sin(k * Math.PI) * 18; f.blit(this.beltSp.sprite, Math.round(x), Math.round(y), this.beltSp.pal, { scale: 0.16 + 0.1 * k }); }
    const cap = t < T.crowd ? 'THE WHOLE WORLD ASSEMBLES AROUND THE RING.' : t < T.belt ? 'EVERY FIGHTER YOU EVER MET FILLS THE CROWD. THE TWELVE ARE THERE. SO IS DASH.' : t < T.talk ? 'ORIGIN HANDS YOU THE ORIGIN BELT.' : '';
    if (cap && this.line < 0) { panel(f, 8, 156, 240, 26); drawBlock(f, cap, 12, 161, 232, 2, (t >> 4) & 1 ? COL.yellow : COL.white, { align: 'center', where: 'origin true caption' }); }
    if (this.line >= 0) { const [who, text] = this.lines[this.line]; speak(f, who === 'y' ? this.dash : this.ori, text, this.lineT, t, who !== 'y' ? false : true, this.shown < this.lines.length); }
  }
  // the secret credits: a montage of every fighter on the right, the roll on the left
  renderCredits(f, c) {
    f.clear(COL.black);
    sky(f, 0.35);
    const m = this.montage, i = Math.floor(c / 14) % m.length, d = FIGHTERS[m[i]], bank = fighterSprites(d.spriteLayers), pal = paletteFor(d.palette).u32;
    try { f.blit(bank.get((c >> 3) & 1 ? 'victory' : 'idle1'), 216, 214, pal, { scale: 0.6 }); } catch { /* */ }
    const j = (i + 7) % m.length, d2 = FIGHTERS[m[j]];
    try { f.blit(fighterSprites(d2.spriteLayers).get('idle1'), 34, 214, paletteFor(d2.palette).u32, { scale: 0.4, dither: 1 }); } catch { /* */ }
    const y0 = 230 - c * 0.7;
    this.rows.forEach(([a, b], k) => {
      const y = Math.round(y0 + k * 52); if (y < -30 || y > 224) return;
      const big = a === 'THE ORIGIN BELT' || a === 'THANK YOU FOR PLAYING.';
      if (big) drawTextBig(f, a === 'THE ORIGIN BELT' ? 'ORIGIN' : 'THE END', 128, y, c32(31, 28, 10), COL.black, 2); else drawTextCentered(f, a, 128, y, COL.cyan, { mono: false });
      if (b) drawBlock(f, b, 20, y + 12, 216, 2, COL.white, { align: 'center', where: 'origin credits' });
    });
    if (c > this.creditsLen() && (c >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 206, COL.grey);
  }
}
