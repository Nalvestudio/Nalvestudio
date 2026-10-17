import type { Metadata } from 'next';
import Link from 'next/link';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { GarmentDesigner, SizeChart } from '@/components/remeras/GarmentDesigner';
import { ChatBot } from '@/components/site/ChatBot';
import { ScrollRuler } from '@/components/site/ScrollRuler';
import { SiteFooter } from '@/components/site/SiteFooter';
import { StoreHeader } from '@/components/site/StoreHeader';

export const metadata: Metadata = {
  title: 'Armá tu remera personalizada | nalv.estudio',
  description: 'Elegí la prenda, el color y el talle, subí tu diseño y ubicalo a escala real sobre la prenda.',
};

// Ported from legacy remeras.html.
export default function RemerasPage() {
  return (
    <>
      <StoreHeader>
        <Link href="/">Stickers</Link>
        <Link href="/remeras" className="active">
          Prendas
        </Link>
        <a href="#talles">Guía de talles</a>
      </StoreHeader>
      <section style={{ paddingBottom: '20px' }}>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <span className="eyebrow">Estampado a pedido · escala real</span>
            <h2>Armá tu remera personalizada</h2>
            <p>Elegí prenda, color y talle. La silueta está dibujada a la medida real de cada talle, así ves cuánto ocupa tu diseño en centímetros.</p>
          </div>
          <GarmentDesigner />
        </div>
      </section>
      <section id="talles" style={{ paddingTop: '40px' }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Guía de talles</h2>
            <p>Medidas de la prenda extendida, en centímetros.</p>
          </div>
          <SizeChart />
        </div>
      </section>
      <SiteFooter>
        <div>
          <img className="footer-logo" src="/img/nalv-logo.png" alt="NALV" />
          <br />
          Estampado hecho a pedido, prenda por prenda.
        </div>
        <div>Pago por transferencia o efectivo.</div>
      </SiteFooter>
      <CartDrawer />
      <ScrollRuler />
      <ChatBot />
    </>
  );
}
