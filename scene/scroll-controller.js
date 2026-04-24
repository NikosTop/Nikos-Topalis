export function createScrollController() {
  let current = 0;
  let target = 0;
  let lastTouchY = null;

  const WHEEL_SPEED = 0.00115; // desktop stays exactly the same
  const TOUCH_SPEED = 0.01;  // faster for phones/tablets

  function onWheel(event) {
    event.preventDefault();
    target += event.deltaY * WHEEL_SPEED;
  }

  function onTouchStart(event) {
    if (!event.touches || event.touches.length !== 1) return;
    lastTouchY = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!event.touches || event.touches.length !== 1 || lastTouchY === null) return;

    const touchY = event.touches[0].clientY;
    const deltaY = lastTouchY - touchY;

    target += deltaY * TOUCH_SPEED;
    lastTouchY = touchY;

    event.preventDefault();
  }

  function onTouchEnd() {
    lastTouchY = null;
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  return {
    tick() {
      current += (target - current) * 0.08;
      return current;
    }
  };
}