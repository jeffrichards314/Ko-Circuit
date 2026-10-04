// Keyboard + Gamepad input with remappable bindings (saved to localStorage).
// Call input.update() once at the start of every fixed step, then read
// input.held(a), input.pressed(a), input.released(a).

import { load, save } from '../save/storage.js';

export const ACTIONS = ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'star', 'pause'];

export const ACTION_LABELS = {
  up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
  a: 'A  RIGHT JAB', b: 'B  LEFT JAB', start: 'START', star: 'STAR PUNCH', pause: 'PAUSE',
};

export const DEFAULT_KEYS = {
  up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
  a: ['KeyX'], b: ['KeyZ'], start: ['Enter'], star: ['Space'], pause: ['KeyP', 'Escape'],
};

// Standard-mapping gamepad buttons.
export const DEFAULT_PAD = {
  up: [12], down: [13], left: [14], right: [15],
  a: [1], b: [0], start: [9], star: [3, 2], pause: [8],
};

export class Input {
  constructor(target = window) {
    this.keys = new Set();      // currently down
    this.downQueue = new Set(); // went down since last update
    this.bindings = load('bindings', null) || structuredClone(DEFAULT_KEYS);
    for (const a of ACTIONS) if (!this.bindings[a]) this.bindings[a] = [...DEFAULT_KEYS[a]];
    this.pad = DEFAULT_PAD;
    this.state = {}; this.prev = {}; this.edge = {};
    for (const a of ACTIONS) { this.state[a] = false; this.prev[a] = false; this.edge[a] = false; }
    this.lastKey = null;
    this.frame = 0;
    this.enabled = true;
    this.textMode = false;      // a screen taking typed text: letter/digit keys stop counting as buttons
    this.virtual = {};          // on-screen (touch) buttons held, by action (touch.js)
    this.vEdge = new Set();     // ...and the ones pressed since the last update
    this.taps = [];             // taps / clicks on the picture, in native 256x224 coordinates (the maps and halls walk to what is tapped)
    this.dragY = 0; this.dragX = 0; // a finger dragging on the picture (native pixels not yet used by a screen): swipe to scroll a list
    this.onDevice = null;       // (touch.js) told when the keyboard or a gamepad is used, to hide the on-screen pad
    const swallow = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
    target.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      if (this.onDevice && !e.metaKey && !e.ctrlKey && !/^(Shift|Control|Alt|Meta|Caps)/.test(e.key)) this.onDevice('keys');
      if (swallow.has(e.code)) e.preventDefault();
      if (!e.repeat) { this.downQueue.add(e.code); this.lastKey = e.code; }
      this.keys.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  update() {
    this.frame++;
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const a of ACTIONS) {
      let on = false, tapped = false;
      for (const k of this.bindings[a]) {
        if (this.textMode && /^(Key[A-Z]|Digit\d|Numpad\d|Space|Backspace)$/.test(k)) continue;
        if (this.keys.has(k)) on = true;
        if (this.downQueue.has(k)) tapped = true;
      }
      if (this.virtual[a]) on = true;
      if (this.vEdge.has(a)) tapped = true;
      for (const p of pads) {
        if (!p) continue;
        for (const b of this.pad[a]) if (p.buttons[b] && p.buttons[b].pressed) { on = true; if (this.onDevice) this.onDevice('pad'); }
        if (p.axes && p.axes.length >= 2) {
          if (a === 'left' && p.axes[0] < -0.5) on = true;
          if (a === 'right' && p.axes[0] > 0.5) on = true;
          if (a === 'up' && p.axes[1] < -0.5) on = true;
          if (a === 'down' && p.axes[1] > 0.5) on = true;
        }
      }
      this.prev[a] = this.state[a];
      this.state[a] = on || tapped;
      this.edge[a] = tapped || (on && !this.prev[a]);
    }
    this.downQueue.clear();
    this.vEdge.clear();
  }

  // touch: an on-screen button goes down or up; a tap on the picture is remembered until a screen takes it
  setVirtual(action, on) { if (on && !this.virtual[action]) this.vEdge.add(action); this.virtual[action] = on; }
  pushTap(x, y) { this.taps.push({ x, y, at: typeof performance !== 'undefined' ? performance.now() : 0 }); if (this.taps.length > 8) this.taps.shift(); }
  // (a tap nobody took within a moment is stale: it was for another screen)
  takeTaps() { const t = this.taps, now = typeof performance !== 'undefined' ? performance.now() : 0; this.taps = []; return t.filter((p) => now - p.at < 400); }
  // A screen that answers a tap as a button press (a menu row chosen twice, a text box turned) calls this during its update: the button reads as
  // pressed for the rest of this step, exactly as if it had been pushed on the pad.
  fake(a) { this.edge[a] = true; this.state[a] = true; }
  // a finger (or a wheel) dragging on the picture: rows to scroll, a row being `pitch` native pixels. Positive = later in the list (the finger
  // moving up). The part of a row not yet used stays for the next call.
  pushDrag(dx, dy) { this.dragX += dx; this.dragY += dy; }
  swipeRows(pitch) { const r = Math.trunc(-this.dragY / pitch); if (r) this.dragY += r * pitch; return r; }
  swipeCols(pitch) { const r = Math.trunc(-this.dragX / pitch); if (r) this.dragX += r * pitch; return r; }
  clearDrag() { this.dragX = 0; this.dragY = 0; }

  held(a) { return this.enabled && this.state[a]; }
  pressed(a) { return this.enabled && this.edge[a]; }
  released(a) { return this.enabled && this.prev[a] && !this.state[a]; }
  anyPressed(list = ['a', 'b', 'start', 'star']) { return list.some((a) => this.pressed(a)); }
  confirm() { return this.pressed('start') || this.pressed('a'); }
  back() { return this.pressed('b') || this.pressed('pause'); }

  // Remapping
  setBinding(action, code) {
    for (const a of ACTIONS) this.bindings[a] = this.bindings[a].filter((k) => k !== code);
    this.bindings[action] = [code];
    save('bindings', this.bindings);
  }
  resetBindings() {
    this.bindings = structuredClone(DEFAULT_KEYS);
    save('bindings', this.bindings);
  }
  takeLastKey() { const k = this.lastKey; this.lastKey = null; return k; }
}

export function keyName(code) {
  if (!code) return '---';
  return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Arrow/, '').replace('Enter', 'ENTER').replace('Space', 'SPACE').toUpperCase().slice(0, 8);
}
