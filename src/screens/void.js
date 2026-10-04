// The Void's screens (spec §18 A1, A4; Phase E):
//   VoidDoorScreen   the door below the throne: the first time down, the Ferryman shows you the white door and what is behind it. Then the map.
//   FreeScreen       a Hollowed is freed: the shell cracks and comes apart, the person inside rises out of it in their own colour and says
//                    what they remember. (args: { id, first, then: [screen, args] }; the first time in full, after a retry a short one)
//   ReforgeScreen    THE REFORGING, after Dash Unbound: the twelve lights hang in the dark, ZERO pulls himself together out of the Void
//                    (the shatter, run backwards), Dash steps into your corner, and the lights go into your belt.
//   TrueEndingScreen ZERO undone, the Void collapses; you and Dash wake in the amateur gym; the credits roll every fighter.
import { drawTyped, drawLabel, drawLabelCentered, drawBlock, layout, talkTick, talkNeed } from '../engine/textbox.js';
import { goIntro } from './introFlow.js';
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { CIRCUITS, ASC_PATH, HOLLOWED, MAIN_PATH, SECRET, RIVAL_AFTER, ALL_ORDER, isRival, ascIndex } from '../../data/circuits.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { ARENAS } from '../../data/arenas/index.js';
import { PORTRAITS, playerPortrait } from '../../data/sprites/portraits.js';
import { FREED } from '../../data/fighters/void/freed.js';
import { fighterSprites, playerSprites, paletteFor } from '../engine/spriteCache.js';
import { Arena } from '../engine/arena.js';
import { Dialogue, drawFerryman, drawBoat } from './descend.js';
import { cutShards, drawShards, drawCracks } from './shards.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, costumeIdOf, playerPalettes, nicknameOf, trainerOf } from '../../data/customization.js';
import { drawRingSide } from '../fight/asc/crystals.js';
import { HOLLOWED_COLORS, REFORGE_LINES, CRYSTAL_ORDER } from '../../data/fighters/void/crystals.js';
import { ladder, nextOpponent, rankLabel, hasFighters, enterCircuit, ascNext, rivalDue, rivalWon, isFreed, freedCount, voidReached } from '../save/career.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const W = c32(31, 31, 31), BLACK = c32(0, 0, 1), BOX = c32(3, 4, 9);
const disc = (f, x, y, r, col) => { for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); f.rect(x - w, y + j, w * 2 + 1, 1, col); } };

// a speaker's box (portrait left or right), the way the other cutscenes do it
export function speak(f, S, text, lineT, t, left = true, more = true) {
  panel(f, 6, 150, 244, 68);
  const px = left ? 10 : 180;
  f.rect(px, 153, 66, 62, COL.white); f.rect(px + 1, 154, 64, 60, BOX);
  f.blit(S.portrait, px + 1, 154, S.pal);
  const tx = left ? 82 : 12;
  drawLabel(f, S.name, tx, 156, 160, S.col, { mono: false, where: 'talk name' });
  let n = Math.floor(lineT * 1.5);
  drawTyped(f, text, tx, 168, 160, 5, n, COL.white, { lineH: 9, where: 'void talk' });
  if (lineT >= talkNeed(text, 160) && (t >> 4) & 1) drawText(f, more ? '>' : 'GO', left ? 238 - (more ? 0 : 12) : 164, 208, COL.grey, { mono: false });
}
export const youOf = (game) => { const p = game.profile, fp = frontPalette(p); return { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name, col: COL.green, bank: playerSprites(hairStyleOf(p), costumeIdOf(p)), sprPal: playerPalettes(p) }; };
const ferryOf = () => { const tp = trainerPortrait('ferryman'); return { portrait: tp.sprite, pal: tp.pal, name: 'THE FERRYMAN', col: c32(10, 26, 25) }; };
export const dashOf = () => { const tp = trainerPortrait('dash'); return { portrait: tp.sprite, pal: tp.pal, name: 'DASH', col: c32(4, 24, 22) }; };

// ============================================================================================ the door
export class VoidDoorScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    this.you = youOf(game); this.ferry = ferryOf();
    this.R = rnd(77);
    this.lines = [
      [60, 'ferry', 'THE THRONE HAS NO FLOOR UNDER IT. IT HAS THIS. THE DOOR THE DEBT WAS SOLD THROUGH.'],
      [60, 'ferry', 'I SAID IT WAS NOT READY. I WAS WRONG ABOUT THAT. YOU ARE. YOU HAVE BEEN FOR A LONG TIME.'],
      [60, 'you', 'WHAT IS BEHIND IT?'],
      [220, 'ferry', 'WHAT IS LEFT WHEN A THING IS TAKEN APART. THE VOID.'],
      [220, 'ferry', 'ZERO\'S SHARDS ARE THERE: TWELVE OF THEM, IN THREE FRAGMENTS.'],
      [220, 'ferry', 'THEY WERE PEOPLE. THE VOID EMPTIED EACH ONE.'],
      [220, 'ferry', 'IT PUT EACH TO WORK ON A SINGLE THING: DODGING, BLOCKING, REMEMBERING.'],
      [220, 'ferry', 'HIT THEM AND THEY REMEMBER THEMSELVES.'],
      [220, 'ferry', 'IT IS WORSE THAN ANYTHING BELOW. NO SPARE LIFE.'],
      [220, 'ferry', 'A LOSS AND YOU BEGIN THE FRAGMENT AGAIN. A DRAW IS A LOSS: ONLY A KNOCKOUT COUNTS.'],
      [220, 'ferry', 'I WILL ROW YOU OVER EACH FRAGMENT. I CAN GO NO FARTHER THAN THE LAST. GO. THE DOOR OPENS ONLY ONCE.'],
    ];
  }
  enter() { this.g.audio.play(this.g.songs.voidDoor); this.g.audio.sfx('rumble'); }
  update() {
    const I = this.g.input, A = this.g.audio;
    if (this.line >= 0) {
      if (talkTick(this, this.lines[this.line][2], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= this.lines.length) this.leave(); }
      return;
    }
    this.t++;
    if (this.t === 180) { A.sfx('voidTell'); A.sfx('whoosh'); }
    const nx = this.lines[this.shown];
    if (nx && this.t >= nx[0]) { this.line = this.shown++; this.lineT = 0; }
  }
  leave() { const c = this.g.career; if (c) { c.flags.voidSeen = true; this.g.saveCareer(); } this.g.go('map'); }
  render(f) {
    const t = this.t;
    f.rect(0, 0, 256, 224, c32(1, 0, 2));
    // the hall: dark rock, a faint red ring of what the throne was
    for (let y = 0; y < 150; y++) for (let x = (y & 1); x < 256; x += 2) if (bayer(x, y) < 0.4 * (1 - y / 150)) f.px(x, y, c32(4, 1, 3));
    for (let r = 60; r > 10; r -= 10) for (let a = 0; a < 60; a++) { const q = (a / 60) * Math.PI * 2; f.px(Math.round(128 + Math.cos(q) * r * 1.6), Math.round(96 + Math.sin(q) * r * 0.5), r > 40 ? c32(6, 1, 3) : c32(12, 2, 4)); }
    // the floor and the door lying in it: a white slot that opens as the scene goes on
    f.rect(0, 118, 256, 106, c32(3, 2, 5)); f.rect(0, 118, 256, 2, c32(9, 6, 10));
    const open = Math.min(1, Math.max(0, (t - 120) / 90)), dw = 20 + Math.round(open * 62), dh = 12 + Math.round(open * 16);
    for (let j = -dh; j <= dh; j++) { const w = Math.round(dw * Math.sqrt(1 - (j / (dh + 0.5)) ** 2)); f.rect(128 - w, 156 + j, w * 2, 1, j < 0 ? c32(28, 28, 31) : W); }
    for (let i = 0; i < 26; i++) { const x = 128 + Math.round((this.R() - 0.5) * dw * 1.4), h = Math.round(open * (20 + this.R() * 60)); for (let j = 0; j < h; j += 3) f.px(x, 150 - j, (i + j + (t >> 2)) & 1 ? W : c32(24, 26, 31)); }
    for (let i = 0; i < 12; i++) { const a = i * 0.52 + t * 0.01, r = 30 + (i % 3) * 8; if (open > 0.3) disc(f, Math.round(128 + Math.cos(a) * r * 1.7), Math.round(70 + Math.sin(a) * r * 0.5) - Math.round(open * 20), 1, i % 2 ? W : c32(20, 22, 31)); }
    // you and the Ferryman at the edge of it
    f.blit(this.you.bank.get('idle1'), 66, 200, this.you.sprPal.default.u32);
    drawBoat(f, 200, 192, t, false); drawFerryman(f, 222, 196, t, 0);
    const cap = t < 120 ? 'UNDER THE THRONE THERE IS A DOOR.' : t < 300 ? 'IT IS WHITE.' : '';
    if (cap && this.line < 0) drawTextCentered(f, cap, 128, 8, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
    if (this.line >= 0) { const [, who, text] = this.lines[this.line], S = who === 'you' ? this.you : this.ferry; speak(f, S, text, this.lineT, t, who !== 'you', this.shown < this.lines.length); }
    if (open > 0.99 && this.line < 0 && (t >> 5) & 1) drawTextCentered(f, 'PUSH START', 128, 212, COL.grey, { mono: false });
    void UIPAL; void textWidth;
  }
}

function drawLight(f, x, y, k, col, t) {
  const warm = (v) => Math.min(31, v + 10);
  const body = c32(warm((col >> 0) & 31), warm(0), 0);
  void body;
  const [r, g, b] = [(col & 0xff) >> 3, ((col >> 8) & 0xff) >> 3, ((col >> 16) & 0xff) >> 3];
  const tint = c32(Math.min(31, r + 8), Math.min(31, g + 8), Math.min(31, b + 8)), core = c32(31, 30, 26), edge = c32(r, g, b);
  const fig = (px, py, w, h, col2) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + px + i, Y = y + py + j - Math.round(k * 30); if (bayer(X, Y) < 1 - k * 0.7 && (X + Y + (t >> 3)) % 5) f.px(X, Y, col2); } };
  fig(-4, -46, 9, 9, core); fig(-3, -47, 7, 1, tint);            // head
  fig(-9, -36, 19, 15, tint); fig(-6, -34, 13, 11, core);         // shoulders and chest
  fig(-13, -34, 4, 16, edge); fig(10, -34, 4, 16, edge);          // arms
  fig(-6, -21, 5, 21, tint); fig(2, -21, 5, 21, tint);            // legs
  for (let i = 0; i < 14; i++) { const X = x - 16 + ((i * 37 + t) % 32), Y = y - 50 - ((i * 23 + t * 2) % 40) - Math.round(k * 20); f.px(X, Y, i & 1 ? core : tint); }
}

export class FreeScreen {
  constructor(game, { id, first = true, then = ['map', {}] }) {
    this.g = game; this.id = id; this.first = first; this.then = then;
    this.t = 0;
    const d = FIGHTERS[id]; this.d = d;
    this.info = FREED[id] || { name: d.name, was: '', color: [31, 31, 31], lines: ['...'] };
    this.bank = fighterSprites(d.spriteLayers); this.pal = paletteFor(d.palette).u32;
    this.cut = cutShards(this.bank.get('idle1'), 16, id.length * 7 + 3);
    this.col = c32(...this.info.color);
    this.you = youOf(game);
    const tp = paletteFor(d.palette);
    this.portrait = { portrait: (PORTRAITS[id] || PORTRAITS.barney)(tp), pal: tp.u32, name: this.info.name, col: this.col };
    this.line = -1; this.lineT = 0; this.shown = 0;
    this.T = first ? { crack: 50, shatter: 150, rise: 170, talk: 250 } : { crack: 10, shatter: 40, rise: 50, talk: 999999 };
    this.count = freedCount(game.career || { freed: 0 });
  }
  enter() { this.g.audio.play(this.g.songs.freedTheme); }
  update() {
    const I = this.g.input, A = this.g.audio;
    if (!this.first && this.t > 130) return this.leave();
    if (this.line >= 0) {
      if (talkTick(this, this.info.lines[this.line], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= this.info.lines.length) this.t = Math.max(this.t, this.T.talk + 400); }
      return;
    }
    this.t++;
    const T = this.T;
    if (this.t === T.crack) A.sfx('glass');
    if (this.t === T.shatter) { A.sfx('shardBreak'); A.sfx('freed'); }
    if (this.first && this.t >= T.talk && this.shown < this.info.lines.length && this.t >= T.talk + this.shown * 30) { this.line = this.shown++; this.lineT = 0; }
    if (this.first && this.t > T.talk + 400 && (I.confirm() || I.pressed('star'))) this.leave();
  }
  leave() { const [name, args] = this.then; this.g.go(name, args); }
  render(f) {
    const t = this.t, T = this.T;
    f.rect(0, 0, 256, 224, BLACK);
    for (let i = 0; i < 40; i++) f.px((i * 53 + 11) % 256, (i * 31 + 7) % 130, i & 1 ? c32(9, 9, 14) : c32(5, 5, 9));
    // a pool of the shard's light on the ground
    if (t > T.shatter) for (let j = 0; j < 12; j++) { const w = Math.round(60 * Math.sqrt(1 - (j / 12) ** 2)); for (let x = -w; x <= w; x += 2) if (bayer(128 + x, 190 + j) < Math.min(1, (t - T.shatter) / 40) * 0.5) f.px(128 + x, 190 + j, this.col); }
    if (t < T.shatter) {
      f.blit(this.bank.get(t < T.crack ? 'idle1' : 'stunned1'), 128, 196, this.pal);
      if (t > T.crack) { const k = Math.min(1, (t - T.crack) / (T.shatter - T.crack)); drawCracks(f, 128, 140, k, W, 5, 9, 70); drawCracks(f, 128, 140, k, this.col, 9, 6, 40); }
    } else {
      const age = t - T.shatter;
      drawShards(f, this.cut, 128, 196, this.pal, age, { fade: Math.max(0, Math.min(1, (age - 60) / 80)), ordered: bayer });
      if (age < 5) f.rect(0, 0, 256, 224, W);
      if (t >= T.rise) drawLight(f, 128, 196, Math.min(1, Math.max(0, (t - T.rise - (this.first ? 160 : 40)) / 200)), this.col, t);
    }
    // the name they get back
    if (t > T.shatter + 30) {
      const nm = this.info.name;
      panel(f, 128 - ((textWidth(nm, false) + 16) >> 1), 10, textWidth(nm, false) + 16, 26);
      drawTextCentered(f, 'FREED', 128, 13, (t >> 3) & 1 ? COL.yellow : COL.white, { mono: false });
      drawTextCentered(f, nm, 128, 24, this.col, { mono: false });
    }
    if (this.line >= 0) speak(f, this.portrait, this.info.lines[this.line], this.lineT, t, true, this.shown < this.info.lines.length);
    else if (t > T.shatter + 90 && this.first && this.shown >= this.info.lines.length) { drawTextCentered(f, `${this.info.was}`, 128, 44, COL.grey, { mono: false }); drawTextCentered(f, `${this.count} OF 12 FREED`, 128, 56, COL.cyan, { mono: false }); if ((t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 208, COL.grey, { mono: false }); }
  }
}

// ============================================================================================ THE REFORGING
// (reworked 2026-10-04) The twelve freed Hollowed stand in a circle in the Void. One by one each turns into a pillar of light in their own colour (a
// close-up and a line each: data/fighters/void/crystals.js REFORGE_LINES), and every light shoots up into the sky. The twelve spiral together high above
// and combine in a flash. ZERO's true form descends with twelve crystals orbiting him, one in each of their colours. The twelve step back and take their
// places in the crowd. Dash steps into your corner. Plays in full the first time (nothing skips it), skippable after (hold START).
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const rgbOf = ([r, g, b]) => c32(r, g, b);
const mixC = ([r, g, b], k) => c32(Math.min(31, Math.round(r + (31 - r) * k)), Math.min(31, Math.round(g + (31 - g) * k)), Math.min(31, Math.round(b + (31 - b) * k)));
const PILLAR_SFX = ['pillar0', 'pillar1', 'pillar2', 'pillar3', 'pillar4', 'pillar5', 'pillar6', 'pillar7', 'pillar8', 'pillar9', 'pillar10', 'pillar11'];
const RING = { cx: 128, cy: 156, rx: 104, ry: 26 };
export class ReforgeScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    this.zero = fighterSprites('zeroTrue'); this.zeroPal = paletteFor('zeroTrue').u32;
    this.you = youOf(game); this.ferry = ferryOf(); this.dash = dashOf();
    // the twelve: where they stand in the circle (the front of it is toward you), what they say, where they will stand in the crowd
    this.folk = CRYSTAL_ORDER.map((id, i) => {
      const d = FIGHTERS[id], a = Math.PI / 2 + (i * Math.PI * 2) / 12, side = Math.sin(a);
      const x = RING.cx + Math.cos(a) * RING.rx, y = RING.cy + side * RING.ry, k = 0.4 + 0.14 * ((side + 1) / 2);
      // (the crowd: an arc across the back of the ring, left to right in the order they were freed)
      const ca = Math.PI * (1.08 + (i / 11) * 0.84), cxx = 128 + Math.cos(ca) * 120, cyy = 138 + Math.sin(ca) * 34;
      return { id, d, bank: fighterSprites(d.spriteLayers), pal: paletteFor(d.palette).u32, rgb: HOLLOWED_COLORS[id], col: rgbOf(HOLLOWED_COLORS[id]), info: FREED[id], line: REFORGE_LINES[id], x, y, k, crowd: [cxx, cyy], sky: [128 + Math.cos(a) * 96, 30 + (i % 4) * 7], a0: a };
    });
    this.T = { intro: 190, slot: 112 };
    this.T.spiral = this.T.intro + 12 * this.T.slot; this.T.flash = this.T.spiral + 200; this.T.descend = this.T.flash + 26; this.T.land = this.T.descend + 190;
    this.T.crowd = this.T.land + 70; this.T.talk = this.T.crowd + 210;
    this.lines = [
      ['ferry', 'THE TWELVE ARE FREE. THEY ARE A CROWD NOW, AND A CROWD IS ALL THAT A CHAMPION NEEDS.'],
      ['dash', 'THAT\'S HIM. NOT A SHARD, NOT A CHAMPION\'S SHADOW. HIM. AND LOOK AT THE CRYSTALS.'],
      ['dash', 'TWELVE, ONE IN EACH COLOUR. WHEN ONE GLOWS, THAT\'S THE KIND OF PUNCH COMING.'],
      ['dash', 'LAND THE GOLDEN MOMENT OF ITS BIG ONE AND IT CRACKS. THAT KIND OF PUNCH LEAVES HIS FIGHT.'],
      ['ferry', 'I ROW NO FARTHER, CHAMPION. THIS CORNER IS HIS NOW. HE HAS EARNED IT, AND MORE THAN I HAVE.'],
      ['dash', 'READY? NO. YOU\'RE NEVER READY. THAT\'S WHY YOU WIN.'],
    ];
    this.glow = Object.fromEntries(CRYSTAL_ORDER.map((id) => [id, 0]));
  }
  enter() { this.g.audio.play(this.g.songs.reforgeTheme); this.g.audio.sfx('voidTell'); }
  // the slot of the i-th of the twelve and the frame inside it
  slot(i) { return this.t - (this.T.intro + i * this.T.slot); }
  update() {
    const I = this.g.input, A = this.g.audio, T = this.T;
    if (this.line >= 0) {
      if (talkTick(this, this.lines[this.line][1], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= this.lines.length) { this.T.out = this.t; } }
      return;
    }
    this.t++;
    const t = this.t;
    for (let i = 0; i < 12; i++) {
      const u = this.slot(i);
      if (u === 26) A.sfx(PILLAR_SFX[i]);
      if (u === 66) A.sfx('freed');
      if (u === 92) A.sfx('whoosh');
    }
    if (t === T.spiral) A.sfx('rise');
    if (t === T.flash) { A.sfx('shatter'); A.sfx('crash'); }
    if (t === T.descend + 20) A.sfx('voidTell');
    if (t === T.land) { A.sfx('rumble'); A.sfx('freed'); }
    if (t === T.crowd + 20) A.sfx('crowd');
    // the crystals light as he lands, then settle
    const lit = t > T.land ? Math.max(0, 0.9 - (t - T.land) / 80) : t > T.descend ? 0.18 : 0;
    for (const id of CRYSTAL_ORDER) this.glow[id] += (lit - this.glow[id]) * 0.12;
    if (this.T.out) { if (t > this.T.out + 70) this.leave(); return; }
    const nx = this.lines[this.shown];
    if (nx && t >= T.talk + this.shown * 4) { this.line = this.shown++; this.lineT = 0; }
  }
  leave() { const c = this.g.career; if (c) { c.flags.reforged = true; this.g.saveCareer(); } this.g.go('map'); }
  shake() { const t = this.t, T = this.T; return t >= T.flash && t < T.flash + 14 ? [(t & 1) ? 3 : -3, 0] : t >= T.land && t < T.land + 18 ? [(t & 1) ? 2 : -2, 1] : [0, 0]; }

  // the twelve as people (a sprite on the ring), with a rim of their colour
  person(f, F, x, y, k, rim = 1) {
    const s = F.bank.get('idle1'), bob = Math.round(Math.sin(this.t / 30 + F.a0 * 3) * 1);
    if (rim > 0.05) { const R = Math.round(14 * k * 2); for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { const d = Math.hypot(i, j * 1.5); if (d < R && bayer(x + i, y - 40 * k + j) < (1 - d / R) * 0.28 * rim) f.px(Math.round(x + i), Math.round(y - 40 * k + j), F.col); } }
    f.blit(s, x, y + bob, F.pal, { scale: k });
  }
  pillar(f, x, y, h, w, col, t, colRgb) {
    for (let j = 0; j < h; j++) {
      const Y = Math.round(y - j), tap = Math.max(2, w * (1 - (j / Math.max(1, h)) * 0.4));
      for (let i = -Math.round(tap); i <= Math.round(tap); i++) {
        const d = Math.abs(i) / tap, X = Math.round(x + i);
        const a = d < 0.28 ? 1 : 1 - (d - 0.28) / 0.72;
        if (bayer(X + (t >> 2), Y) < a * 0.95) f.px(X, Y, d < 0.28 ? W : d < 0.62 ? mixC(colRgb, 0.35) : col);
      }
    }
  }
  render(f) {
    const t = this.t, T = this.T;
    f.rect(0, 0, 256, 224, BLACK);
    for (let i = 0; i < 60; i++) f.px((i * 53 + 11) % 256, (i * 31 + 7) % 130, i & 1 ? c32(9, 9, 14) : c32(5, 5, 9));
    // the circle on the floor of the Void
    const fadeIn = Math.min(1, t / 70);
    for (let a = 0; a < 90; a++) { const q = (a / 90) * Math.PI * 2; if (bayer(a, 3) < fadeIn) f.px(Math.round(RING.cx + Math.cos(q) * (RING.rx + 12)), Math.round(RING.cy + Math.sin(q) * (RING.ry + 5)), c32(14, 14, 20)); }
    // which of the twelve is in his close-up now
    let closeI = -1;
    for (let i = 0; i < 12; i++) { const u = this.slot(i); if (u >= 0 && u < 80) closeI = i; }
    const cu = closeI >= 0 ? this.slot(closeI) : 0, dim = closeI >= 0 ? (cu < 22 ? cu / 22 : cu < 62 ? 1 : 1 - (cu - 62) / 18) : 0;
    // ---- the people on the ring (sorted back to front), each until they turn to light
    const order = this.folk.map((F, i) => ({ F, i })).sort((a, b) => a.F.y - b.F.y);
    const home = t < T.crowd;
    if (home) for (const { F, i } of order) {
      const u = this.slot(i), gone = u >= 66 ? 0 : 1;
      if (u >= 66 && u < 150) { /* (a pool of light where they stood) */ const fade = 1 - (u - 66) / 84; for (let j = -3; j <= 3; j++) for (let x = -16; x <= 16; x++) if (Math.hypot(x / 16, j / 3) < 1 && bayer(F.x + x, F.y + j) < 0.55 * fade) f.px(Math.round(F.x + x), Math.round(F.y + j), F.col); continue; }
      if (!gone) continue;
      this.person(f, F, F.x, F.y, F.k, u >= 0 ? Math.min(1, 0.4 + u / 30) * 2 : 0.5);
    }
    // ---- the pillars and the streaks
    this.folk.forEach((F, i) => {
      const u = this.slot(i);
      if (u >= 40 && u < 92) this.pillar(f, F.x, F.y, Math.round(ease((u - 40) / 24) * 190), 7 + Math.round(Math.sin(u / 3) * 1), F.col, t, F.rgb);
      if (u >= 92 && u < 128) {
        const v = (u - 92) / 36, y = F.y - 40 - ease(v) * (F.y - F.sky[1] + 40), x = F.x + (F.sky[0] - F.x) * ease(v);
        for (let q = 0; q < 24; q++) { const yy = Math.round(y + q * 3), xx = Math.round(x + (F.x - x) * (q / 24) * 0.3); if (bayer(xx, yy) < 1 - q / 26) f.px(xx, yy, q < 4 ? W : F.col); }
        disc(f, Math.round(x), Math.round(y), 2, W); disc(f, Math.round(x), Math.round(y), 3, F.col);
      }
    });
    // ---- the lights hang high above, then spiral together
    const sp = Math.max(0, t - T.spiral), spU = Math.min(1, sp / 190);
    this.folk.forEach((F, i) => {
      const u = this.slot(i);
      if (u < 112 || t >= T.flash) return;
      if (t < T.spiral) { const x = F.sky[0], y = F.sky[1] + Math.round(Math.sin(t / 26 + i) * 2); disc(f, x, y, 3, F.col); disc(f, x, y, 1, W); return; }
      const ang = F.a0 * 1 + sp * 0.055 * (1 + spU), r = 98 * (1 - ease(spU)), x = Math.round(128 + Math.cos(ang) * r), y = Math.round(44 + Math.sin(ang) * r * 0.42);
      for (let q = 1; q < 8; q++) { const a2 = ang - q * 0.07, r2 = 98 * (1 - ease(Math.max(0, spU - q * 0.01))); f.px(Math.round(128 + Math.cos(a2) * r2), Math.round(44 + Math.sin(a2) * r2 * 0.42), F.col); }
      disc(f, x, y, 3 - Math.min(1, spU * 1.2), F.col); disc(f, x, y, 1, W);
    });
    if (t >= T.spiral && t < T.flash) { const g = Math.min(1, sp / 190); for (let j = -16; j <= 16; j++) for (let x = -20; x <= 20; x++) if (bayer(128 + x, 44 + j) < g * (1 - Math.hypot(x / 20, j / 16)) * 0.9) f.px(128 + x, 44 + j, W); }
    // ---- the twelve step back into the crowd
    if (t >= T.crowd) {
      const u = Math.min(1, (t - T.crowd) / 150);
      for (const { F } of order) {
        const e = ease(u), x = F.x + (F.crowd[0] - F.x) * e, y = F.y + (F.crowd[1] - F.y) * e, k = F.k + (0.36 - F.k) * e;
        this.person(f, F, x, y, k, 0.8);
      }
      // the rest of the crowd behind them: dark heads in rows
      for (let i = 0; i < 70; i++) { const x = (i * 37 + 9) % 256, y = 100 + ((i * 17) % 3) * 6, a = Math.min(1, (t - T.crowd) / 60); if (bayer(x, y) < a) { disc(f, x, y + 3, 3, c32(2, 2, 5)); f.px(x, y + 1, c32(6, 6, 10)); } }
    }
    // ---- ZERO descends, the crystals with him
    if (t >= T.descend) {
      const w = Math.min(1, (t - T.descend) / 190), y = Math.round(-100 + ease(w) * 276), lit = t > T.land;
      if (!lit) for (let j = 0; j < y; j++) for (let x = -14; x <= 14; x++) if (bayer(128 + x, j) < (1 - Math.abs(x) / 15) * 0.5) f.px(128 + x, j, W);
      const R = { cx: 128, cy: y - 92, t, clock: t, glow: this.glow, broken: {}, white: false, down: false };
      drawRingSide(f, R, false);
      f.blit(this.zero.get('idle1'), 128, y, this.zeroPal);
      drawRingSide(f, R, true);
      if (t >= T.land && t < T.land + 26) { const r = (t - T.land) * 6; for (let a = 0; a < 70; a++) { const q = (a / 70) * Math.PI * 2; f.px(Math.round(128 + Math.cos(q) * r), Math.round(176 + Math.sin(q) * r * 0.24), W); } }
    }
    // ---- you, at the bottom of the ring
    f.blit(this.you.bank.get(t > T.land ? 'idle1' : 'idle1'), 128, 222, this.you.sprPal.default.u32);
    // ---- the close-up
    if (dim > 0.02) {
      for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < dim * 0.85) f.px(x, y, BLACK);
      const F = this.folk[closeI];
      const big = 1.5 + 0.25 * ease(cu / 60);
      const R2 = 70; for (let j = -R2; j <= R2; j++) for (let i = -R2; i <= R2; i++) { const d = Math.hypot(i, j); if (d < R2 && bayer(128 + i, 150 + j) < (1 - d / R2) * 0.3 * dim) f.px(128 + i, 150 + j, F.col); }
      f.blit(F.bank.get('idle1'), 128, 214, F.pal, { scale: big, dither: cu > 40 ? Math.min(1, (cu - 40) / 26) : 0 });
      const nm = F.info.name;
      panel(f, 128 - ((textWidth(nm, false) + 20) >> 1), 8, textWidth(nm, false) + 20, 22);
      drawTextCentered(f, nm, 128, 12, F.col, { mono: false }); drawTextCentered(f, F.info.was, 128, 21, COL.grey, { mono: false });
      if (cu > 14) { const text = `"${F.line}"`; panel(f, 20, 168, 216, 28); drawTyped(f, text, 28, 176, 200, 2, Math.floor((cu - 14) * 1.2), COL.white, { lineH: 9, where: 'reforge line' }); }
    }
    // ---- captions
    const cap = t < T.intro ? 'THE TWELVE ARE FREE. THEY STAND IN THE VOID, IN A CIRCLE.' : t >= T.spiral && t < T.flash ? 'TWELVE LIGHTS, HIGH ABOVE, TURNING TOGETHER.' : t >= T.flash && t < T.descend + 70 ? 'THE REFORGING' : t >= T.land && t < T.crowd ? 'ZERO. AND TWELVE CRYSTALS, ONE IN EACH OF THEIR COLOURS.' : t >= T.crowd && t < T.talk ? 'THE TWELVE STEP BACK AND TAKE THEIR PLACES IN THE CROWD.' : '';
    if (cap && this.line < 0 && dim < 0.05) drawBlock(f, cap, 10, 8, 236, 3, (t >> 4) & 1 ? COL.yellow : COL.white, { align: 'center', where: 'void caption' });
    if (t < 50) for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < 1 - t / 50) f.px(x, y, BLACK);
    if (t >= T.flash && t < T.flash + 12) for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < 1 - (t - T.flash) / 12) f.px(x, y, W);
    // Dash steps into the corner once he speaks
    if (t >= T.talk) { const dash = fighterSprites('dash1'); f.blit(dash.get(this.shown > 1 ? 'idle1' : 'beckon1'), 46, 214, paletteFor('dash1').u32); }
    if (this.line >= 0) { const [who, text] = this.lines[this.line], S = who === 'dash' ? this.dash : who === 'ferry' ? this.ferry : this.you; speak(f, S, text, this.lineT, t, who !== 'you', this.shown < this.lines.length); }
  }
}

// ============================================================================================ THE TRUE ENDING
const ROLL = () => {
  // every fighter, circuit by circuit (the base game's road with its secrets, Jax, the Nightmare, ZERO, then the Ascension), each rival fight after his circuit
  const order = [];
  for (const id of MAIN_PATH) { order.push(id); if (id === 'major') order.push('carnival'); if (id === 'legends') order.push('underground'); }
  order.push('nightmare', 'zero');
  for (const id of ASC_PATH) order.push(id);
  const seen = new Set(), rows = [];
  const add = (cid) => { if (seen.has(cid) || !CIRCUITS[cid]) return; seen.add(cid); rows.push({ head: CIRCUITS[cid].name }); for (const id of CIRCUITS[cid].fighters) rows.push({ id }); const r = RIVAL_AFTER[cid]; if (r && !seen.has(r)) { seen.add(r); for (const id of CIRCUITS[r].fighters) rows.push({ id, rival: true }); } };
  for (const cid of order) add(cid);
  void ALL_ORDER; void SECRET;
  return rows;
};
export class TrueEndingScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    const p = game.profile; this.p = p; this.name = `${p.name} "${nicknameOf(p)}"`;
    this.you = youOf(game); this.dash = dashOf(); this.trainer = trainerOf(p);
    this.zero = fighterSprites('zeroTrue'); this.zeroPal = paletteFor('zeroTrue').u32;
    this.cut = cutShards(this.zero.get('idle1'), 24, 5);
    this.arena = new Arena(ARENAS.rookie); for (let i = 0; i < 30; i++) this.arena.update();
    this.dashBank = fighterSprites('dash1'); this.dashPal = paletteFor('dash1').u32;
    this.rows = ROLL();
    let y = 0;
    for (const r of this.rows) { r.y = y; y += r.head ? 24 : 66; }
    this.rows.push({ gap: 30 }, { credit: 'STARRING', value: this.name }, { credit: 'IN YOUR CORNER', value: `${this.trainer.name}, THE FERRYMAN, AND DASH MADDOX` }, { credit: 'THE TWELVE', value: 'FREED, AND REMEMBERED' }, { gap: 50 });
    for (const r of this.rows.slice(y ? this.rows.findIndex((q) => q.y === undefined) : 0)) { if (r.y === undefined) { r.y = y; y += r.credit ? 32 : r.gap; } }
    this.rollH = y; this.scroll = 0;
    this.portraits = new Map();
    this.T = { crack: 60, shatter: 200, white: 330, gym: 460, talk: 560, roll: 1500 };
    this.lines = [
      ['dash', '...THE CEILING. CHAMP, IT\'S THE CEILING. IT STILL HAS THAT STAIN.'],
      ['you', 'MAPLE STREET.'],
      ['dash', 'WE WON. DIDN\'T WE? I REMEMBER ALL OF IT.'],
      ['dash', 'THE STAIRS. THE CHAINS. THE KING. YOUR HAND, WHEN I DIDN\'T TAKE IT.'],
      ['you', 'YOU NEVER TOOK IT.'],
      ['dash', 'I\'M TAKING IT NOW. HELP ME UP. I THINK I\'M GOING TO BE SICK. I THINK I\'M GOING TO BE FINE.'],
      ['dash', 'ONE MORE ROUND SOMETIME? NOT TODAY. NOT FOR A WHILE. YOU EARNED THE ROLL CALL. LOOK.'],
    ];
  }
  leave() { const c = this.g.career; if (c) { c.flags.trueEndingSeen = true; this.g.saveCareer(); } this.g.go('map'); }
  enter() { this.g.audio.play(this.g.songs.trueEndingTheme); }
  portraitOf(id) {
    if (!this.portraits.has(id)) { const d = FIGHTERS[id], pal = paletteFor(d.palette); this.portraits.set(id, { s: (PORTRAITS[id] || PORTRAITS.barney)(pal), pal: pal.u32 }); }
    return this.portraits.get(id);
  }
  update() {
    const I = this.g.input, A = this.g.audio, T = this.T;
    if (this.line >= 0) {
      if (talkTick(this, this.lines[this.line][1], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= this.lines.length) this.t = T.roll - 1; }
      return;
    }
    this.t++;
    const t = this.t;
    this.arena.update();
    if (t === T.crack) A.sfx('glass');
    if (t === T.shatter) { A.sfx('shatter'); A.sfx('crash'); }
    if (t === T.white) A.sfx('freed');
    if (t >= T.talk && t < T.roll && this.shown < this.lines.length && t >= T.talk + this.shown * 6) { this.line = this.shown++; this.lineT = 0; }
    if (t > T.roll) {
      const fast = I.held('a') || I.held('b') || I.held('start');
      this.scroll = Math.min(this.rollH + 224, this.scroll + (fast ? 4 : 0.75));
      if (this.scroll >= this.rollH + 224) {
        if (!this.doneAt) this.doneAt = t;
        if (t > this.doneAt + 120 && (I.confirm() || I.pressed('star'))) { A.sfx('confirm'); this.leave(); }
      }
    }
  }
  shake() { const t = this.t, T = this.T; return t > T.crack && t < T.shatter ? [(t & 1) ? 2 : -2, 0] : t >= T.shatter && t < T.shatter + 14 ? [(t & 1) ? 3 : -3, 1] : [0, 0]; }
  render(f) {
    const t = this.t, T = this.T;
    if (t < T.white + 90) {
      // the ring in the Void: ZERO cracks and comes apart for the last time; the Void folds in on itself and everything goes white
      f.rect(0, 0, 256, 224, BLACK);
      for (let i = 0; i < 50; i++) f.px((i * 53 + 11) % 256, (i * 31 + 7) % 150, i & 1 ? c32(12, 12, 17) : c32(6, 6, 10));
      if (t < T.shatter) { f.blit(this.zero.get('idle1'), 128, 176, this.zeroPal); if (t > T.crack) { const k = Math.min(1, (t - T.crack) / 130); drawCracks(f, 128, 128, k, W, 5, 9, 60); drawCracks(f, 128, 128, k, c32(24, 25, 31), 9, 5, 34); } }
      else { const age = t - T.shatter; drawShards(f, this.cut, 128, 176, this.zeroPal, age, { fade: Math.max(0, Math.min(1, (age - 60) / 100)), ordered: bayer }); }
      f.blit(this.you.bank.get(t > T.shatter ? 'victory' : 'idle1'), 128, 222, this.you.sprPal.gold ? this.you.sprPal.gold.u32 : this.you.sprPal.default.u32);
      // the fragments fall toward the middle, and the white comes from there
      if (t > T.shatter) for (let i = 0; i < 26; i++) { const R = rnd(i * 13 + 5), a = R() * 6.28, r = Math.max(0, (160 - (t - T.shatter) * 0.9) * (0.4 + R() * 0.7)); f.rect(Math.round(128 + Math.cos(a) * r), Math.round(120 + Math.sin(a) * r * 0.6), 3, 2, c32(18, 18, 24)); }
      if (t > T.shatter + 20) { const k = Math.min(1, (t - T.shatter - 20) / (T.white - T.shatter)); for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) { const d = Math.hypot(x - 128, (y - 120) * 1.4) / 170; if (d < k * 1.2 && bayer(x, y) < Math.min(1, (k * 1.2 - d) * 3)) f.px(x, y, W); } }
      if (t > T.white) f.rect(0, 0, 256, 224, W);
      if (t > T.crack + 40 && t < T.shatter) drawTextCentered(f, 'ZERO.', 128, 10, COL.dark, { mono: false });
      return;
    }
    if (t < T.roll) {
      // the amateur gym, the morning after: light through the high windows; you and Dash on the canvas
      this.arena.draw(f);
      f.rect(0, 44, 256, 180, c32(31, 30, 26)); // (the white comes down slowly)
      const k = Math.min(1, (t - T.white - 90) / 90);
      f.clear(W); this.arena.draw(f);
      for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < 1 - k) f.px(x, y, W);
      const woke = this.shown > 0;
      f.blit(this.you.bank.get(woke ? 'idle1' : 'down'), 96, woke ? 206 : 208, this.you.sprPal.default.u32);
      f.blit(this.dashBank.get(this.shown > 2 ? 'idle1' : this.shown > 0 ? 'getup' : 'down'), 164, this.shown > 0 ? 206 : 208, this.dashPal);
      if (this.line >= 0) { const [who, text] = this.lines[this.line], S = who === 'dash' ? this.dash : this.you; speak(f, S, text, this.lineT, t, who !== 'you', this.shown < this.lines.length); }
      else if (this.shown === 0 && t > T.white + 100) drawTextCentered(f, 'DAYLIGHT.', 128, 10, COL.dark, { mono: false });
      return;
    }
    // the credits: every fighter, each with their last words (the twelve with the name they got back); hold A to hurry
    f.clear(COL.black);
    const y0 = 224 - this.scroll;
    for (const r of this.rows) {
      const y = Math.round(y0 + r.y);
      if (y > 224 || y < -80) continue;
      if (r.head) { drawLabelCentered(f, textWidth(r.head, false) <= 240 ? r.head : r.head.replace('UNDERWORLD', 'UNDERW.').replace('PANTHEON', 'PANTH.'), 128, y + 8, 240, COL.orange, { where: 'credits head' }); continue; }
      if (r.credit) { drawTextCentered(f, r.credit, 128, y, COL.cyan, { mono: false }); layout(r.value, 230).forEach((l, i) => drawTextCentered(f, l, 128, y + 12 + i * 10, COL.white, { mono: false })); continue; }
      if (!r.id) continue;
      const d = FIGHTERS[r.id], P = this.portraitOf(r.id), FR = FREED[r.id];
      f.rect(15, y, 70, 62, COL.white); f.rect(17, y + 2, 66, 58, c32(11, 22, 27));
      f.blit(P.s, 18, y + 3, P.pal);
      // (a long name takes two lines, and the words one fewer)
      const nl = drawBlock(f, FR ? FR.name : d.name, 94, y + 4, 156, 2, FR ? c32(...FR.color) : COL.yellow, { where: 'credits name' });
      const line = FR ? FR.lines[1] : (d.lines && d.lines.lose) || (d.card && d.card.quote) || '...';
      drawBlock(f, `"${line}"`, 94, y + 5 + nl * 10, 156, 6 - nl, COL.white, { lineH: 9, where: 'credits line' });
    }
    const left = this.rollH + 224 - this.scroll;
    if (left < 130) {
      drawTextBig(f, 'THE END', 128, 84, COL.white, COL.black, 3);
      if (this.doneAt && this.t > this.doneAt + 40) drawTextCentered(f, 'THANK YOU FOR PLAYING.', 128, 124, COL.pink, { mono: false });
      if (this.doneAt && this.t > this.doneAt + 120 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 204, COL.grey);
    }
  }
}
