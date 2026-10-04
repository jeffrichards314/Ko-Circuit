// THE BLIMP (spec §19 G11): fast travel between the worlds. A blimp is moored in every world once it is open (by the Home gym on the
// circuit road, on Victory Plaza in the city of champions, by the warp in ZERO's world, at the foot of the Pantheon's stairs, by the
// rope in the Underworld, by the tear in the Void). Board one and pick where to go: the flight plays (src/screens/travel.js 'blimp')
// and you step off at that world's blimp.
//   UP/DOWN pick   A fly   B stay
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { W, H } from '../engine/renderer.js';
import { ZONES, NODES } from '../../data/world/index.js';
import { cond, zoneOpen, loadWorld, saveWorld } from '../world/state.js';
import { hash2 } from '../world/img.js';
import { Hits } from '../engine/hits.js';

// where each blimp is moored, as the list says it
const DOCK = { blimpMain: 'HOMETOWN', blimpChamp: 'VICTORY PLAZA', blimpZero: 'BY THE WARP', blimpPan: 'THE GATE OF DAWN', blimpUnder: 'THE STYX', blimpVoid: 'THE TEAR' };
const ORDER = ['blimpMain', 'blimpChamp', 'blimpZero', 'blimpPan', 'blimpUnder', 'blimpVoid'];

// the blimps you can fly to now
// (no blimp flies before you have been to the city of champions)
export const blimpStops = (g) => (cond('visited:champ', g) ? ORDER.filter((id) => NODES[id] && zoneOpen(g, NODES[id].zone) && cond(NODES[id].needs, g)) : []);

export class BlimpScreen {
  constructor(game, args = {}) {
    this.g = game; this.from = args.from; this.t = 0; this.hits = new Hits();
    this.stops = blimpStops(game);
    this.sel = Math.max(0, this.stops.indexOf(this.from));
  }
  enter() { this.g.loc = { area: 'world' }; this.g.audio.play(this.g.songs.roadTrip || this.g.songs.map); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, n = this.stops.length;
    if (I.back()) { A.sfx('menu'); this.g.go('map'); return; }
    this.hits.rows(I, this.sel, (i) => { this.sel = i; A.sfx('menu'); });
    if (I.pressed('up') && n) { this.sel = (this.sel + n - 1) % n; A.sfx('menu'); }
    if (I.pressed('down') && n) { this.sel = (this.sel + 1) % n; A.sfx('menu'); }
    if (I.confirm() && n) {
      const to = this.stops[this.sel];
      if (to === this.from) { A.sfx('tired'); return; }
      A.sfx('confirm');
      const ws = loadWorld(), key = 'blimp>';
      ws.pos = to; saveWorld(ws);
      this.g.go('travel', { travel: 'blimp', back: false, to: NODES[to].zone, at: to, from: NODES[this.from] ? NODES[this.from].zone : 'main', first: !ws.travel[key] });
    }
  }
  render(f) {
    const t = this.t;
    // a sky and clouds going by under the gondola's window
    for (let y = 0; y < H; y++) f.rect(0, y, W, 1, y < 60 ? c32(10, 17, 29) : y < 120 ? c32(14, 22, 31) : c32(19, 26, 31));
    for (let i = 0; i < 9; i++) { const x = ((hash2(i, 1, 5) * 300 - t * (0.4 + (i % 3) * 0.3)) % 300 + 300) % 300 - 30, y = 30 + (i * 23) % 170; for (let j = -4; j <= 4; j++) { const w = Math.round(Math.sqrt(16 - (j * j) / 1.2) * 5); f.rect(Math.round(x) - w, y + j, w * 2, 1, j > 1 ? c32(24, 27, 31) : c32(31, 31, 31)); } }
    drawTextBig(f, 'THE BLIMP', 128, 8, COL.yellow, COL.black, 2);
    panel(f, 24, 32, 208, 24 + this.stops.length * 22);
    drawTextCentered(f, 'WHERE TO, CHAMP?', 128, 38, COL.cyan, { mono: false });
    this.hits.clear();
    this.stops.forEach((id, i) => {
      const y = 52 + i * 22, sel = i === this.sel, Z = ZONES[NODES[id].zone], here = id === this.from;
      this.hits.add(30, y - 2, 196, 20, i);
      if (sel) { f.rect(30, y - 2, 196, 20, c32(4, 7, 14)); f.rect(30, y - 2, 196, 1, COL.yellow); f.rect(30, y + 17, 196, 1, COL.yellow); f.rect(34, y + 5, 4, 5, COL.yellow); }
      drawText(f, Z.name, 44, y, sel ? COL.white : COL.grey, { mono: false });
      drawText(f, here ? `${DOCK[id]}  - HERE` : DOCK[id], 44, y + 9, sel ? COL.yellow : COL.off, { mono: false });
    });
    drawTextCentered(f, 'UP/DOWN: PICK   A: FLY   B: STAY', 128, H - 14, COL.white, { mono: false });
  }
}
