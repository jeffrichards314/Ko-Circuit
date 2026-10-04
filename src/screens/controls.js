// Key remapping. Bindings are saved to localStorage by the Input module.
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered } from '../engine/font.js';
import { ACTIONS, ACTION_LABELS, keyName } from '../engine/input.js';
import { Hits } from '../engine/hits.js';

export class ControlsScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.back = args.back || 'title';
    this.sel = 0;
    this.listening = false;
    this.t = 0;
    this.items = [...ACTIONS, 'reset', 'back'];
    this.hits = new Hits();
  }
  enter() {}
  update() {
    this.t++;
    const I = this.g.input;
    if (this.listening) {
      if (this.hits.take(I).length) { this.listening = false; this.g.audio.sfx('menu'); return; } // (a tap: no key to wait for)
      const k = I.takeLastKey();
      if (k && this.t > this.listenAt + 2) {
        I.setBinding(this.items[this.sel], k);
        this.listening = false;
        this.g.audio.sfx('confirm');
      }
      return;
    }
    this.hits.rows(I, this.sel, (i) => { this.sel = i; this.g.audio.sfx('menu'); });
    if (I.pressed('up')) { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.g.audio.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % this.items.length; this.g.audio.sfx('menu'); }
    if (I.pressed('pause')) { this.g.go(this.back); return; }
    if (I.confirm()) {
      const it = this.items[this.sel];
      this.g.audio.sfx('confirm');
      if (it === 'back') this.g.go(this.back);
      else if (it === 'reset') I.resetBindings();
      else { this.listening = true; this.listenAt = this.t; I.takeLastKey(); }
    }
  }
  render(f) {
    f.clear(COL.black);
    drawTextCentered(f, 'CONTROLS', 128, 12, COL.yellow);
    panel(f, 16, 28, 224, 166);
    const I = this.g.input;
    this.hits.clear();
    this.items.forEach((it, i) => {
      const y = 36 + i * 14;
      this.hits.add(16, y - 3, 224, 14, i);
      const on = i === this.sel;
      if (on) drawText(f, '>', 22, y, COL.red);
      if (it === 'reset') { drawText(f, 'RESET DEFAULTS', 34, y, on ? COL.white : COL.grey, { mono: false }); return; }
      if (it === 'back') { drawText(f, 'BACK', 34, y, on ? COL.white : COL.grey, { mono: false }); return; }
      drawText(f, ACTION_LABELS[it], 34, y, on ? COL.white : COL.grey, { mono: false });
      const val = this.listening && on ? ((this.t >> 3) & 1 ? 'PRESS KEY' : '') : I.bindings[it].map(keyName).join(' ');
      drawText(f, val, 150, y, on ? COL.cyan : COL.grey, { mono: false });
    });
    drawTextCentered(f, 'GAMEPAD: D-PAD, A/B, Y STAR, START', 128, 202, COL.grey, { mono: false });
  }
}
