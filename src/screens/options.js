// Options: sound, music and effects volume, the CRT filter, and the touch controls (size, opacity, side, height). Saved to
// localStorage ('options', one for the whole game, not one a save) and applied at boot (main.js).
// Touch: every row is a tap target: a tap chooses the row, and again (or on its bar) changes it; swipe to scroll.
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { ICONS } from '../../data/sprites/ui.js';
import { save } from '../save/storage.js';
import { Hits, swipe } from '../engine/hits.js';

export const DEFAULT_OPTIONS = { sound: true, music: 7, sfx: 8, crt: 0, screenFit: 0, touchMode: 0, touchSize: 3, touchOpacity: 6, touchSide: 0, touchY: 1 };
export const CRT_NAMES = ['OFF', 'SCANLINES', 'FULL CRT'];
const TOUCH_MODES = ['AUTO', 'ALWAYS ON', 'OFF'];
const FITS = ['AUTO', 'FILL', 'SHARP']; // FILL: as big as the window allows; SHARP: whole-number sizes only; AUTO: FILL on a touch device
const SIDES = ['RIGHT-HANDED', 'LEFT-HANDED'];
const HEIGHTS = ['LOWEST', 'LOW', 'MIDDLE', 'HIGH', 'HIGHEST'];

// Push the options into the audio, display and touch pad.
export function applyOptions(game) {
  const o = game.options;
  game.audio.setMuted(!o.sound);
  game.audio.setVolumes(o.music / 10, o.sfx / 10);
  game.display.setCRT(o.crt);
  if (game.touch) game.touch.refresh();
}

const canFullscreen = () => typeof document !== 'undefined' && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
// kind: toggle (one value after another), bar (a number between min and max), act (a push)
const ALL_ROWS = [
  { k: 'sound', label: 'SOUND', kind: 'toggle', show: (o) => (o.sound ? 'ON' : 'OFF') },
  { k: 'music', label: 'MUSIC', kind: 'bar', min: 0, max: 10 },
  { k: 'sfx', label: 'EFFECTS', kind: 'bar', min: 0, max: 10 },
  { k: 'crt', label: 'CRT FILTER', kind: 'toggle', show: (o) => CRT_NAMES[o.crt] },
  { k: 'screenFit', label: 'SCREEN SIZE', kind: 'toggle', show: (o) => FITS[o.screenFit ?? 0] },
  { k: 'touchMode', label: 'TOUCH PAD', kind: 'toggle', show: (o) => TOUCH_MODES[o.touchMode] },
  { k: 'touchSize', label: 'PAD SIZE', kind: 'bar', min: 1, max: 5, n: 5 },
  { k: 'touchOpacity', label: 'PAD OPACITY', kind: 'bar', min: 1, max: 10 },
  { k: 'touchSide', label: 'PAD SIDE', kind: 'toggle', show: (o) => SIDES[o.touchSide] },
  { k: 'touchY', label: 'PAD HEIGHT', kind: 'bar', min: 0, max: 4, n: 5 },
  { k: 'fullscreen', label: 'FULLSCREEN', kind: 'toggle', show: () => (isFullscreen() ? 'ON' : 'OFF'), has: canFullscreen },
  { k: 'back', label: 'BACK', kind: 'act' },
];
const BAR_X = 142, SEG = 7;

export class OptionsScreen {
  constructor(game, args = {}) { this.g = game; this.sel = 0; this.t = 0; this.top = 0; this.back = args.back || 'title'; this.rows = ALL_ROWS.filter((r) => !r.has || r.has()); this.hits = new Hits(); }
  enter() {}
  change(row, d) {
    const o = this.g.options;
    const r = this.rows.find((x) => x.k === row);
    if (row === 'sound') o.sound = !o.sound;
    else if (row === 'crt') o.crt = (o.crt + (d || 1) + CRT_NAMES.length) % CRT_NAMES.length;
    else if (row === 'screenFit') o.screenFit = ((o.screenFit ?? 0) + (d || 1) + FITS.length) % FITS.length;
    else if (row === 'touchMode') o.touchMode = (o.touchMode + (d || 1) + TOUCH_MODES.length) % TOUCH_MODES.length;
    else if (row === 'touchSide') o.touchSide = o.touchSide ? 0 : 1;
    else if (row === 'fullscreen') { if (isFullscreen()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement); }
    else if (r && r.kind === 'bar') o[row] = Math.max(r.min, Math.min(r.max, o[row] + (d || 1)));
    save('options', o);
    applyOptions(this.g);
    this.g.audio.sfx(row === 'music' ? 'confirm' : 'menu');
  }
  setBar(row, v) {
    const o = this.g.options, r = this.rows.find((x) => x.k === row);
    v = Math.max(r.min, Math.min(r.max, v));
    if (o[row] === v) return;
    o[row] = v; save('options', o); applyOptions(this.g); this.g.audio.sfx(row === 'music' ? 'confirm' : 'menu');
  }
  update() {
    this.t++;
    const I = this.g.input, rows = this.rows, n = rows.length;
    for (const h of this.hits.take(I)) {
      const r = rows[h.id];
      if (h.extra === 'bar') { this.sel = h.id; this.setBar(r.k, r.min + Math.round((h.x / (h.w - 1)) * (r.max - r.min))); continue; }
      if (this.sel !== h.id) { this.sel = h.id; this.g.audio.sfx('menu'); if (r.kind === 'bar') continue; }
      I.fake('a');
    }
    const sw = swipe(I, 13);
    if (sw) { this.sel = Math.max(0, Math.min(n - 1, this.sel + sw)); this.g.audio.sfx('menu'); }
    if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; this.g.audio.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % n; this.g.audio.sfx('menu'); }
    if (I.pressed('pause')) { this.g.go(this.back); return; }
    const r = rows[this.sel];
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (d && r.kind !== 'act') this.change(r.k, d);
    if (I.confirm() || I.pressed('star')) {
      if (r.k === 'back') { this.g.audio.sfx('confirm'); this.g.go(this.back); }
      else if (r.kind === 'toggle') this.change(r.k, 1);
      else if (r.kind === 'bar') { if (this.g.options[r.k] >= r.max) this.setBar(r.k, r.min); else this.change(r.k, 1); } // (A on a bar steps it up, and round to the start)
    }
  }
  render(f) {
    f.clear(COL.black);
    drawTextBig(f, 'OPTIONS', 128, 8, COL.yellow, COL.black, 2);
    const PITCH = 13, Y0 = 30, rows = this.rows;
    panel(f, 14, Y0 - 4, 228, rows.length * PITCH + 6);
    this.hits.clear();
    const o = this.g.options;
    rows.forEach((r, i) => {
      const y = Y0 + i * PITCH, on = i === this.sel;
      if (on) f.blit(ICONS.glove, 18 + ((this.t >> 3) & 1), y + 1, UIPAL);
      drawText(f, r.label, 36, y, on ? COL.white : COL.grey, { mono: false });
      if (r.kind === 'toggle') { const v = r.show(o); drawText(f, v, 234 - textWidth(v, false), y, on ? COL.cyan : COL.off, { mono: false }); }
      if (r.kind === 'bar') {
        const segs = r.max - r.min + 1;
        for (let s = 0; s < segs; s++) f.rect(BAR_X + s * SEG + (segs < 8 ? s * 6 : 0), y, segs < 8 ? 11 : 5, 7, s + r.min <= o[r.k] ? COL.cyan : COL.dark);
        const bw = segs < 8 ? segs * 17 - 6 : segs * SEG - 2;
        this.hits.add(BAR_X - 3, y - 3, bw + 6, PITCH, i, 'bar');
        this.hits.add(14, y - 3, BAR_X - 17, PITCH, i);
      } else this.hits.add(14, y - 3, 228, PITCH, i);
    });
    const hint = this.rows[this.sel].kind === 'bar' ? 'TAP A BAR, OR LEFT / RIGHT' : 'TAP / A TO CHANGE';
    drawTextCentered(f, hint, 128, 196, COL.grey, { mono: false });
    drawTextCentered(f, 'F2 TOGGLES THE CRT FILTER ANYWHERE', 128, 208, COL.dark, { mono: false });
  }
}
