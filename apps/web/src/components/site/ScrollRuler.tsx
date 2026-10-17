'use client';
import { useEffect, useRef } from 'react';

const PX_PER_CM = 96 / 2.54;

/** Real-scale ruler pinned to the page edge (port of legacy js/ruler.js). */
export function ScrollRuler() {
  const ref = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current, tag = tagRef.current, num = numRef.current;
    if (!el || !tag || !num) return;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      el.style.backgroundPositionY = `${-y}px, ${-y}px`;
      tag.style.top = `${(y / max) * (window.innerHeight - 30)}px`;
      num.textContent = String(Math.round(y / PX_PER_CM));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="scroll-ruler" aria-hidden="true" ref={ref}>
      <div className="sr-tag" ref={tagRef}>
        <b ref={numRef}>0</b> cm
      </div>
    </div>
  );
}
