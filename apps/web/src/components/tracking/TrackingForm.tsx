'use client';
import { useEffect, useState, type FormEvent } from 'react';

/** Order tracking form (port of the inline script in legacy seguimiento.html). */
export function TrackingForm() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('c');
    if (c) setCode(c);
    try {
      const p = localStorage.getItem('nalv_phone');
      if (p) setPhone(p);
    } catch {
      /* no storage available */
    }
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(backend): POST { code, phone } to the legacy /api/track endpoint and render status, summary, total and history in #res.
    setError('Próximamente: el seguimiento de pedidos todavía se está pasando a la nueva tienda. Escribinos por WhatsApp y te contamos cómo va tu pedido.');
  };

  return (
    <form id="f" onSubmit={onSubmit}>
      <input id="code" placeholder="Número de pedido (ej. NALV-0007)" required autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
      <input id="phone" type="tel" placeholder="Tu teléfono" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="btn btn-primary" style={{ justifyContent: 'center' }}>
        Ver estado
      </button>
      <p className="err" id="err" hidden={!error}>
        {error}
      </p>
    </form>
  );
}
