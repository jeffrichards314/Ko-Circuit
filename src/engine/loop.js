// Fixed 60 fps timestep. All game timings are in frames.
// timeScale < 1 gives slow motion (fight-lab, practice).

export const FPS = 60;
const STEP = 1000 / FPS;

export function startLoop({ update, render, timeScale = () => 1 }) {
  let acc = 0;
  let last = performance.now();
  let running = true;
  function tick(now) {
    if (!running) return;
    const dt = Math.min(now - last, 250);
    last = now;
    acc += dt * timeScale();
    let steps = 0;
    while (acc >= STEP && steps < 6) {
      update();
      acc -= STEP;
      steps++;
    }
    if (steps === 6) acc = 0; // fell far behind (tab hidden): don't spiral
    render();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return { stop: () => { running = false; } };
}
