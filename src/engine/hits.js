// Tap targets for the touch screen (spec §3). A screen registers the areas it draws a choice in while it renders (hits.add), and reads the taps that
// landed on them in its update (hits.take): the same rows the cursor moves over, so a tap on a row is the cursor going there.
//   const H = this.hits = new Hits();            render: H.clear(); ...H.add(x, y, w, h, id)...        update: for (const id of H.take(input)) ...
// Areas are in native 256x224 coordinates. A later area wins where two overlap (a button drawn over a row).
export class Hits {
  constructor() { this.list = []; }
  clear() { this.list.length = 0; }
  add(x, y, w, h, id, extra) { this.list.push({ x, y, w, h, id, extra }); }
  at(px, py) {
    for (let i = this.list.length - 1; i >= 0; i--) { const a = this.list[i]; if (px >= a.x && px < a.x + a.w && py >= a.y && py < a.y + a.h) return a; }
    return null;
  }
  // the areas hit by this step's taps: [{ id, extra, x, y }] (x, y: the tap, relative to the area)
  take(input) {
    const out = [];
    for (const tp of typeof input.takeTaps === 'function' ? input.takeTaps() : []) { const a = this.at(tp.x, tp.y); if (a) out.push({ id: a.id, extra: a.extra, x: tp.x - a.x, y: tp.y - a.y, w: a.w, h: a.h }); }
    return out;
  }
  // A list of rows (ids are row numbers): a tap on a row moves the cursor to it; a tap on the row the cursor is on presses A.
  // Returns the ids tapped (after the first tap on a row the screen may want to do more: reset a confirm, say).
  rows(input, sel, choose) {
    const ids = [];
    let cur = sel;
    for (const h of this.take(input)) {
      if (typeof h.id !== 'number') continue;
      ids.push(h.id);
      if (h.id !== cur) { cur = h.id; choose(h.id); } else input.fake('a');
    }
    return ids;
  }
}

// rows to scroll for the finger's drag (see Input.swipeRows); 0 where the input has no touch
export const swipe = (input, pitch) => (typeof input.swipeRows === 'function' ? input.swipeRows(pitch) : 0);
export const swipeX = (input, pitch) => (typeof input.swipeCols === 'function' ? input.swipeCols(pitch) : 0);

// Scroll a list by the finger's drag: `self.top` moves (pitch: native pixels a row), and the cursor `self.sel` is nudged to stay in view
// (`margin`: rows the cursor keeps clear of the top; `skip(i)`: rows the cursor may not rest on, like headers). Returns true if it moved.
export function scrollList(input, self, n, vis, { pitch = 10, margin = 0, skip = () => false } = {}) {
  const r = swipe(input, pitch);
  if (!r) return false;
  const top = Math.max(0, Math.min(Math.max(0, n - vis), self.top + r));
  if (top === self.top) return false;
  self.top = top;
  const lo = Math.min(n - 1, top + (top > 0 ? margin : 0)), hi = Math.min(n - 1, top + vis - 1);
  if (self.sel < lo) { let s = lo; while (s < n - 1 && skip(s)) s++; self.sel = s; }
  else if (self.sel > hi) { let s = hi; while (s > 0 && skip(s)) s--; self.sel = s; }
  return true;
}

// did a tap land on the picture this step? (it is used up: a screen where any tap means "go on" asks this)
export const anyTap = (input) => typeof input.takeTaps === 'function' && input.takeTaps().length > 0;
