// The desk in the Home gym (spec §19 G4): save, your password, options, controls, and the way back to the title screen. It is a station of the
// interior (data/interiors.js): you walk up to the desk and sit down.
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { showChar } from '../save/password.js';
import { drawPassword } from '../engine/textbox.js';
import { passwordOf } from '../save/career.js';
import { Hits, anyTap } from '../engine/hits.js';

const BG = c32(6, 4, 3), STRIPE = c32(9, 6, 4);
const ITEMS = [
  { id: 'save', label: 'SAVE GAME' },
  { id: 'password', label: 'YOUR PASSWORD' },
  { id: 'enter', label: 'ENTER A PASSWORD' },
  { id: 'options', label: 'OPTIONS' },
  { id: 'controls', label: 'CONTROLS' },
  { id: 'title', label: 'TITLE SCREEN' },
  { id: 'back', label: 'BACK TO THE GYM' },
];

export class DeskScreen {
  constructor(game) { this.g = game; this.t = 0; this.sel = 0; this.show = null; this.note = null; this.noteT = 0; this.confirmTitle = false; this.hits = new Hits(); }
  enter() { this.g.audio.play(this.g.songs.training); }
  update() {
    this.t++;
    if (this.noteT > 0 && --this.noteT === 0) this.note = null;
    const I = this.g.input, A = this.g.audio, g = this.g, n = ITEMS.length;
    if (this.show) { if (anyTap(I)) I.fake('a'); if (I.confirm() || I.back()) { this.show = null; A.sfx('menu'); } return; }
    this.hits.rows(I, this.sel, (i) => { this.sel = i; this.confirmTitle = false; A.sfx('menu'); });
    if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; A.sfx('menu'); this.confirmTitle = false; }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % n; A.sfx('menu'); this.confirmTitle = false; }
    if (I.back()) { A.sfx('menu'); g.go('map'); return; }
    if (!(I.confirm() || I.pressed('star'))) return;
    const id = ITEMS[this.sel].id;
    A.sfx('confirm');
    if (id === 'save') { g.saveCareer(); this.note = 'SAVED.'; this.noteT = 120; }
    else if (id === 'password') this.show = 'password';
    else if (id === 'enter') g.go('password', { back: 'map' });
    else if (id === 'options') g.go('options', { back: 'map' });
    else if (id === 'controls') g.go('controls', { back: 'map' });
    else if (id === 'title') { if (!this.confirmTitle) { this.confirmTitle = true; this.note = 'PUSH AGAIN TO LEAVE. YOUR GAME IS SAVED.'; this.noteT = 150; } else { g.saveCareer(); g.loc = { area: 'world' }; g.go('title'); } }
    else g.go('map');
  }
  render(f) {
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((this.t >> 3) & 7), 256, 2, STRIPE);
    drawTextBig(f, 'THE DESK', 128, 8, c32(30, 24, 6), COL.black, 2);
    panel(f, 40, 34, 176, 134);
    this.hits.clear();
    ITEMS.forEach((it, i) => {
      const y = 44 + i * 17, on = i === this.sel;
      this.hits.add(40, y - 5, 176, 17, i);
      if (on) f.blit(ICONS.glove, 48 + ((this.t >> 3) & 1), y + 3, UIPAL);
      drawText(f, it.label, 66, y, on ? COL.white : COL.grey, { mono: false });
    });
    if (this.show === 'password') {
      panel(f, 28, 70, 200, 76);
      drawTextCentered(f, 'YOUR PASSWORD', 128, 78, COL.yellow, { mono: false });
      drawPassword(f, passwordOf(this.g.career), 36, 94, 184, COL.white, { show: showChar, where: 'desk password' });
      drawTextCentered(f, 'WRITE IT DOWN!', 128, 114, COL.grey, { mono: false });
      drawTextCentered(f, '(YOUR NAME IS NOT SAVED IN IT)', 128, 126, COL.grey, { mono: false });
    }
    drawTextCentered(f, this.note || 'YOUR GAME SAVES ITSELF AS YOU PLAY', 128, 184, this.note ? COL.yellow : COL.grey, { mono: false });
    drawTextCentered(f, 'A: CHOOSE   B: BACK', 128, 204, COL.dark, { mono: false });
  }
}
