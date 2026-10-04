// THE DEAL BREAKS (spec §18 A4, "after Vorgath"): the cutscene after the King Below.
//   1  Vorgath kneels on the last of his floor, and the crown splits down the middle (the rubies go out one by one)
//   2  the mark on Dash's breastplate cracks with it: the deal he made for the stairs is broken
//   3  a tear opens behind him, white where the Underworld is black: the Void. It pulls Dash in ("it was never just the King")
//   4  the Ferryman, alone with you in the empty hall: the debt was sold on. There is a door below the throne, and it is not ready yet
// After it the Ferryman shows you the door below the throne (the Void's entry, `voidDoor`), and the career moves to the Void's map. args: none

import { drawTyped, drawLabel, talkTick, talkReady } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { Arena } from '../engine/arena.js';
import { ARENAS } from '../../data/arenas/index.js';
import { fighterSprites, paletteFor, playerSprites } from '../engine/spriteCache.js';
import { PORTRAITS, playerPortrait } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, costumeIdOf, playerPalettes } from '../../data/customization.js';

const BOX = c32(3, 4, 9), TEAL = c32(4, 24, 22), FERRY = c32(10, 26, 25), RED = c32(31, 6, 8);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const rnd = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// [frame it comes at, who, text]
const LINES = [
  [70, 'dash', 'THE CROWN\'S CRACKED. AND THE MARK. FEEL THAT? THAT\'S THE DEAL BREAKING.'],
  [70, 'you', 'DASH. YOU\'RE FREE.'],
  [70, 'dash', 'I THOUGHT IT WAS HIM I OWED. I WAS WRONG. HE WAS ONLY COLLECTING FOR SOMEONE ELSE.'],
  [250, 'dash', 'WHITE. IT\'S WHITE. IT ISN\'T THE DARK THAT\'S TAKING ME.'],
  [250, 'you', 'DASH! TAKE MY HAND!'],
  [250, 'dash', 'IT WAS NEVER JUST THE KING, CHAMP. HE WAS ONLY THE DOOR. FINISH IT. FIND THE ZERO...'],
  [560, 'ferry', 'THE DEAL IS BROKEN. THE DEBT WAS SOLD ON BEFORE YOU ARRIVED.'],
  [560, 'ferry', 'DOWN HERE WE PAY IN DARK. WHAT HE OWES NOW, HE PAYS IN WHITE.'],
  [560, 'ferry', 'BELOW THE THRONE THERE IS NO FLOOR. THERE IS A DOOR.'],
  [560, 'ferry', 'IT OPENS WHEN THE CHAMPION IS READY. COME. I WILL SHOW YOU.'],
];
const T = { crack: 40, tear: 240, pull: 330, gone: 470, hush: 560 };

export class DealScreen {
  constructor(game) {
    this.g = game;
    this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    this.arena = new Arena(ARENAS.vorgath);
    for (let i = 0; i < 20; i++) this.arena.update();
    const p = game.profile, fp = frontPalette(p);
    this.you = { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name, col: COL.green, bank: playerSprites(hairStyleOf(p), costumeIdOf(p)), sprPal: playerPalettes(p).default.u32 };
    const dp = paletteFor('dash8');
    this.dash = { portrait: PORTRAITS.dash8(dp), pal: dp.u32, bank: fighterSprites('dash8'), name: 'DASH MADDOX', col: TEAL };
    const vp = paletteFor('vorgath');
    this.king = { pal: vp.u32, bank: fighterSprites('vorgath') };
    const tp = trainerPortrait('ferryman');
    this.ferry = { portrait: tp.sprite, pal: tp.pal, name: 'THE FERRYMAN', col: FERRY };
    this.bits = Array.from({ length: 60 }, (_, i) => { const r = rnd(i * 977 + 3); return { a: r() * 6.283, d: 20 + r() * 90, v: 0.4 + r() * 1.2, w: 1 + Math.floor(r() * 3) }; });
  }
  enter() { this.g.audio.play(this.g.songs.dealBreaks || this.g.songs.ferrymanTheme); this.g.audio.sfx('crash'); }

  update() {
    const I = this.g.input, A = this.g.audio;
    this.arena.update();
    if (this.line >= 0) {
      if (talkTick(this, LINES[this.line][2], 160, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; }
      return;
    }
    this.t++;
    if (this.t === T.crack) { A.sfx('shatter'); this.g.shake = 8; }
    if (this.t === T.crack + 40) A.sfx('chainBreak');
    if (this.t === T.tear) { A.sfx('voidTell'); A.sfx('rumble'); }
    if (this.t === T.pull) A.sfx('whoosh');
    if (this.t === T.gone) { A.sfx('knockdown'); A.sfx('thud'); }
    const next = LINES[this.shown];
    if (next && this.t >= next[0]) { this.line = this.shown++; this.lineT = 0; }
    if (this.t > T.hush + 200 && this.shown >= LINES.length) this.leave();
  }
  leave() {
    const c = this.g.career;
    if (c) { c.flags.dealBroken = true; this.g.saveCareer(); }
    this.g.go('voidDoor'); // (the door below the throne: Phase E)
  }

  render(f) {
    const t = this.t;
    this.arena.draw(f);
    // the red of the throne room goes out with the crown
    const dim = Math.min(1, Math.max(0, (t - T.crack) / 120)) * 0.6;
    for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < dim) f.px(x, y, c32(1, 0, 2));
    // Vorgath, on one knee at the back, the crown splitting
    const kneel = t < T.crack ? 'idle1' : 'stunned1';
    f.blit(this.king.bank.get(kneel), 116, 140, this.king.pal, { scale: 0.62 });
    if (t >= T.crack) {
      const gone = Math.min(5, Math.floor((t - T.crack) / 14));
      for (let i = 0; i < 5; i++) { const on = i >= gone; f.rect(100 + i * 8, 62 + (i === 2 ? 0 : 2), 3, 3, on ? ((t >> 2) & 1 ? RED : c32(31, 20, 20)) : c32(3, 0, 1)); }
      f.rect(115, 58, 1, 14, c32(0, 0, 0)); // the crack down the middle of the crown
    }
    // you, at the left, watching
    f.blit(this.you.bank.get('idle1'), 52, 198, this.you.sprPal);
    // Dash, at the right, until the Void takes him
    const pull = t < T.pull ? 0 : Math.min(1, (t - T.pull) / 130);
    if (pull < 1) {
      const dx = Math.round(196 + pull * 30 + Math.sin(t * 0.7) * pull * 3), sc = 1 - pull * 0.7;
      f.blit(this.dash.bank.get(t < T.crack ? 'idle1' : t < T.pull ? 'hitHigh' : 'stunned1'), dx, Math.round(198 - pull * 60), this.dash.pal, { scale: sc, dither: pull > 0.6 && (t & 1) ? 1 : 0 });
      // the mark on his chest cracks: a red line, then out
      if (t > T.crack && t < T.pull) for (let i = 0; i < 6; i++) f.px(dx - 6 + i * 2, 160 + ((i * 5) % 4), (t >> 2) & 1 ? RED : c32(20, 3, 5));
    }
    // the Void: a tear in the air behind Dash, white where the Underworld is black, shards flying into it
    if (t >= T.tear) {
      const k = Math.min(1, (t - T.tear) / 70), cx = 232, cy = 128, R = Math.round(6 + k * 44 + (t >= T.pull ? (t - T.pull) * 0.12 : 0));
      for (let y = -R; y <= R; y++) { const w = Math.round(Math.sqrt(Math.max(0, R * R - y * y)) * 0.42); for (let x = -w; x <= w; x++) if (bayer(cx + x, cy + y) < 0.95 - (Math.abs(x) / (w + 1)) * 0.4) f.px(cx + x, cy + y, Math.abs(x) < w * 0.4 ? c32(31, 31, 31) : (x + y + (t >> 1)) & 3 ? c32(24, 26, 31) : c32(4, 3, 8)); }
      for (const b of this.bits) { const a = b.a, d = (b.d + t * b.v * 0.5) % 110, X = Math.round(cx - Math.cos(a) * (110 - d) * 0.8), Y = Math.round(cy + Math.sin(a) * (110 - d) * 0.6); if (X > 0 && X < 256 && Y > 40 && Y < 224 && d > 30) f.rect(X, Y, b.w, 1, (X + Y) & 1 ? c32(31, 31, 31) : c32(20, 22, 30)); }
    }
    // the whole room white for an instant when he goes
    if (t > T.gone - 6 && t < T.gone + 8) for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < 1 - Math.abs(t - T.gone) / 8) f.px(x, y, c32(31, 31, 31));
    // captions
    const cap = t < T.crack ? 'THE KING BELOW KNEELS.' : t < T.tear ? 'THE CROWN SPLITS. THE DEAL BREAKS.' : t < T.gone ? 'A DOOR OPENS BEHIND HIM.' : t < T.hush ? 'HE IS GONE.' : '';
    if (cap && this.line < 0) drawTextCentered(f, cap, 128, 8, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
    if (this.line >= 0) this.renderText(f);
  }

  renderText(f) {
    const [, who, text] = LINES[this.line];
    const S = who === 'dash' ? this.dash : who === 'you' ? this.you : this.ferry, left = who !== 'you';
    panel(f, 6, 150, 244, 68);
    const px = left ? 10 : 180;
    f.rect(px, 153, 66, 62, COL.white); f.rect(px + 1, 154, 64, 60, BOX);
    f.blit(S.portrait, px + 1, 154, S.pal);
    const tx = left ? 82 : 12;
    drawLabel(f, S.name, tx, 156, 160, S.col, { mono: false, where: 'talk name' });
    let n = Math.floor(this.lineT * 1.5);
    drawTyped(f, text, tx, 168, 160, 5, n, COL.white, { lineH: 9, where: 'deal talk' });
    if (talkReady(this, text, 160) && (this.t >> 4) & 1) drawText(f, '>', left ? 238 : 164, 208, COL.grey, { mono: false });
  }
}
