import Link from 'next/link';
import { GARMENTS, SHEET, SIZE_GUIDE } from '@nalv/shared';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { BgVideo } from '@/components/home/BgVideo';
import { StickerConfigurator } from '@/components/home/StickerConfigurator';
import { WorksGrid } from '@/components/home/WorksGrid';
import { planchaArt, teeArt } from '@/components/home/heroArt';
import { ChatBot } from '@/components/site/ChatBot';
import { ScrollRuler } from '@/components/site/ScrollRuler';
import { SiteFooter } from '@/components/site/SiteFooter';
import { StoreHeader } from '@/components/site/StoreHeader';
import { money } from '@/lib/cart';

const minGarmentPrice = Math.min(...GARMENTS.map((g) => g.prices.front[0]));

// Ported from legacy index.html. Metadata (title/description) comes from the root layout.
export default function HomePage() {
  return (
    <>
      <StoreHeader>
        <a href="#crear">Stickers</a>
        <Link href="/remeras">Prendas</Link>
        <Link href="/stickers">Galería</Link>
        {/* TODO(backend): shown by the legacy store only when ready-made packs exist (/api/packs). */}
        <a href="#planchas" id="nav-planchas" hidden>
          Planchas armadas
        </a>
        <a href="#trabajos">Trabajos</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#tamanos">Tamaños</a>
        <a href="#preguntas">Preguntas frecuentes</a>
      </StoreHeader>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="cloth" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity=".10" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".05" />
            <stop offset="1" stopColor="#000" stopOpacity=".14" />
          </linearGradient>
          <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="2.2" markerHeight="2.2" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M0 0 L6 3 L0 6 Z" fill="#111112" />
          </marker>
          <marker id="arr-acc" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="2.2" markerHeight="2.2" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M0 0 L6 3 L0 6 Z" fill="#FF4D00" />
          </marker>
        </defs>
      </svg>
      <section className="mat hero-v2 has-bgvideo">
        <BgVideo />
        <div className="wrap">
          <div className="hero-head hero-human">
            <span className="hand-note">
              {"hecho a pedido, uno por uno "}
              <svg viewBox="0 0 60 40" width="54" height="36" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6 C 22 2, 44 10, 46 30" />
                <path d="M36 24 L46 31 L52 20" />
              </svg>
            </span>
            <h1 className="sticker-title">
              <span>Lo imaginás.</span>
              <span>Lo medimos.</span>
              <span className="stk">Lo estampamos.</span>
            </h1>
            <p className="lead">Armás tus stickers y tu remera en pantalla, a escala real: ves cuántos centímetros ocupa tu diseño antes de pedirlo.</p>
          </div>
          <div className="doors">
            <a className="door" href="#crear">
              <div className="door-top">
                <span>01</span>
                <span>Stickers</span>
              </div>
              <div className="door-art" id="art-plancha" dangerouslySetInnerHTML={{ __html: planchaArt() }} />
              <div className="door-bottom">
                <div>
                  <h3>Armá tus stickers</h3>
                  <p>
                    Subí tus imágenes y se acomodan solas, con la cantidad que elijas. Te recomendamos tamaños según dónde lo pegues y los acomodamos con 0,5 cm entre stickers.
                  </p>
                </div>
                <div className="door-price">
                  <small>plancha 58 × 50 cm</small>
                  <b id="door-sheet-price">{money(SHEET.price)}</b>
                </div>
              </div>
              <span className="door-cta">
                {"Armar mis stickers "}
                <i>→</i>
              </span>
            </a>
            {" "}
            <Link className="door" href="/remeras">
              <div className="door-top">
                <span>02</span>
                <span>Prendas</span>
              </div>
              <div className="door-art" id="art-tee" dangerouslySetInnerHTML={{ __html: teeArt() }} />
              <div className="door-bottom">
                <div>
                  <h3>Armá tu remera personalizada</h3>
                  <p>Remeras, crop top, musculosa y buzo. Elegí talle, subí tu logo (le sacás el fondo en un clic) y ubicalo en cm.</p>
                </div>
                <div className="door-price">
                  <small>prendas estampadas desde</small>
                  <b id="door-garment-price">{money(minGarmentPrice)}</b>
                </div>
              </div>
              <span className="door-cta">
                {"Armar mi remera "}
                <i>→</i>
              </span>
            </Link>
          </div>
        </div>
      </section>
      <StickerConfigurator />
      <section id="trabajos" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Trabajos realizados</h2>
            <p>Stickers y prendas que ya salieron de nuestro taller. Mirá más fotos y videos en nuestras redes.</p>
          </div>
          <div className="social-cards">
            <a className="social-card ig" href="https://www.instagram.com/nalv.estudio/" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
              <div>
                <strong>Instagram</strong>
                <span>@nalv.estudio</span>
              </div>
              <i>Ver perfil</i>
            </a>
            {" "}
            <a className="social-card tt" href="https://www.tiktok.com/@nalv.estudio" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="currentColor">
                <path d="M16.6 3c.3 2.3 1.7 3.9 3.9 4.1v3.1c-1.4 0-2.7-.4-3.9-1.200v6.100c0 3.300-2.500 5.900-5.800 5.900S5 18.400 5 15.100c0-3.600 3.100-6.200 6.700-5.700v3.200c-1.700-.5-3.400.6-3.400 2.400 0 1.500 1.200 2.600 2.600 2.600 1.600 0 2.600-1.100 2.600-2.800V3z" />
              </svg>
              <div>
                <strong>TikTok</strong>
                <span>@nalv.estudio</span>
              </div>
              <i>Ver videos</i>
            </a>
          </div>
          <WorksGrid />
        </div>
      </section>
      <section id="planchas" hidden style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Planchas armadas</h2>
            <p>
              Planchas ya diseñadas, listas para pedir: elegí la que te guste y agregala al carrito. El precio depende de la cantidad de stickers que trae.
            </p>
          </div>
          <div className="gal-grid" id="pk-list" />
        </div>
      </section>
      <section id="como-funciona" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Cómo funciona</h2>
            <p>De tu diseño a tu puerta (o a retirar) en 4 pasos.</p>
          </div>
          <div className="steps">
            <div className="step-card">
              <div className="num">01</div>
              <h3>Subís tu imagen</h3>
              <p>PNG, JPG, WEBP o SVG. Cuanta más resolución, mejor calidad de impresión.</p>
            </div>
            <div className="step-card">
              <div className="num">02</div>
              <h3>Elegís tamaño y cantidad</h3>
              <p>Deslizá la regla para el tamaño exacto en cm y sumá cuantos quieras.</p>
            </div>
            <div className="step-card">
              <div className="num">03</div>
              <h3>Confirmás el pedido</h3>
              <p>Completás tus datos y elegís retiro o envío. Te llega el número de pedido.</p>
            </div>
            <div className="step-card">
              <div className="num">04</div>
              <h3>Pagás por transferencia</h3>
              <p>Te mostramos alias/CBU al confirmar. Con el comprobante, arrancamos a producir.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="tamanos">
        <div className="wrap">
          <div className="section-head">
            <h2>Guía de tamaños</h2>
            <p>Si no sabés qué medida elegir, esto te ayuda (ancho del sticker):</p>
          </div>
          <div className="size-guide" id="size-guide">
            {SIZE_GUIDE.map((g) => (
              <div className="size-guide-card" key={g.id}>
                <div className="cm">
                  {g.min}–{g.max} cm
                </div>
                <h4>{g.label}</h4>
                <p>{g.tip}</p>
                <p className="ideal">
                  Ideal: <b>{g.ideal} cm</b>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="preguntas" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap" style={{ maxWidth: "760px" }}>
          <div className="section-head">
            <h2>Preguntas frecuentes</h2>
          </div>
          <details className="faq-item" open>
            <summary>¿Qué formatos de imagen aceptan?</summary>
            <p>PNG, JPG, WEBP y SVG. Recomendamos fondo transparente (PNG) para que el troquelado quede prolijo.</p>
          </details>
          <details className="faq-item">
            <summary>¿Cómo pago?</summary>
            <p>Por transferencia bancaria o efectivo. Al confirmar el pedido te mostramos los datos y tu número de pedido para coordinar.</p>
          </details>
          <details className="faq-item">
            <summary>¿Cuánto tarda la producción?</summary>
            <p>
              Depende de la cantidad. Los pedidos chicos los hacemos en 2 o 3 días hábiles y, si son más de 20 prendas, en 5 días hábiles. Se cuenta desde que se acredita el pago o la seña.
            </p>
          </details>
          <details className="faq-item">
            <summary>¿Cómo sigo mi pedido?</summary>
            <p>
              {"Entrá a "}
              <Link href="/seguimiento">Seguir mi pedido</Link>
              {" y poné tu número de pedido (por ejemplo NALV-0007) y el teléfono con el que compraste: vas a ver si está esperando el pago, en producción, listo o entregado."}
            </p>
          </details>
          <details className="faq-item">
            <summary>¿Cómo funciona la plancha?</summary>
            <p>
              Cada plancha mide 58 × 50 cm y cuesta $18.000. Subís las imágenes que quieras: se acomodan solas, y vos ajustás medida y cantidad de cada una. El sitio los acomoda solo dejando 0,5 cm de separación entre cada uno y te muestra cuánto espacio llevás ocupado. Si no entran todos, se suma otra plancha del mismo precio.
            </p>
          </details>
          <details className="faq-item">
            <summary>¿Puedo combinar varios diseños distintos en una misma plancha?</summary>
            <p>
              Sí, es justamente para eso — subí cada diseño con su medida y cantidad, y entran todos los que quepan en la misma plancha. Si además querés un sticker suelto fuera de la plancha, lo pedís aparte con la otra opción.
            </p>
          </details>
        </div>
      </section>
      <SiteFooter>
          <div>
            <img className="footer-logo" src="/img/nalv-logo.png" alt="NALV" />
            <br />
            <strong id="footer-store-name">nalv.estudio</strong>
            <br />
            Vinilo impreso con tecnología UV, resistente al agua.
          </div>
          <div>
            Hecho a pedido, uno por uno 🖇️
            <br />
            <a href="https://www.instagram.com/nalv.estudio/" target="_blank" rel="noopener">Instagram @nalv.estudio</a>
            {" · "}
            <a href="https://www.tiktok.com/@nalv.estudio" target="_blank" rel="noopener">TikTok @nalv.estudio</a>
            <br />
            <a id="footer-wa" href="https://wa.me/5492215730729" target="_blank" rel="noopener">WhatsApp +54 9 221 573-0729</a>
            <br />
            <a id="footer-mail" href="mailto:nalvarezestudio@gmail.com">nalvarezestudio@gmail.com</a>
            <br />
            <Link href="/seguimiento">Seguir mi pedido</Link>
            <br />
            <Link href="/admin" style={{ opacity: ".55", fontSize: ".8rem" }}>Acceso administrador</Link>
            <br />
            <small style={{ opacity: ".5", fontSize: ".72rem" }}>
              Stickers argentinos: diseños de nalv.estudio · íconos Microsoft Fluent Emoji (MIT) · mapas Natural Earth
            </small>
            {" "}
            {/* TODO(backend): legacy showed the app version from /api/version here. */}
            <small id="app-ver" style={{ opacity: ".4", fontSize: ".7rem" }} />
          </div>
        </SiteFooter>
      <CartDrawer />
      <ScrollRuler />
      <ChatBot />
    </>
  );
}
