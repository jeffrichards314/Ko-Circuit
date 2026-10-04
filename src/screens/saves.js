// The saves (2026-10-03): the slots that all progress belongs to (src/save/storage.js, session.js). One screen for the three ways in:
//   load      pick a save that has a game in it and open it (Load Game on the title screen)
//   new       pick a slot and start a new game in it; a slot with a game in it asks twice before it is erased (New Game)
//   password  pick the slot a password's career goes into (args.career: already checked by the password screen); the slot starts empty but for it
// Opening a save replaces everything in memory with that slot's own (session.js): nothing is carried over from the one before.
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered } from '../engine/font.js';
import { drawLabel } from '../engine/textbox.js';
import { ICONS } from '../../data/sprites/ui.js';
import { SLOTS } from '../save/storage.js';
import { openSave, startNewSave, startPasswordSave, saveSummary } from '../save/session.js';
import { snapWorld } from './worldMap.js';

const HEAD = { load: 'LOAD GAME', new: 'NEW GAME: PICK A SAVE', password: 'PASSWORD: PICK A SAVE' };

export class SavesScreen {
  constructor(game, args = {}) {
    this.g = game; this.mode = args.mode || 'load'; this.career = args.career || null; this.back = args.back || 'title';
    this.t = 0; this.confirm = null; this.note = null; this.noteT = 0;
    this.rows = Array.from({ length: SLOTS }, (_, i) => saveSummary(i + 1));
    // it opens on the open save when loading, else on the first empty slot (a new game seldom wants to erase)
    const empty = this.rows.findIndex((r) => !r);
    this.sel = this.mode === 'load' ? Math.max(0, (game.slot || 1) - 1) : empty >= 0 ? empty : Math.max(0, (game.slot || 1) - 1);
  }
  enter() { this.g.audio.play(this.g.songs.map); }
  say(text) { this.note = text; this.noteT = 150; }
  update() {
    this.t++;
    if (this.noteT > 0 && --this.noteT === 0) this.note = null;
    const I = this.g.input, A = this.g.audio, n = this.rows.length;
    const taps = I.takeTaps ? I.takeTaps() : [];
    for (const tp of taps) { const i = Math.floor((tp.y - 34) / 50); if (i >= 0 && i < n) { if (this.sel === i) { this.choose(); return; } this.sel = i; this.confirm = null; A.sfx('menu'); } }
    if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; this.confirm = null; A.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % n; this.confirm = null; A.sfx('menu'); }
    if (I.back()) { A.sfx('menu'); this.g.go(this.back); return; }
    if (I.confirm() || I.pressed('star')) this.choose();
  }
  choose() {
    const g = this.g, A = g.audio, n = this.sel + 1, row = this.rows[this.sel];
    if (this.mode === 'load') {
      if (!row) { A.sfx('tired'); this.say('NOTHING SAVED HERE.'); return; }
      A.sfx('confirm'); openSave(g, n); g.go('map', { snap: false });
      return;
    }
    // a slot with a game in it is only erased on the second push
    if (row && this.confirm !== n) { this.confirm = n; A.sfx('menu'); return; }
    A.sfx('confirm');
    if (this.mode === 'new') {
      startNewSave(g, n);
      g.go('customize', { next: 'map', fresh: true });
    } else {
      startPasswordSave(g, n, this.career);
      snapWorld(g); // (no road-unlocking reveals replay: the map takes the career's world as already seen)
      g.go('customize', { next: 'map', nextArgs: { snap: true }, naming: true });
    }
  }
  render(f) {
    f.clear(COL.black);
    drawTextCentered(f, HEAD[this.mode], 128, 10, COL.yellow);
    drawTextCentered(f, this.mode === 'load' ? 'EACH SAVE IS ITS OWN GAME' : this.mode === 'new' ? 'THE OTHER SAVES ARE LEFT ALONE' : 'THE CODE BECOMES A SAVE', 128, 22, COL.grey, { mono: false });
    this.rows.forEach((r, i) => {
      const y = 34 + i * 50, on = i === this.sel, open = (this.g.slot || 1) === i + 1;
      panel(f, 14, y, 228, 44);
      if (on) f.blit(ICONS.glove, 18 + ((this.t >> 3) & 1), y + 17, UIPAL);
      drawText(f, `SAVE ${i + 1}`, 34, y + 5, on ? COL.white : COL.grey, { mono: false });
      if (open) drawText(f, 'OPEN', 236 - 28, y + 5, COL.cyan, { mono: false });
      if (!r) { drawText(f, 'EMPTY', 34, y + 18, COL.dark || COL.grey, { mono: false }); return; }
      drawLabel(f, r.name, 96, y + 5, 100, COL.yellow, { mono: false, where: 'save name' });
      drawLabel(f, r.where, 34, y + 18, 200, COL.white, { mono: false, where: 'save where' });
      drawText(f, `${r.wins} WINS   ${r.medals}/${r.total} MEDALS`, 34, y + 30, COL.grey, { mono: false });
    });
    const warn = this.confirm === this.sel + 1;
    const line = this.note || (warn ? 'ERASES THAT SAVE. PUSH A AGAIN' : this.mode === 'load' ? 'A: OPEN   B: BACK' : 'A: CHOOSE   B: BACK');
    drawTextCentered(f, line, 128, 196, this.note ? COL.yellow : warn ? COL.red : COL.grey, { mono: false });
    drawTextCentered(f, this.mode === 'password' ? 'NO NAME OR LOOKS IN A PASSWORD' : '', 128, 208, COL.dark || COL.grey, { mono: false });
  }
}
