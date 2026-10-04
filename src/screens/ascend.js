// The Pantheon entry (spec §18 A4): the first time the sky is opened. The shards of ZERO
// drift in the dark; one of them lights, and a staircase builds itself up into the sky,
// step by step. The trainer says it: "Only the undefeated climb." Then the career opens
// the Pantheon (flags.pantheonOpen) and you start on the first step.
//   args: { }   (nothing: it reads the career)
// After it: the Pantheon staircase map (screens/pantheon.js).

import { drawTyped, drawLabel, talkTick, talkReady } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { fighterSprites, paletteFor } from '../engine/spriteCache.js';
import { playerPortrait } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, trainerOf } from '../../data/customization.js';
import { cutShards, drawShards } from './shards.js';
import { ascNext, enterCircuit } from '../save/career.js';

const BOX = c32(3, 4, 9);
const SKY = [c32(1, 1, 4), c32(3, 2, 8), c32(7, 4, 14), c32(14, 8, 18), c32(24, 13, 15), c32(30, 20, 12), c32(31, 27, 16), c32(31, 30, 24)];
const STEP_HI = c32(31, 30, 26), STEP = c32(26, 24, 21), STEP_SH = c32(17, 15, 15), STEP_GLOW = c32(31, 26, 10);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;

const STEPS = 9;
// the staircase climbs from the bottom left up to the light at the top right
const stepAt = (i) => ({ x: 22 + i * 24, y: 206 - i * 19, w: 30 });

export class AscendScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.t = 0; this.line = 0; this.lineT = 0;
    const p = game.profile, fp = frontPalette(p), tr = trainerOf(p);
    this.zero = fighterSprites('zero');
    this.zeroPal = paletteFor('zero').u32;
    this.cut = cutShards(this.zero.get('idle1'), 15, 11);
    this.you = { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name };
    const tp = trainerPortrait(tr.id);
    this.coach = { portrait: tp.sprite, pal: tp.pal, name: tr.name || 'COACH' };
    this.lines = [
      ['coach', 'SEE THAT LIGHT? THE SKY OPENED THE MOMENT ZERO FELL APART.'],
      ['coach', 'ONE OF THOSE SHARDS LIT A STAIRCASE. NOBODY BUILT IT. NOBODY KNOWS WHERE IT GOES.'],
      ['you', 'THEN I\'LL FIND OUT.'],
      ['coach', 'ONLY THE UNDEFEATED CLIMB.'],
    ];
    this.textAt = 200; // the scene plays out first, then the words
  }
  enter() { this.g.audio.play(this.g.songs.ascend || this.g.songs.map); this.g.audio.sfx('rise'); }

  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    const steps = this.stepsLit();
    if (this.t > 60 && this.t < 60 + STEPS * 14 && (this.t - 60) % 14 === 0) A.sfx('chime');
    if (this.t < this.textAt) { if (this.t > 60 && (I.confirm() || I.pressed('star'))) this.t = this.textAt; return; }
    if (talkTick(this, this.lines[this.line][1], 160, I.confirm() || I.pressed('star'))) {
      A.sfx('menu');
      this.line++; this.lineT = 0;
      if (this.line >= this.lines.length) return this.leave();
    }
    void steps;
  }
  stepsLit() { return Math.max(0, Math.min(STEPS, Math.floor((this.t - 60) / 14))); }

  // the sky is open: the Pantheon's first circuit is yours
  leave() {
    const c = this.g.career;
    if (c) {
      c.flags.pantheonOpen = true;
      const a = ascNext(c);
      if (a) enterCircuit(c, a);
      this.g.saveCareer();
    }
    this.g.go('map');
  }

  render(f) {
    const t = this.t, lit = this.stepsLit();
    // the sky brightens as the stairs light
    const k = Math.min(1, lit / STEPS);
    const shift = Math.round(k * 3);
    for (let i = 0; i < 8; i++) f.rect(0, i * 28, 256, 28, SKY[Math.min(SKY.length - 1, i + shift)]);
    // the light at the top of the stairs: a glow of stepped rings
    const top = stepAt(STEPS - 1), gx = top.x + 44, gy = top.y - 26;
    for (let r = 40; r > 0; r -= 5) {
      const col = r > 30 ? c32(31, 26, 12) : r > 20 ? c32(31, 29, 17) : r > 10 ? c32(31, 30, 24) : c32(31, 31, 30);
      for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); for (let x = -w; x <= w; x++) if (bayer(gx + x, gy + y) < Math.min(1, k * 1.2)) f.px(gx + x, gy + y, col); }
    }
    // the shards, drifting in the dark; the one over the stairs is lit
    const age = 240 + Math.floor(t * 0.3);
    drawShards(f, this.cut, 118, 150, this.zeroPal, age, { fade: 0 });
    if (t > 30) { const sy = 30 + Math.round(Math.sin(t * 0.06) * 2); this.litShard(f, 74, sy, t); }
    // the staircase
    for (let i = 0; i < lit; i++) {
      const s = stepAt(i), fresh = lit - 1 === i ? Math.min(1, (t - 60 - i * 14) / 8) : 1;
      const dy = Math.round((1 - fresh) * 8);
      f.rect(s.x, s.y + dy, s.w, 4, STEP_HI); f.rect(s.x, s.y + 4 + dy, s.w, 12, STEP); f.rect(s.x, s.y + 12 + dy, s.w, 4, STEP_SH);
      f.rect(s.x, s.y + dy, s.w, 1, c32(31, 31, 31));
      if ((t + i * 5) % 40 < 8) f.px(s.x + 4 + ((t * 3 + i * 11) % (s.w - 8)), s.y + 1 + dy, STEP_GLOW);
    }
    if (t >= this.textAt) this.renderText(f);
    else if (t > 40) drawTextCentered(f, 'THE SKY IS OPEN', 128, 8, (t >> 3) & 1 ? COL.yellow : COL.white);
  }

  litShard(f, x, y, t) {
    const glow = (t >> 2) & 1 ? c32(31, 28, 10) : c32(31, 22, 4);
    for (let i = -6; i <= 6; i++) f.rect(x - 3 + (Math.abs(i) >> 1), y + i, 7 - Math.abs(i) + (i > 3 ? -1 : 0), 1, i < 0 ? c32(31, 31, 26) : glow);
    f.rect(x - 1, y - 1, 3, 3, c32(31, 31, 31));
    // a thin line of light down to the first step
    for (let d = 8; d < 150; d += 3) f.px(x + Math.round(d * 0.12), y + d, (d + t) % 12 < 6 ? c32(31, 29, 14) : c32(28, 22, 6));
  }

  renderText(f) {
    const [who, text] = this.lines[Math.min(this.line, this.lines.length - 1)];
    const S = who === 'you' ? { ...this.you, col: COL.green } : { ...this.coach, col: COL.orange };
    const left = who !== 'you';
    panel(f, 6, 150, 244, 68);
    const px = left ? 10 : 180;
    f.rect(px, 153, 66, 62, COL.white); f.rect(px + 1, 154, 64, 60, BOX);
    f.blit(S.portrait, px + 1, 154, S.pal);
    const tx = left ? 82 : 12;
    drawLabel(f, S.name, tx, 156, 160, S.col, { mono: false, where: 'talk name' });
    let n = Math.floor(this.lineT * 1.5);
    drawTyped(f, text, tx, 168, 160, 5, n, COL.white, { lineH: 9, where: 'ascend talk' });
    if (talkReady(this, text, 160) && (this.t >> 4) & 1) drawText(f, this.line + 1 < this.lines.length ? '>' : 'GO', left ? 238 - (this.line + 1 < this.lines.length ? 0 : 12) : 164, 208, COL.grey, { mono: false });
    if (this.line === this.lines.length - 1 && talkReady(this, text, 160)) drawTextBig(f, 'CLIMB.', 128, 100, (this.t >> 3) & 1 ? COL.yellow : COL.white, COL.black, 2);
  }
}
