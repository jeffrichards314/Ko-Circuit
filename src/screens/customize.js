// Customization (§7): name, nickname, skin, hair style and color, trunks,
// gloves, shoes and trainer, with a live preview (front portrait + back view).
// args: { next: screen to go to when done, nextArgs, fresh: true for a new career, naming: true to start at the name entry (a career from a password) }

import { drawLabel } from '../engine/textbox.js';
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, wrap, textWidth } from '../engine/font.js';
import { c32, rgb15 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { playerSprites } from '../engine/spriteCache.js';
import { playerPortrait } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import {
  SKINS, HAIR_STYLES, HAIR_STYLE_NAMES, HAIR_COLORS, TRUNKS, GLOVES, SHOES, TRAINERS, NICKNAMES,
  DEFAULT_PROFILE, normalizeProfile, playerPalettes, frontPalette, hairStyleOf, costumeIdOf,
} from '../../data/customization.js';
import { COSTUMES } from '../../data/costumes.js';
import { UNLOCKS, ASC_UNLOCKS } from '../../data/unlocks.js';
import { costumeUnlocked, nextUnlock, ascensionSeen } from '../save/unlocks.js';
import { Hits, swipe } from '../engine/hits.js';

const BOX = c32(9, 24, 12), FLOOR = c32(21, 23, 26), FLOOR_SH = c32(17, 19, 23), ROPE = c32(29, 7, 7);
const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. '.split('');

const ROWS = [
  { k: 'name', label: 'NAME' },
  { k: 'nick', label: 'NICKNAME', n: NICKNAMES.length, show: (v) => `THE ${NICKNAMES[v]}` },
  { k: 'skin', label: 'SKIN', n: SKINS.length, show: (v) => SKINS[v].name, swatch: (v) => SKINS[v].c[1] },
  { k: 'hair', label: 'HAIR', n: HAIR_STYLES.length, show: (v) => HAIR_STYLE_NAMES[HAIR_STYLES[v]] },
  { k: 'hairColor', label: 'HAIR COLOR', n: HAIR_COLORS.length, show: (v) => HAIR_COLORS[v].name, swatch: (v) => HAIR_COLORS[v].c[1] },
  { k: 'trunks', label: 'TRUNKS', n: TRUNKS.length, show: (v) => TRUNKS[v].name, swatch: (v) => TRUNKS[v].c[1] },
  { k: 'gloves', label: 'GLOVES', n: GLOVES.length, show: (v) => GLOVES[v].name, swatch: (v) => GLOVES[v].c[1] },
  { k: 'shoes', label: 'SHOES', n: SHOES.length, show: (v) => SHOES[v].name, swatch: (v) => SHOES[v].c[1] },
  { k: 'trainer', label: 'TRAINER', n: TRAINERS.length, show: (v) => TRAINERS[v].name },
  // medal costumes (§16): only the unlocked ones come round
  { k: 'costume', label: 'KIT', n: COSTUMES.length, show: (v) => COSTUMES[v].name },
  { k: 'done', label: 'DONE' },
];

export class CustomizeScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.next = args.next || 'map';
    this.fresh = !!args.fresh;
    this.p = normalizeProfile(game.profile);
    this.nextArgs = args.nextArgs || null;
    this.sel = this.fresh || args.naming ? 0 : ROWS.length - 1;
    this.t = 0;
    this.naming = this.fresh || !!args.naming; // a new career (or one from a password: the name is not in it) starts at the name entry
    this.keySel = 0;
    this.hits = new Hits();
    this.refresh();
  }
  refresh() {
    const fp = frontPalette(this.p);
    this.portrait = playerPortrait(fp, hairStyleOf(this.p));
    this.portraitPal = fp.u32;
    this.bank = playerSprites(hairStyleOf(this.p), costumeIdOf(this.p));
    this.pal = playerPalettes(this.p).default.u32;
  }
  enter() { this.g.audio.play(this.g.songs.map); }

  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    if (this.naming) return this.updateName();
    // touch: a tap on a row chooses it; on the one chosen, the left half of the value steps back and the right half steps on
    for (const h of this.hits.take(I)) {
      if (h.id !== this.sel) { this.sel = h.id; A.sfx('menu'); continue; }
      const r = ROWS[h.id];
      if (r.n) I.fake(h.x < h.w * 0.62 ? 'left' : 'right'); else I.fake('a');
    }
    const sw = swipe(I, 14);
    if (sw) { this.sel = Math.max(0, Math.min(ROWS.length - 1, this.sel + sw)); A.sfx('menu'); }
    if (I.pressed('up')) { this.sel = (this.sel + ROWS.length - 1) % ROWS.length; A.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % ROWS.length; A.sfx('menu'); }
    const row = ROWS[this.sel];
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (d && row.n) { this.step(row, d); A.sfx('menu'); this.refresh(); }
    if (I.confirm() || I.pressed('star')) {
      if (row.k === 'name') { this.naming = true; this.keySel = 0; A.sfx('confirm'); }
      else if (row.k === 'done' || I.pressed('start')) this.finish();
      else if (row.n) { this.step(row, 1); A.sfx('menu'); this.refresh(); }
    }
    if (I.pressed('pause') && !this.fresh) this.finish();
  }

  // next value of a row (costumes skip the ones still locked)
  step(row, d) {
    let v = this.p[row.k];
    for (let i = 0; i < row.n; i++) {
      v = (v + d + row.n) % row.n;
      if (row.k !== 'costume' || costumeUnlocked(this.g.medals, COSTUMES[v].id)) break;
    }
    this.p[row.k] = v;
  }

  updateName() {
    const I = this.g.input, A = this.g.audio;
    const cols = 10, n = KEYS.length + 2; // + DEL + END
    let s = this.keySel;
    if (I.pressed('left')) s = (s + n - 1) % n;
    if (I.pressed('right')) s = (s + 1) % n;
    if (I.pressed('up')) s = s - cols < 0 ? Math.min(n - 1, s + cols * 3) : s - cols;
    if (I.pressed('down')) s = s + cols >= n ? s % cols : s + cols;
    if (s !== this.keySel) { this.keySel = s; A.sfx('menu'); }
    // touch: a tap on a key types it
    for (const h of this.hits.take(I)) { s = this.keySel = h.id; I.fake('a'); }
    const del = () => { this.p.name = this.p.name.slice(0, -1); A.sfx('menu'); };
    const end = () => { this.p.name = this.p.name.trim() || DEFAULT_PROFILE.name; this.naming = false; this.sel = 1; A.sfx('confirm'); };
    if (I.pressed('b')) del();
    else if (I.pressed('start')) end();
    else if (I.pressed('a') || I.pressed('star')) {
      if (s === KEYS.length) del();
      else if (s === KEYS.length + 1) end();
      else if (this.p.name.length < 8) { this.p.name += KEYS[s]; A.sfx('menu'); if (this.p.name.length === 8) this.keySel = KEYS.length + 1; }
    }
  }

  finish() {
    const g = this.g;
    this.g.audio.sfx('confirm');
    const p = normalizeProfile(this.p);
    if (g.career) { g.career.profile = p; g.saveCareer(); }
    g.go(this.next, this.nextArgs || (this.fresh ? { fresh: true } : {}));
  }

  render(f) {
    f.clear(COL.black);
    drawTextCentered(f, 'YOUR BOXER', 128, 6, COL.yellow);
    // preview: portrait (or the trainer when choosing one) + back view on a scrap of canvas
    const row = ROWS[this.sel];
    f.rect(8, 20, 70, 66, COL.white);
    f.rect(10, 22, 66, 62, row.k === 'trainer' ? c32(24, 16, 9) : BOX);
    if (row.k === 'trainer') { const tp = trainerPortrait(TRAINERS[this.p.trainer].id); f.blit(tp.sprite, 11, 24, tp.pal); }
    else f.blit(this.portrait, 11, 24, this.portraitPal);
    f.rect(8, 92, 70, 96, COL.white);
    f.rect(10, 94, 66, 92, FLOOR);
    f.rect(10, 104, 66, 1, ROPE);
    for (let y = 150; y < 186; y += 2) for (let x = 10 + (y & 2); x < 76; x += 4) f.px(x, y, FLOOR_SH);
    const pose = ((this.t / 24) | 0) % 2 ? 'idle2' : 'idle1';
    f.blit(this.bank.get(pose), 43, 180, this.pal);

    // option rows
    panel(f, 86, 20, 162, 168);
    if (!this.naming) this.hits.clear();
    ROWS.forEach((r, i) => {
      const y = 26 + i * 15;
      if (!this.naming) this.hits.add(88, y - 4, 158, 15, i);
      const on = i === this.sel && !this.naming;
      if (on) f.blit(ICONS.glove, 94 + ((this.t >> 3) & 1), y + 3, UIPAL);
      drawText(f, r.label, 104, y, on ? COL.white : COL.grey, { mono: false });
      if (r.k === 'done') return;
      // the value right-aligned beside its label (a nickname too long for the row drops its THE)
      const room = 244 - (104 + textWidth(r.label, false) + 6) - (r.swatch ? 11 : 0);
      let val = r.k === 'name' ? this.p.name + (this.naming && (this.t >> 4) & 1 ? '_' : '') : r.show(this.p[r.k]);
      if (textWidth(val, false) > room) val = val.replace(/^THE /, '');
      const x = 244 - Math.min(room, textWidth(val, false));
      drawLabel(f, val, x, y, 244 - x, on || (this.naming && r.k === 'name') ? COL.cyan : COL.off, { mono: false, where: 'customize value' });
      if (r.swatch) { const [R, G, B] = r.swatch(this.p[r.k]); f.rect(x - 11, y, 7, 7, COL.black); f.rect(x - 10, y + 1, 5, 5, rgb15(R, G, B).u32); }
    });

    // help / trainer perk
    panel(f, 8, 194, 240, 24);
    if (this.naming) drawTextCentered(f, 'A: ADD  B: DELETE  START: DONE', 128, 202, COL.grey, { mono: false });
    else if (row.k === 'trainer') {
      const T = TRAINERS[this.p.trainer];
      drawText(f, `${T.title}:`, 14, 198, COL.yellow, { mono: false });
      drawText(f, T.perk, 14, 208, COL.white, { mono: false });
    } else if (row.k === 'costume') {
      // the next costume on either track (the Ascension's only once you've reached it)
      const K = COSTUMES[this.p.costume], M = this.g.medals;
      const next = (track) => { let u = nextUnlock(M, track); while (u && u.kind !== 'costume') { const L = (track === 'asc' ? ASC_UNLOCKS : UNLOCKS); u = L[L.indexOf(u) + 1]; } return u; };
      const nb = next('base'), na = ascensionSeen(this.g) ? next('asc') : null, nx = nb || na;
      drawText(f, K.from ? `FROM ${K.from}` : 'THE COLORS YOU PICKED ABOVE', 14, 198, COL.yellow, { mono: false });
      drawText(f, nx ? `MORE AT ${nx.at} ${nx.track === 'asc' ? 'ASCENSION ' : ''}MEDALS` : 'EVERY COSTUME UNLOCKED', 14, 208, COL.grey, { mono: false });
    } else drawTextCentered(f, row.n ? 'LEFT / RIGHT TO CHANGE' : row.k === 'name' ? 'PUSH A TO TYPE A NAME' : 'PUSH A WHEN READY', 128, 202, COL.grey, { mono: false });

    if (this.naming) this.renderKeyboard(f);
  }

  renderKeyboard(f) {
    panel(f, 20, 58, 216, 110);
    drawTextCentered(f, 'ENTER YOUR NAME', 128, 64, COL.yellow, { mono: false });
    const nm = this.p.name.padEnd(8, '_');
    drawTextCentered(f, nm, 128, 78, COL.white);
    const cols = 10;
    this.hits.clear();
    [...KEYS, 'DEL', 'END'].forEach((k, i) => {
      const x = 32 + (i % cols) * 20, y = 96 + Math.floor(i / cols) * 14;
      this.hits.add(x - 4, y - 3, k.length > 1 ? 30 : 20, 14, i);
      const on = i === this.keySel;
      if (on) f.rect(x - 3, y - 3, k.length > 1 ? 30 : 13, 13, COL.panelHi);
      drawText(f, k === ' ' ? '_' : k, x, y, on ? COL.white : COL.grey, { mono: false });
    });
  }
}
