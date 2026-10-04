// Shared boilerplate for the upper Pantheon arenas (Phase B): a seated crowd in robes, a ring with
// two posts and three ropes, the standard palette banks. Each arena supplies its colours and its paint.
import { makePalette } from '../../src/engine/palette.js';

export const crowdPalette = (name, robes, outline = [3, 3, 6]) => makePalette(name, {
  outline,
  skin1: [29, 21, 17], skin1s: [21, 13, 11], skin2: [21, 13, 9], skin2s: [13, 8, 6], skin3: [12, 8, 6], skin3s: [7, 4, 3],
  hairA: [3, 3, 4], hairB: [19, 19, 24], hairC: [28, 28, 30],
  robeA: robes[0], robeB: robes[1], robeC: robes[2], robeSh: robes[3],
});
export const crowdOf = (seed, extra = {}) => ({
  style: 'seated', density: 0.5, excitable: 0.8, seed, outline: 'outline',
  rows: [{ y: 66, x0: 8, x1: 248, spacing: 13, skip: [[70, 186]] }, { y: 79, x0: 20, x1: 236, spacing: 13, skip: [[100, 156]] }],
  skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
  hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
  shirts: [['robeA', 'robeSh'], ['robeB', 'robeSh'], ['robeC', 'robeSh'], ['robeA', 'robeSh']],
  ...extra,
});
// ropes + corner posts on top of a floor already painted: [y, colour, shade] per rope
export function ringRopes(p, ropes, post) {
  for (const [y, a, b] of ropes) {
    p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
    for (let x = 20; x < 240; x += 9) p.px(x, y, b);
    p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
    p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
  }
  for (const x of [8, 241]) {
    p.rect(x, 44, 7, 48, post[0]); p.rect(x + 1, 44, 5, 48, post[1]); p.vline(x + 2, 45, 90, post[2]);
    p.rect(x - 1, 40, 9, 5, post[3]); p.rect(x, 40, 7, 4, post[4]); p.hline(x, x + 6, 40, post[5]);
    p.rect(x - 1, 90, 9, 3, post[0]);
  }
}
export const seatedCrowdReact = (frame, arena, t, col) => {
  if (arena.react > 0 && arena.crowd.length) {
    const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
    if (sp && !((t >> 2) % 3)) { const c = col; frame.px(sp.x + 2, sp.y - 7, c); frame.px(sp.x + 1, sp.y - 7, c); frame.px(sp.x + 3, sp.y - 7, c); frame.px(sp.x + 2, sp.y - 8, c); frame.px(sp.x + 2, sp.y - 6, c); }
  }
};
