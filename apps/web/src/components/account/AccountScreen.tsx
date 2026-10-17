'use client';
import { useEffect, useState, type FormEvent } from 'react';

const GUEST_TAB = { LOGIN: 'login', REGISTER: 'register' } as const;
type GuestTab = (typeof GUEST_TAB)[keyof typeof GUEST_TAB];

const SOON = 'Próximamente: las cuentas todavía se están pasando a la nueva tienda. Podés comprar igual sin cuenta.';

type AccountUser = { id: number; name: string; email: string; phone: string | null; marketing: boolean };

const NETWORK_ERROR = 'No pudimos conectar. Probá de nuevo en un momento.';

async function postJson(url: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, any> }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function Msg({ id, msgs }: { id: string; msgs: Record<string, string> }) {
  return (
    <p className={'acct-msg' + (msgs[id] ? ' err' : '')} id={id}>
      {msgs[id] || ''}
    </p>
  );
}

/** "Mi cuenta" screen (port of legacy cuenta.html). Login, register and logout use /api/account/*. */
// TODO(backend): password reset, profile, password change, orders and account deletion are still stubbed.
export function AccountScreen() {
  const [tab, setTab] = useState<GuestTab>(GUEST_TAB.LOGIN);
  const [msgs, setMsgs] = useState<Record<string, string>>({});
  const say = (id: string, text: string) => setMsgs((prev) => ({ ...prev, [id]: text }));
  const stub = (id: string) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    say(id, SOON);
  };
  // undefined = still checking the session, null = guest.
  const [user, setUser] = useState<AccountUser | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/account/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => alive && setUser(d.user ?? null))
      .catch(() => alive && setUser(null));
    return () => {
      alive = false;
    };
  }, []);

  const submit = (id: string, url: string, read: (f: FormData) => Record<string, unknown>) =>
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (busy) return;
      setBusy(true);
      say(id, '');
      try {
        const { ok, data } = await postJson(url, read(new FormData(e.currentTarget)));
        if (ok && data.user) setUser(data.user);
        else say(id, data.error || 'Algo salió mal. Probá de nuevo.');
      } catch {
        say(id, NETWORK_ERROR);
      } finally {
        setBusy(false);
      }
    };

  const onLogin = submit('m-login', '/api/account/login', (f) => ({
    email: f.get('email'),
    password: f.get('password'),
  }));
  const onRegister = submit('m-register', '/api/account/register', (f) => ({
    name: f.get('name'),
    phone: f.get('phone'),
    email: f.get('email'),
    password: f.get('password'),
    marketing: f.get('marketing') === 'on',
  }));
  const onLogout = async () => {
    try {
      await postJson('/api/account/logout');
    } catch {
      // The session cookie is cleared server-side; show the guest view either way.
    }
    setMsgs({});
    setUser(null);
  };

  return (
    <main className="acct-wrap">
      {/* Sin sesión */}
      <div id="guest" hidden={user !== null}>
        <h1>Mi cuenta</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: "-6px" }}>
          Creá tu cuenta para ver tus pedidos y planchas, y comprar más rápido con tus datos ya cargados. Comprar sin cuenta también se puede.
        </p>
        <div className="acct-card">
          <div className="acct-tabs" id="gtabs">
            <button type="button" data-t="login" className={tab === GUEST_TAB.LOGIN ? 'on' : undefined} onClick={() => setTab(GUEST_TAB.LOGIN)}>
              Ingresar
            </button>
            <button type="button" data-t="register" className={tab === GUEST_TAB.REGISTER ? 'on' : undefined} onClick={() => setTab(GUEST_TAB.REGISTER)}>
              Crear cuenta
            </button>
          </div>
          <form className="acct-form" id="f-login" hidden={tab !== GUEST_TAB.LOGIN} onSubmit={onLogin}>
            <div className="frow">
              <label className="l">Email</label>
              <input type="email" name="email" required autoComplete="email" />
            </div>
            <div className="frow">
              <label className="l">Contraseña</label>
              <input type="password" name="password" required autoComplete="current-password" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Ingresar</button>
            <p style={{ margin: "12px 0 0", fontSize: ".86rem" }}>
              <button type="button" className="acct-link-btn" id="forgot-btn" onClick={() => say('m-login', SOON)}>Olvidé mi contraseña</button>
            </p>
            <Msg id="m-login" msgs={msgs} />
          </form>
          <form className="acct-form" id="f-register" hidden={tab !== GUEST_TAB.REGISTER} onSubmit={onRegister}>
            <div className="grid2">
              <div className="frow">
                <label className="l">Nombre y apellido</label>
                <input type="text" name="name" required autoComplete="name" maxLength={80} />
              </div>
              <div className="frow">
                <label className="l">Teléfono / WhatsApp</label>
                <input type="tel" name="phone" autoComplete="tel" placeholder="221 555 1234" />
              </div>
            </div>
            <div className="frow">
              <label className="l">Email</label>
              <input type="email" name="email" required autoComplete="email" />
            </div>
            <div className="frow">
              <label className="l">Contraseña (mínimo 8 caracteres)</label>
              <input type="password" name="password" required minLength={8} autoComplete="new-password" />
            </div>
            <label className="chk">
              <input type="checkbox" name="marketing" />
              {" "}
              <span>
                {"Quiero recibir ofertas y novedades de nalv.estudio por mail o WhatsApp "}
                <small>(opcional · podés darte de baja cuando quieras)</small>
              </span>
            </label>
            {" "}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Crear mi cuenta</button>
            <Msg id="m-register" msgs={msgs} />
          </form>
          <form className="acct-form" id="f-reset" hidden onSubmit={stub('m-reset')}>
            <h2>Crear una contraseña nueva</h2>
            <div className="frow">
              <label className="l">Contraseña nueva (mínimo 8)</label>
              <input type="password" name="password" required minLength={8} autoComplete="new-password" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Guardar y entrar</button>
            <Msg id="m-reset" msgs={msgs} />
          </form>
        </div>
      </div>
      {/* Con sesión */}
      <div id="mine" hidden={!user}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h1 style={{ margin: "0" }}>
            {"Hola, "}
            <span id="u-first">{user ? user.name.split(' ')[0] : ''}</span>
            {" 👋"}
          </h1>
          <button className="btn btn-ghost" id="logout" onClick={onLogout} style={{ color: "var(--ink)", borderColor: "var(--line)" }}>Cerrar sesión</button>
        </div>
        <div className="acct-tabs" id="mtabs" style={{ marginTop: "18px" }}>
          <button type="button" data-t="orders" className="on">Mis pedidos</button>
          <button type="button" data-t="profile">Mis datos</button>
        </div>
        <section id="t-orders">
          <div id="orders-list" />
        </section>
        <section id="t-profile" hidden>
          <form className="acct-card acct-form" id="f-profile" onSubmit={stub('m-profile')}>
            <h2>Mis datos</h2>
            <div className="grid2">
              <div className="frow">
                <label className="l">Nombre y apellido</label>
                <input type="text" name="name" required maxLength={80} />
              </div>
              <div className="frow">
                <label className="l">Teléfono / WhatsApp</label>
                <input type="tel" name="phone" />
              </div>
            </div>
            <div className="frow">
              <label className="l">Email</label>
              <input type="email" id="p-email" disabled value={user?.email ?? ''} />
            </div>
            <h2 style={{ marginTop: "22px" }}>
              {"Dirección de envío guardada "}
              <small style={{ fontWeight: "400", color: "var(--ink-soft)" }}>(para completar el checkout más rápido)</small>
            </h2>
            <div className="frow">
              <label className="l">Calle y número</label>
              <input type="text" name="address" maxLength={120} />
            </div>
            <div className="grid2">
              <div className="frow">
                <label className="l">Localidad</label>
                <input type="text" name="city" maxLength={60} />
              </div>
              <div className="frow">
                <label className="l">Código postal</label>
                <input type="text" name="postalCode" maxLength={10} />
              </div>
            </div>
            <label className="chk">
              <input type="checkbox" name="marketing" />
              {" "}
              <span>Quiero recibir ofertas y novedades por mail o WhatsApp</span>
            </label>
            {" "}
            <button className="btn btn-primary">Guardar cambios</button>
            <Msg id="m-profile" msgs={msgs} />
          </form>
          <form className="acct-card acct-form" id="f-pass" onSubmit={stub('m-pass')}>
            <h2>Cambiar contraseña</h2>
            <div className="grid2">
              <div className="frow">
                <label className="l">Actual</label>
                <input type="password" name="current" required autoComplete="current-password" />
              </div>
              <div className="frow">
                <label className="l">Nueva (mínimo 8)</label>
                <input type="password" name="next" required minLength={8} autoComplete="new-password" />
              </div>
            </div>
            <button className="btn btn-ghost" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>Cambiar contraseña</button>
            <Msg id="m-pass" msgs={msgs} />
          </form>
          <form className="acct-card acct-form" id="f-del" onSubmit={stub('m-del')}>
            <h2>Borrar mi cuenta</h2>
            <p style={{ fontSize: ".86rem", color: "var(--ink-soft)", marginTop: "-6px" }}>
              Se borran tus datos de cuenta y de contacto. Tus pedidos anteriores quedan guardados sin tu nombre de usuario, porque los necesitamos para la contabilidad.
            </p>
            <div className="frow">
              <label className="l">Tu contraseña</label>
              <input type="password" name="password" required autoComplete="current-password" />
            </div>
            <button className="btn btn-ghost" style={{ color: "#C0392B", borderColor: "#C0392B" }}>Borrar mi cuenta</button>
            <Msg id="m-del" msgs={msgs} />
          </form>
        </section>
      </div>
    </main>
  );
}
