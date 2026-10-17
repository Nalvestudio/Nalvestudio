import Calculator from './Calculator';

export const metadata = { title: 'nalv.estudio — calculadora (demo)' };

export default function CalculatorPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>nalv.estudio · base Next.js</h1>
      <p>
        Esto es el esqueleto de la migración: la lógica de precios, envíos y acomodo de planchas ya corre acá
        (paquete <code>@nalv/shared</code>, probado contra la tienda actual). Las pantallas de la tienda se van
        portando después, una por una. Probá la calculadora:
      </p>
      <Calculator />
    </main>
  );
}
