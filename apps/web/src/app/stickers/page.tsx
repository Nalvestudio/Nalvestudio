import type { Metadata } from 'next';
import { BackHeader } from '@/components/site/BackHeader';
import { ChatBot } from '@/components/site/ChatBot';

export const metadata: Metadata = {
  title: 'Galería de stickers | nalv.estudio',
  description: 'Todos los stickers de nalv.estudio: mirá la galería completa, descargalos gratis o mandalos directo a tu plancha.',
};

// Ported from legacy stickers.html.
// TODO(backend): the gallery list, search, categories and infinite scroll come from the legacy /api/galeria endpoint,
// and "Sumá tu sticker" posts to /api/galeria/sugerir. Until then the page renders its empty state.
export default function StickersPage() {
  return (
    <>
      <BackHeader label="← Volver a la tienda" />
      <main className="wrap" style={{ paddingTop: '34px', paddingBottom: '70px' }}>
        <div className="section-head">
          <h1 style={{ margin: '0 0 8px' }}>Galería de stickers</h1>
          <p>
            {"Acá están "}
            <b>todos</b>
            {" los stickers cargados. Tocá "}
            <b>Descargar</b>
            {" para bajarlos o "}
            <b>Usar en mi plancha</b>
            {" para mandarlos directo al armador."}
          </p>
        </div>
        <div className="gal-add" style={{ margin: '0 0 20px' }}>
          <button type="button" className="btn btn-primary" id="gal-add-btn" disabled title="Próximamente">
            ⬆ Sumá tu sticker
          </button>
        </div>
        <div className="gal-tools" id="gal-tools">
          <input type="search" id="gal-search" placeholder="Buscar un sticker…" aria-label="Buscar sticker" />
          <span id="gal-count" />
        </div>
        <div className="gal-cats" id="gal-cats" role="tablist" aria-label="Categorías" />
        <div className="gal-grid" id="gal-grid" />
        <p className="gal-empty" id="gal-empty">
          Todavía no hay stickers cargados.
        </p>
        <div id="gal-sentinel" style={{ height: '1px' }} />
        <p className="gal-note">¿Un diseño es tuyo y querés que lo saquemos? Escribinos y lo retiramos enseguida.</p>
      </main>
      <ChatBot />
    </>
  );
}
