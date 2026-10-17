import type { Metadata } from 'next';
import { BackHeader } from '@/components/site/BackHeader';
import { TrackingForm } from '@/components/tracking/TrackingForm';
import { seguimientoCss } from './styles';

export const metadata: Metadata = { title: 'Seguir mi pedido | nalv.estudio' };

// Ported from legacy seguimiento.html (no account link or bot on this page, same as legacy).
export default function TrackingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: seguimientoCss }} />
      <BackHeader label="← Volver a la tienda" withAccount={false} />
      <main className="trk">
        <h1>Seguir mi pedido</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: '-6px' }}>Ingresá tu número de pedido y el teléfono que usaste al comprar.</p>
        <TrackingForm />
        <div className="res" id="res" hidden />
      </main>
    </>
  );
}
