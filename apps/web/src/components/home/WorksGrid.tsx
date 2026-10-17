'use client';
import { useEffect, useState } from 'react';

const PAGE = 12;
const MEDIA_TYPE = { IMAGE: 'image', VIDEO: 'video' } as const;
type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

interface WorkMedia {
  type: MediaType;
  url: string;
}

// Static media from /public/trabajos. TODO(backend): the legacy store served this list (plus captions and
// Instagram/TikTok embeds) from /api/trabajos, managed from the admin panel.
const MEDIA: WorkMedia[] = [
  ...Array.from({ length: 64 }, (_, i): WorkMedia => ({ type: MEDIA_TYPE.IMAGE, url: `/trabajos/${String(i + 1).padStart(3, '0')}.webp` })),
  ...Array.from({ length: 8 }, (_, i): WorkMedia => ({ type: MEDIA_TYPE.VIDEO, url: `/trabajos/${101 + i}.mp4` })),
];

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** "Trabajos realizados" gallery with "Ver más" paging and a lightbox (port of legacy js/trabajos.js). */
export function WorksGrid() {
  // Shuffled after mount so server and client markup match on hydration.
  const [cards, setCards] = useState<WorkMedia[]>([]);
  const [shown, setShown] = useState(PAGE);
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => setCards(shuffle(MEDIA)), []);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom]);

  const visible = cards.slice(0, shown);
  const left = cards.length - Math.min(cards.length, shown);
  return (
    <>
      <div className="works-grid" id="works-grid" hidden={!cards.length}>
        {visible.map((m) =>
          m.type === MEDIA_TYPE.VIDEO ? (
            <figure className="work" key={m.url}>
              <video src={m.url} muted loop playsInline preload="metadata" controls />
            </figure>
          ) : (
            <figure className="work" key={m.url}>
              <img src={m.url} alt="Trabajo realizado en nalv.estudio" loading="lazy" onClick={() => setZoom(m.url)} />
            </figure>
          ),
        )}
      </div>
      {cards.length ? (
        <button type="button" className="btn btn-ghost works-more" hidden={left <= 0} onClick={() => setShown((s) => s + PAGE)}>
          Ver más trabajos ({left})
        </button>
      ) : null}
      {zoom ? (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <img src={zoom} alt="Trabajo realizado en nalv.estudio" />
        </div>
      ) : null}
    </>
  );
}
