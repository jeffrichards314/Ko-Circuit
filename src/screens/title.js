// Title screen: logo panel, menu with glove cursor.
import { COL, UIPAL } from '../fight/hud.js';
import { drawTextBig, drawTextCentered } from '../engine/font.js';
import { ICONS } from '../../data/sprites/ui.js';
import { c32 } from '../engine/palette.js';
import { SLOTS } from '../save/storage.js';
import { saveSummary } from '../save/session.js';

const GRID = c32(4, 9, 22), GRID_HI = c32(7, 15, 30), LOGO = c32(31, 19, 5), LOGO_HI = c32(31, 29, 10), LOGO_DK = c32(20, 6, 3);

export class TitleScreen {
  constructor(game) {
    this.g = game;
    this.t = 0;
    // the title is only the doors into the game: everything else is a place on the world map (src/screens/worldMap.js)
    this.items = [];
    if (game.career) this.items.push({ label: 'CONTINUE', go: () => { game.loc = { area: 'world' }; game.go('map'); } });
    // (every save is its own: LOAD GAME opens another one, NEW GAME starts in a slot of your choice, a password goes into one too: src/screens/saves.js)
    const saved = Array.from({ length: SLOTS }, (_, i) => saveSummary(i + 1)).filter(Boolean).length;
    if (saved > 1 || (saved === 1 && !game.career)) this.items.push({ label: 'LOAD GAME', go: () => game.go('saves', { mode: 'load' }) });
    this.items.push(
      { label: 'NEW GAME', go: () => game.go('saves', { mode: 'new' }) },
      { label: 'PASSWORD', go: () => game.go('password') },
      { label: 'OPTIONS', go: () => game.go('options') },
    );
    this.sel = 0;
  }
  enter() { this.g.audio.play(this.g.songs.title); }
  update() {
    this.t++;
    const I = this.g.input;
    // a tap (or a click) on an entry chooses it
    for (const tp of (I.takeTaps ? I.takeTaps() : [])) { const i = Math.round((tp.y - 132) / 16); if (i >= 0 && i < this.items.length && Math.abs(tp.x - 128) < 70) { this.sel = i; this.g.audio.sfx('confirm'); this.items[i].go(); return; } }
    if (I.pressed('up')) { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.g.audio.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % this.items.length; this.g.audio.sfx('menu'); }
    if (I.confirm() || I.pressed('star')) { this.g.audio.sfx('confirm'); this.items[this.sel].go(); }
  }
  render(f) {
    f.clear(COL.black);
    // grid panel
    const x0 = 20, y0 = 20, w = 216, h = 92;
    f.rect(x0 - 2, y0 - 2, w + 4, h + 4, GRID_HI);
    f.rect(x0, y0, w, h, GRID);
    for (let y = y0 + 3; y < y0 + h; y += 4) for (let x = x0 + 3; x < x0 + w; x += 4) f.px(x, y, GRID_HI);
    // logo: KO big, CIRCUIT under it, with a drop shade
    const bob = (this.t >> 5) & 1;
    drawTextBig(f, 'KO', 131, 32 + 2, LOGO_DK, COL.black, 5);
    drawTextBig(f, 'KO', 128, 32, LOGO, COL.black, 5);
    for (let x = 90; x < 170; x++) for (let y = 32; y < 40; y++) if (f.buf[y * 256 + x] === LOGO) f.px(x, y, LOGO_HI);
    drawTextBig(f, 'CIRCUIT', 129, 84, LOGO_DK, COL.black, 2);
    drawTextBig(f, 'CIRCUIT', 128, 83, COL.white, COL.black, 2);
    f.blit(ICONS.glove, 58, 58 + bob, UIPAL);
    f.blit(ICONS.glove, 198, 58 + bob, UIPAL, { flip: true });

    this.items.forEach((it, i) => {
      const label = typeof it.label === 'function' ? it.label() : it.label;
      const y = 128 + i * 16;
      drawTextCentered(f, label, 128, y, i === this.sel ? COL.white : COL.grey);
      if (i === this.sel) {
        f.blit(ICONS.glove, 62 + ((this.t >> 3) & 1), y + 3, UIPAL);
        f.blit(ICONS.glove, 194 - ((this.t >> 3) & 1), y + 3, UIPAL, { flip: true });
      }
    });
    drawTextCentered(f, 'ARROWS MOVE   A / ENTER: CHOOSE', 128, 208, COL.grey, { mono: false });
  }
}
