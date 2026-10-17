'use client';
import { useEffect, useRef, useState } from 'react';

// Clips served from /public/fondo. TODO(backend): the legacy store listed them via /api/fondo (admin-managed).
const CLIPS = Array.from({ length: 7 }, (_, i) => `/fondo/fondo-${i + 1}.mp4`);

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Loads a clip on a video element; resolves false when it cannot play (codec, network, timeout). */
function playOn(v: HTMLVideoElement, src: string): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(t);
      v.removeEventListener('canplay', onCan);
      v.removeEventListener('error', onErr);
      resolve(ok);
    };
    const onCan = () => v.play().then(() => finish(true), () => finish(false));
    const onErr = () => finish(false);
    const t = setTimeout(() => finish(false), 8000);
    v.addEventListener('canplay', onCan);
    v.addEventListener('error', onErr);
    v.src = src;
    v.currentTime = 0;
    v.load();
  });
}

/** Muted background videos on the hero that cross-fade (port of legacy js/fondo.js). */
export function BgVideo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const box = boxRef.current, a = aRef.current, b = bRef.current;
    if (!box || !a || !b) return;
    const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection || {};
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) {
      setRemoved(true);
      return;
    }
    const list = shuffle(CLIPS);
    const vids = [a, b];
    vids.forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });
    let cur = 0, idx = 0, failures = 0, cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function next(): Promise<void> {
      if (cancelled) return;
      const incoming = vids[1 - cur], outgoing = vids[cur];
      const ok = await playOn(incoming, list[idx % list.length]);
      idx++;
      if (cancelled) return;
      if (!ok) {
        if (++failures >= list.length) {
          setRemoved(true);
          return;
        }
        return next();
      }
      failures = 0;
      box!.classList.add('ready');
      incoming.classList.add('show');
      outgoing.classList.remove('show');
      cur = 1 - cur;
      clearTimeout(timer);
      timer = setTimeout(next, Math.max(2000, Math.min(9000, (incoming.duration || 9) * 1000 - 200)));
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = vids[cur];
        if (!v.src) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      });
    });
    io.observe(box);
    void next();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      io.disconnect();
      vids.forEach((v) => v.pause());
    };
  }, []);

  if (removed) return null;
  return (
    <div className="bgvideo" id="bgvideo" aria-hidden="true" ref={boxRef}>
      <video className="bgv a" muted playsInline preload="none" ref={aRef} />
      <video className="bgv b" muted playsInline preload="none" ref={bRef} />
      <div className="bgv-veil" />
    </div>
  );
}
