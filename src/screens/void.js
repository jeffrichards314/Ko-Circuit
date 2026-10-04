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
import { ladder, nextOpponent, rankLabel, hasFighters, enterCircuit, ascNext, rivalDue, rivalWon, isFreed, freedCount, voidReached } from '../save/career.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const W = c32(31, 31, 31), BLACK = c32(0, 0, 1), BOX = c32(3, 4, 9);
const disc = (f, x, y, r, col) => { for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); f.rect(x - w, y + j, w * 2 + 1, 1, col); } };

// a speaker's box (portrait left or right), the way the other cutscenes do it
function speak(f, S, text, lineT, t, left = true, more = true) {
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
const youOf = (game) => { const p = game.profile, fp = frontPalette(p); return { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name, col: COL.green, bank: playerSprites(hairStyleOf(p), costumeIdOf(p)), sprPal: playerPalettes(p) }; };
const ferryOf = () => { const tp = trainerPortrait('ferryman'); return { portrait: tp.sprite, pal: tp.pal, name: 'THE FERRYMAN', col: c32(10, 26, 25) }; };
const dashOf = () => { const tp = trainerPortrait('dash'); return { portrait: tp.sprite, pal: tp.pal, name: 'DASH', col: c32(4, 24, 22) }; };

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
export class ReforgeScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    this.zero = fighterSprites('zeroTrue'); this.zeroPal = paletteFor('zeroTrue').u32;
    this.cut = cutShards(this.zero.get('idle1'), 22, 21);
    this.you = youOf(game); this.ferry = ferryOf(); this.dash = dashOf();
    this.lights = HOLLOWED.map((id, i) => ({ col: c32(...(FREED[id] ? FREED[id].color : [31, 31, 31])), a: (i / 12) * Math.PI * 2 }));
    this.lines = [
      [400, 'dash', 'THAT\'S HIM. THAT\'S THE WHOLE OF IT: NOT A SHARD, NOT A CHAMPION\'S SHADOW. HIM.'],
      [400, 'dash', 'I CAN FEEL EVERY PIECE HE USED TO BE.'],
      [400, 'dash', 'HE\'S GOING TO USE ALL OF THEM, IN ORDER. I\'LL TELL YOU EVERYTHING THAT COMES.'],
      [400, 'ferry', 'I ROW NO FARTHER, CHAMPION. THIS CORNER IS HIS NOW. HE HAS EARNED IT, AND MORE THAN I HAVE.'],
      [400, 'dash', 'READY? NO. YOU\'RE NEVER READY. THAT\'S WHY YOU WIN.'],
    ];
    this.T = { pull: 80, whole: 330, talk: 400, fly: 0 };
  }
  enter() { this.g.audio.play(this.g.songs.reforgeTheme); this.g.audio.sfx('voidTell'); }
  update() {
    const I = this.g.input, A = this.g.audio;
    if (this.line >= 0) {
      if (talkTick(this, this.lines[this.line][2], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; if (this.shown >= this.lines.length) { this.T.fly = this.t; } }
      return;
    }
    this.t++;
    if (this.t === this.T.pull) A.sfx('whoosh');
    if (this.t === this.T.whole) { A.sfx('shatter'); A.sfx('rumble'); }
    if (this.t === this.T.talk + 200) A.sfx('freed');
    if (this.T.fly) { if (this.t === this.T.fly + 130) A.sfx('unlock'); if (this.t > this.T.fly + 340) this.leave(); return; }
    const nx = this.lines[this.shown];
    if (nx && this.t >= nx[0] + this.shown * 6 && this.t >= this.T.talk) { this.line = this.shown++; this.lineT = 0; }
  }
  leave() { const c = this.g.career; if (c) { c.flags.reforged = true; this.g.saveCareer(); } this.g.go('map'); }
  shake() { const t = this.t; return t >= this.T.whole && t < this.T.whole + 18 ? [(t & 1) ? 3 : -3, 0] : [0, 0]; }
  render(f) {
    const t = this.t, T = this.T;
    f.rect(0, 0, 256, 224, BLACK);
    for (let i = 0; i < 50; i++) f.px((i * 53 + 11) % 256, (i * 31 + 7) % 200, i & 1 ? c32(9, 9, 14) : c32(5, 5, 9));
    // the twelve lights hang in a ring, turning
    const fly = T.fly ? Math.min(1, Math.max(0, (t - T.fly - 40) / 100)) : 0;
    this.lights.forEach((L, i) => {
      const a = L.a + t * 0.012, rx = 92 * (1 - fly), ry = 34 * (1 - fly);
      const x = Math.round(128 + Math.cos(a) * rx), y = Math.round(150 - 30 * (1 - fly) + 40 * fly - 36 + Math.sin(a) * ry);
      disc(f, x, y, 3, c32(1, 1, 3)); disc(f, x, y, 2, L.col); f.px(x - 1, y - 1, W);
      if (fly > 0) for (let k = 1; k < 5; k++) f.px(Math.round(x - Math.cos(a) * k * 2), y - k, L.col);
    });
    // ZERO: the shatter, run backwards: the pieces come in from everywhere and fit
    if (t < T.whole) {
      const age = Math.max(0, (T.whole - t) * 1.1);
      if (t > T.pull - 40) drawShards(f, this.cut, 128, 176, this.zeroPal, age, { fade: 0 });
    } else {
      const k = Math.min(1, (t - T.whole) / 30);
      f.blit(this.zero.get('idle1'), 128, 176, this.zeroPal, { scale: 0.9 + 0.1 * k });
      if (t < T.whole + 8) f.rect(0, 0, 256, 224, W);
    }
    // the corner: Dash steps in (left) once he has spoken
    if (t >= T.talk) { const dash = fighterSprites('dash1'); f.blit(dash.get(this.shown > 0 ? 'idle1' : 'beckon1'), 46, 208, paletteFor('dash1').u32); }
    f.blit(this.you.bank.get(fly > 0.5 ? 'victory' : 'idle1'), 128, 222, this.you.sprPal.default.u32);
    if (fly > 0.6) { const g = Math.min(1, (fly - 0.6) / 0.4); for (let j = 0; j < 40; j++) for (let x = -12; x <= 12; x++) if (bayer(128 + x, 190 + j) < g * 0.4) f.px(128 + x, 190 + j, W); }
    const cap = t < T.pull ? 'THE TWELVE ARE FREE. THEIR LIGHTS HANG IN THE DARK.' : t < T.whole ? 'ZERO HAS NOTHING LEFT TO BORROW. THE SHATTER RUNS BACKWARD.' : t < T.talk + 30 ? 'THE REFORGING' : T.fly && t > T.fly + 60 ? 'THE TWELVE LIGHTS GO INTO YOUR BELT. IT BURNS WHITE.' : '';
    if (cap && this.line < 0) drawBlock(f, cap, 10, 8, 236, 4, (t >> 4) & 1 ? COL.yellow : COL.white, { align: 'center', where: 'void caption' });
    if (this.line >= 0) { const [, who, text] = this.lines[this.line], S = who === 'dash' ? this.dash : who === 'ferry' ? this.ferry : this.you; speak(f, S, text, this.lineT, t, who !== 'you', this.shown < this.lines.length); }
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
