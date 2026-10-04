// The installable, offline game: registers the service worker (sw.js), asks the browser to keep the saves, and offers an update when a new version of the
// game has been downloaded. Only runs in a built copy (tools/build.mjs puts <meta name="ko-deploy"> in its index.html): the dev server never caches.
const deploy = document.querySelector('meta[name="ko-deploy"]');
if (deploy && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  let screenName = 'title', waiting = null, reloading = false;
  window.addEventListener('ko:screen', (e) => { screenName = e.detail; apply(false); });

  // The player is never thrown out of a fight by an update: it is applied on the title screen at once, or when the player taps the card.
  function apply(force) {
    if (!waiting) return;
    if (force || screenName === 'title') waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  function offer() {
    if (document.getElementById('update-card')) return;
    const b = document.createElement('button');
    b.id = 'update-card';
    b.setAttribute('data-native-touch', ''); // (touch.js leaves it to the browser, so a tap on it is a click)
    b.textContent = 'NEW VERSION READY - TAP TO UPDATE';
    b.style.cssText = 'position:fixed;z-index:30;left:50%;transform:translateX(-50%);top:max(8px,env(safe-area-inset-top));padding:8px 14px;font:bold 12px monospace;letter-spacing:1px;color:#fff;background:#1a3a8a;border:2px solid #fff;border-radius:0;cursor:pointer;image-rendering:pixelated';
    b.addEventListener('click', () => apply(true));
    document.body.appendChild(b);
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) return; reloading = true; location.reload(); });

  navigator.serviceWorker.register('./sw.js', { scope: './' }).then((reg) => {
    const watch = (sw) => sw.addEventListener('statechange', () => { if (sw.state === 'installed' && navigator.serviceWorker.controller) { waiting = sw; offer(); apply(false); } });
    if (reg.waiting && navigator.serviceWorker.controller) { waiting = reg.waiting; offer(); apply(false); }
    reg.addEventListener('updatefound', () => reg.installing && watch(reg.installing));
    // look for a new version when the game opens, whenever it comes back to the front, and once an hour
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    setInterval(check, 3600 * 1000);
  }).catch(() => { /* no service worker (private window): the game just needs the network */ });

  // saves are in localStorage: ask that the browser never clears them to make room
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
