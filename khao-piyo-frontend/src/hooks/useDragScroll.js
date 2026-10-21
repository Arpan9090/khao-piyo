import { useCallback, useEffect, useRef, useState } from 'react';

// Gives a horizontally scrollable element:
//  - mouse drag-to-scroll
//  - slow auto-scroll that bounces at both ends
//  - pause on hover, touch, drag and when off-screen
//  - scrollByDir(±1) for arrow buttons
const useDragScroll = ({ speed = 30 } = {}) => {
  const [el, setEl] = useState(null);
  const holdUntil = useRef(0);

  const scrollByDir = useCallback(
    (dir) => {
      if (!el) return;
      holdUntil.current = performance.now() + 1200; // let the smooth scroll finish
      el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    },
    [el]
  );

  useEffect(() => {
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let last = performance.now();
    let dir = 1;
    let pos = el.scrollLeft;
    let hovering = false;
    let touching = false;
    let dragging = false;
    let visible = true;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let touchTimer;

    const tick = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const held = now < holdUntil.current;

      if (speed && !reduceMotion && visible && !hovering && !touching && !dragging && !held) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          pos += ((speed * dt) / 1000) * dir;
          if (pos >= max) { pos = max; dir = -1; }
          else if (pos <= 0) { pos = 0; dir = 1; }
          el.scrollLeft = pos;
        }
      } else {
        pos = el.scrollLeft; // stay in sync with manual scrolling
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = (e) => { if (e.pointerType === 'mouse') hovering = true; };
    const onLeave = (e) => { if (e.pointerType === 'mouse') hovering = false; };

    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      pos = el.scrollLeft;
    };

    // After a drag, swallow the click so cards/buttons don't fire
    const onClickCapture = (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const onDragStart = (e) => e.preventDefault(); // no ghost-dragging of images/links

    const onTouchStart = () => { touching = true; clearTimeout(touchTimer); };
    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(() => { touching = false; }, 2500);
    };

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(el);

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(touchTimer);
      io.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('dragstart', onDragStart);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [el, speed]);

  return { ref: setEl, scrollByDir };
};

export default useDragScroll;