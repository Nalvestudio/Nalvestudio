'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

/**
 * Admin panel (port of legacy admin.html markup). Shows the login card; the panel layout can be previewed
 * with `/admin?preview=1` for design review. Nothing here talks to a backend yet.
 */
// TODO(backend): admin auth, orders, metrics/expenses, customers/promos, packs, gallery moderation and backups
// use the legacy /admin/api/* endpoints (admin.html inline script, admin-extra.js, admin-packs.js). Downloads are inert.
// Non-standard attribute (folder upload) not present in React's input typings.
const DIRECTORY_PICKER = { webkitdirectory: '' } as Record<string, string>;

export function AdminScreen() {
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState('pedidos');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(new URLSearchParams(window.location.search).get('preview') === '1');
  }, []);

  const onLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('Próximamente: el acceso al panel todavía se está pasando a la nueva tienda.');
  };

  return (
    <>
      <div id="login-view" className="login-card" style={{ display: preview ? "none" : "block" }}>
        <h2 style={{ fontSize: "1.2rem" }}>Ingresar</h2>
        <form id="login-form" autoComplete="off" onSubmit={onLogin}>
          <input name="username" placeholder="Usuario (admin)" required autoComplete="off" autoCapitalize="none" spellCheck="false" />
          {" "}
          <input name="password" type="password" placeholder="Contraseña de administrador" required autoComplete="new-password" />
          {" "}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>Entrar</button>
          <p id="login-error" style={{ color: "#C0392B", fontSize: ".85rem", display: loginError ? "block" : "none", marginTop: "10px" }}>
            {loginError}
          </p>
          <p className="muted" style={{ fontSize: ".75rem", marginTop: "10px" }}>
            {"El usuario y la clave son los que pusiste en el archivo "}
            <code>.env</code>
            {" ("}
            <code>ADMIN_USER</code>
            {" y "}
            <code>ADMIN_PASSWORD</code>
            {"). Si no lo cambiaste: usuario "}
            <b>admin</b>
            .
          </p>
        </form>
      </div>
      <div id="admin-view" className="admin-wrap" style={{ display: preview ? "block" : "none" }} onSubmitCapture={(e) => e.preventDefault()}>
        <div className="admin-head">
          <h1 style={{ fontSize: "1.4rem", margin: "0" }}>Panel</h1>
          <button className="btn btn-ghost" id="logout-btn" onClick={() => setPreview(false)}>Cerrar sesión</button>
        </div>
        <nav className="atabs" id="atabs">
          <button type="button" data-tab="pedidos" className={tab === "pedidos" ? "on" : undefined} onClick={() => setTab("pedidos")}>Pedidos</button>
          {" "}
          <button type="button" data-tab="metricas" className={tab === "metricas" ? "on" : undefined} onClick={() => setTab("metricas")}>Métricas y gastos</button>
          {" "}
          <button type="button" data-tab="clientes" className={tab === "clientes" ? "on" : undefined} onClick={() => setTab("clientes")}>Clientes y promos</button>
          {" "}
          <button type="button" data-tab="planchas" className={tab === "planchas" ? "on" : undefined} onClick={() => setTab("planchas")}>Planchas armadas</button>
          {" "}
          <button type="button" data-tab="galeria" className={tab === "galeria" ? "on" : undefined} onClick={() => setTab("galeria")}>
            {"Stickers y galería "}
            <span className="badge" id="pend-badge" hidden>0</span>
          </button>
          {" "}
          <button type="button" data-tab="ajustes" className={tab === "ajustes" ? "on" : undefined} onClick={() => setTab("ajustes")}>Copia de seguridad</button>
        </nav>
        <div className="atab" data-tab="pedidos" hidden={tab !== "pedidos"}>
          <div id="o-stats" className="ostats" />
          <div className="toolbar">
            <input id="f-search" placeholder="Buscar por número (NALV-0007), nombre, teléfono o mail…" />
            {" "}
            <select id="f-status">
              <option value="">Todos los estados</option>
            </select>
            {" "}
            <label className="dlab">
              {"Desde "}
              <input type="date" id="f-from" />
            </label>
            {" "}
            <label className="dlab">
              {"Hasta "}
              <input type="date" id="f-to" />
            </label>
            {" "}
            <button type="button" className="btn btn-ghost" id="f-clear" style={{ padding: "8px 12px", fontSize: ".82rem" }}>Limpiar</button>
            {" "}
            <a className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: ".82rem" }} href="#" data-legacy-href="/admin/api/excel" aria-disabled="true" title="Excel con todos los pedidos, gastos y resumen por mes">
              ⬇ Excel
            </a>
          </div>
          <p className="muted" id="o-saved" style={{ margin: "-6px 0 14px", fontSize: ".8rem" }} />
          <div id="orders-container" />
          <div style={{ textAlign: "center", margin: "10px 0 30px" }}>
            <button type="button" className="btn btn-ghost" id="o-more" hidden>Mostrar más pedidos</button>
          </div>
        </div>
        <div className="atab" data-tab="metricas" hidden={tab !== "metricas"}>
          <div className="panel" style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="#" data-legacy-href="/admin/api/excel" aria-disabled="true" id="xl-btn">⬇ Descargar Excel (pedidos, gastos y facturación por mes)</a>
            <span className="muted">
              Incluye cobrado por transferencia y en efectivo. En cada pedido elegí “Cobro: transferencia / efectivo” para que cuente.
            </span>
          </div>
          <div className="kpis" id="kpis" />
          <div className="panel">
            <h2>Facturado vs gastos · últimos 12 meses</h2>
            <div className="chart" id="chart" />
            <div className="legend">
              <i style={{ background: "var(--accent)" }} />
              Facturado (cobrado)
              <i style={{ background: "#9A9A94" }} />
              Gastos
            </div>
          </div>
          <div className="panel">
            <h2>Mes a mes</h2>
            <div className="tbl-wrap">
              <table id="mtable" />
            </div>
            <p className="muted" style={{ margin: "10px 0 0" }}>
              “Facturado” = pedidos con pago confirmado (pagado, en producción, listo o entregado), envío incluido. “Ganancia” = facturado − gastos cargados abajo. Lo pendiente de pago no se suma hasta que lo marques como pagado.
            </p>
          </div>
          <div className="panel">
            <h2>Gastos</h2>
            <form className="frm" id="exp-form">
              <input type="date" name="date" required />
              {" "}
              <input name="concept" placeholder="¿En qué fue? (ej: vinilo, tinta, flete)" required maxLength={100} style={{ flex: "1", minWidth: "200px" }} />
              {" "}
              <select name="category" id="exp-cat" />
              {" "}
              <input name="amount" type="number" min="1" step="1" placeholder="Monto $" required style={{ width: "130px" }} />
              {" "}
              <button className="btn btn-primary">Agregar gasto</button>
              {" "}
              <span className="muted" id="exp-msg" style={{ color: "#C0392B" }} />
            </form>
            <div className="frm">
              <label className="muted">Ver mes:</label>
              <select id="exp-month" />
              <span className="muted" id="exp-total" />
            </div>
            <div className="tbl-wrap">
              <table id="exp-table" />
            </div>
          </div>
        </div>
        <div className="atab" data-tab="clientes" hidden={tab !== "clientes"}>
          <div className="kpis" id="ckpis" />
          <div className="panel" id="mailcfg">
            <h2>
              {"1 · Conectar tu mail "}
              <span className="pill" id="mc-state">sin conectar</span>
            </h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              Así el sitio puede mandar las promos (y los avisos de pedidos y la recuperación de claves) desde tu casilla. Lo hacés una sola vez, sin tocar archivos.
            </p>
            <div id="mc-ok" hidden className="frm">
              <span>
                {"✔ Conectado como "}
                <b id="mc-user" />
              </span>
              <button type="button" className="pub-btn" id="mc-change">Cambiar</button>
              <button type="button" className="pub-btn" id="mc-off" style={{ borderColor: "#C0392B", color: "#C0392B" }}>Desconectar</button>
            </div>
            <form id="mc-form" className="frm" style={{ alignItems: "flex-start" }}>
              <select id="mc-provider" name="provider">
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook / Hotmail</option>
                <option value="yahoo">Yahoo</option>
                <option value="custom">Otro proveedor</option>
              </select>
              {" "}
              <input name="user" type="email" placeholder="Tu mail (ej: nalv.estudio@gmail.com)" required style={{ flex: "1", minWidth: "220px" }} autoComplete="off" />
              {" "}
              <input name="pass" type="password" placeholder="Contraseña de aplicación" required style={{ flex: "1", minWidth: "200px" }} autoComplete="new-password" />
              {" "}
              <span id="mc-custom" hidden className="frm" style={{ margin: "0" }}>
                <input name="host" placeholder="Servidor SMTP (smtp.tuproveedor.com)" />
                <input name="port" type="number" placeholder="Puerto (465)" style={{ width: "110px" }} />
              </span>
              {" "}
              <button className="btn btn-primary">Guardar y probar</button>
              {" "}
              <span className="muted" id="mc-msg" style={{ width: "100%" }} />
            </form>
            <details style={{ marginTop: "6px" }}>
              <summary className="muted" style={{ cursor: "pointer" }}>¿Cómo consigo la contraseña de aplicación de Gmail?</summary>
              <ol className="muted" style={{ lineHeight: "1.7", margin: "8px 0 0", paddingLeft: "20px" }}>
                <li>
                  {"Entrá a tu cuenta de Google → "}
                  <b>Seguridad</b>
                  {" y activá la "}
                  <b>verificación en 2 pasos</b>
                  {" (si no la tenés)."}
                </li>
                <li>
                  {"Abrí "}
                  <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a>
                  {", ponele un nombre (ej: “nalv web”) y tocá "}
                  <b>Crear</b>
                  .
                </li>
                <li>
                  {"Google te muestra una clave de 16 letras: copiala y pegala arriba (con o sin espacios). "}
                  <b>No uses tu contraseña normal.</b>
                </li>
              </ol>
            </details>
          </div>
          <div className="panel">
            <h2>2 · Mandar una promo por mail</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              {"Se envía "}
              <b>solo a quienes tildaron que quieren recibir ofertas</b>
              {" y tengan mail. Cada mail lleva un link para darse de baja (obligatorio). Usá "}
              <code>{"{nombre}"}</code>
              {" para poner el nombre."}
            </p>
            <div className="frm">
              <input className="t" id="pm-subject" placeholder="Asunto (ej: 15% en tu próxima plancha)" maxLength={150} style={{ flex: "1", minWidth: "240px" }} />
            </div>
            <textarea id="pm-body" placeholder="Hola {nombre}! Esta semana…" />
            <div className="frm" style={{ marginTop: "10px" }}>
              <button type="button" className="btn btn-ghost" id="pm-test" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Enviarme una prueba
              </button>
              {" "}
              <button type="button" className="btn btn-primary" id="pm-send">Enviar a los que aceptaron</button>
              {" "}
              <span className="muted" id="pm-msg" />
            </div>
            <p className="muted" id="pm-warn" hidden style={{ color: "#9A6A00" }}>
              ⚠ Todavía no conectaste tu mail: completá el paso 1 de arriba para poder enviar.
            </p>
            <p className="muted" id="pm-hist" />
          </div>
          <div className="panel">
            <h2>3 · Mandar una promo por WhatsApp</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              WhatsApp no permite el envío masivo automático: acá armás el mensaje y tocás “WhatsApp” en cada cliente (se abre el chat con el texto ya escrito). Solo aparecen quienes aceptaron recibir promos.
            </p>
            <textarea id="wa-text" style={{ minHeight: "80px" }} defaultValue={"Hola {nombre}! Te escribe NALV estudio 👋 Esta semana tenemos una promo para vos: "} />
            <div className="frm" style={{ marginTop: "10px" }}>
              <button type="button" className="btn btn-primary" id="wa-next">▶ Abrir el siguiente</button>
              <button type="button" className="btn btn-ghost" id="wa-reset" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Empezar de nuevo
              </button>
              <span className="muted" id="wa-progress" />
            </div>
          </div>
          <div className="panel">
            <h2>Clientes</h2>
            <div className="frm">
              <input className="t" id="c-search" type="search" placeholder="Buscar nombre, mail o teléfono…" style={{ flex: "1", minWidth: "200px" }} />
              {" "}
              <label className="muted">
                <input type="checkbox" id="c-only" defaultChecked />
                {" Solo los que aceptan promos"}
              </label>
              {" "}
              <a className="btn btn-ghost" id="c-csv1" href="#" data-legacy-href="/admin/api/customers.csv?consent=1" aria-disabled="true" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                CSV (aceptan promos)
              </a>
              {" "}
              <a className="btn btn-ghost" id="c-csv0" href="#" data-legacy-href="/admin/api/customers.csv" aria-disabled="true" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                CSV (todos)
              </a>
            </div>
            <div className="tbl-wrap">
              <table id="c-table" />
            </div>
            <p className="muted" style={{ marginTop: "10px" }}>
              {"¿Un cliente con cuenta perdió la clave y no tenés mail configurado? "}
              <button type="button" className="pub-btn" id="reset-pw">Generar clave temporal</button>
            </p>
          </div>
        </div>
        <div className="atab" data-tab="ajustes" hidden={tab !== "ajustes"}>
          <div className="panel">
            <h2>Tus datos guardados</h2>
            <div className="kpis" id="st-kpis" />
            <p className="muted" id="st-where" />
            <div id="st-warn" className="muted" hidden style={{ background: "#FFF4DC", border: "1px solid #F0D79A", borderRadius: "10px", padding: "12px 14px", color: "#6B4E00" }} />
          </div>
          <div className="panel">
            <h2>Revisar la galería de stickers</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              {"Si en la web alguna miniatura no se ve, tocá acá: revisa todos los stickers, "}
              <b>rehace las miniaturas dañadas</b>
              {" y te dice si a alguno le falta el archivo. (Esto también corre solo cada vez que se enciende el sitio.)"}
            </p>
            <div className="frm">
              <button type="button" className="btn btn-primary" id="gh-btn">Revisar y reparar</button>
              <button type="button" className="btn btn-ghost" id="gh-rm" hidden style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Quitar los que no tienen archivo
              </button>
            </div>
            <p className="muted" id="gh-msg" style={{ marginTop: "8px" }} />
          </div>
          <div className="panel">
            <h2>Copia de seguridad</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              {"Un solo archivo .zip con "}
              <b>todo</b>
              {": pedidos, clientes, cuentas, gastos, stickers cargados (y pendientes) y los archivos de los pedidos. "}
              <b>Descargala antes de cada actualización de la web</b>
              {" y cada tanto. Si algo se pierde, la restaurás acá en un paso."}
            </p>
            <div className="frm">
              <a className="btn btn-primary" href="#" data-legacy-href="/admin/api/backup.zip" aria-disabled="true" id="bk-dl">⬇ Descargar copia de seguridad</a>
            </div>
            <p className="muted" style={{ margin: "14px 0 6px" }}>
              <b>Restaurar</b>
              {" desde una copia: reemplaza los datos actuales por los de la copia (antes se guarda un respaldo del estado actual). Tu mail conectado y las sesiones no se tocan."}
            </p>
            <div className="frm">
              <button type="button" className="btn btn-ghost" id="rs-btn" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Restaurar desde un .zip…
              </button>
              <input type="file" id="rs-file" accept=".zip,application/zip" hidden />
              <span className="muted" id="rs-msg" />
            </div>
          </div>
        </div>
        <div className="atab" data-tab="planchas" hidden={tab !== "planchas"}>
          <div className="panel">
            <h2>⚡ Armar planchas automáticas</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              {"Elegí una categoría de la galería y el sitio arma solo planchas de "}
              <b>58 × 50 cm a 300 dpi</b>
              {" (listas para imprimir), con la cantidad de stickers que quieras por plancha, y las publica a la venta. Después podés editar el nombre y el precio de cada una abajo. El archivo para imprimir queda guardado y aparece en el pedido."}
            </p>
            <div className="frm" style={{ gap: "10px" }}>
              <select id="au-cat" style={{ padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px", minWidth: "210px" }} />
              {" "}
              <label style={{ fontSize: ".82rem" }}>
                {"Stickers por plancha "}
                <input id="au-per" type="number" min="4" max="60" defaultValue="20" style={{ padding: "6px", width: "70px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              </label>
              {" "}
              <label style={{ fontSize: ".82rem" }}>
                {"Precio $ "}
                <input id="au-price" type="number" min="1" defaultValue="18000" style={{ padding: "6px", width: "100px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              </label>
              {" "}
              <label style={{ fontSize: ".82rem" }}>
                {"Máx. planchas "}
                <input id="au-max" type="number" min="1" max="60" defaultValue="12" style={{ padding: "6px", width: "70px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              </label>
              {" "}
              <label style={{ fontSize: ".82rem" }}>
                <input type="checkbox" id="au-new" defaultChecked />
                {" Solo stickers que todavía no están en una plancha"}
              </label>
              {" "}
              <button type="button" className="btn btn-primary" id="au-go">Armar planchas</button>
            </div>
            <p className="muted" id="au-msg" style={{ marginTop: "8px" }} />
          </div>
          <div className="panel">
            <h2>Planchas armadas a la venta</h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              Cargá una plancha ya armada (la imagen completa), cuántos stickers trae y su precio. Aparece en la home para que el cliente la agregue al carrito. Cuando te la piden, en el pedido te queda el botón “Imprimir” con tu archivo original.
            </p>
            <form id="pk-form" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <input type="file" name="image" accept="image/*" required />
              {" "}
              <input name="title" placeholder="Nombre (ej. Plancha Mates)" maxLength={70} required style={{ padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px", minWidth: "200px" }} />
              {" "}
              <input name="stickers" id="pk-n" type="number" min="1" max="1000" placeholder="Cant. de stickers" required style={{ padding: "8px", width: "150px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              {" "}
              <input name="price" id="pk-price" type="number" min="1" placeholder="Precio $" required style={{ padding: "8px", width: "130px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              {" "}
              <label style={{ fontSize: ".8rem" }} title="Se usa para sugerirte el precio según la cantidad de stickers">
                {"Precio por sticker $ "}
                <input id="pk-rate" type="number" min="1" defaultValue="400" style={{ padding: "6px", width: "80px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              </label>
              {" "}
              <label style={{ fontSize: ".8rem" }}>
                <input type="checkbox" name="rights" value="1" required />
                {" Es mío o tengo derecho a venderlo"}
              </label>
              {" "}
              <button className="btn btn-primary">Cargar plancha</button>
              {" "}
              <span id="pk-msg" style={{ fontSize: ".8rem", color: "#C0392B" }} />
            </form>
            <p className="muted" style={{ fontSize: ".78rem", margin: "8px 0 0" }}>
              Al escribir la cantidad de stickers, el precio se completa solo (cantidad × precio por sticker); podés cambiarlo. Vender diseños de marcas, clubes o personajes sin licencia puede traerte reclamos.
            </p>
          </div>
          <div id="pk-grid" className="thumbs-big" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }} />
        </div>
        <div className="atab" data-tab="galeria" hidden={tab !== "galeria"}>
          <div id="ib-box" style={{ background: "#fff", border: "1px solid var(--line-strong,#ddd)", borderRadius: "12px", padding: "14px 16px", marginBottom: "14px" }}>
            <h3 style={{ margin: "0 0 4px" }}>📂 Carpeta automática de stickers</h3>
            <p className="muted" style={{ margin: "0 0 8px", fontSize: ".9rem" }}>
              {"Copiá imágenes, carpetas o .zip dentro de esta carpeta de tu computadora y "}
              <b>se suben solos a la web</b>
              {" (revisa cada 15 segundos). Si ponés "}
              <b>subcarpetas</b>
              {", cada una es una categoría (ej: "}
              <code>Boca</code>
              {", "}
              <code>Mates</code>
              {"). Lo que ya se subió pasa a la subcarpeta "}
              <code>_cargados</code>
              . Al ponerlos ahí confirmás que tenés derecho a publicarlos.
            </p>
            <div className="muted" style={{ fontSize: ".85rem", marginBottom: "8px" }}>
              {"Carpeta: "}
              <code id="ib-dir">…</code>
            </div>
            <div className="frm" style={{ marginBottom: "8px" }}>
              <input id="ib-extra" placeholder={"Otra carpeta, ej: C:\\Users\\Alvar\\Desktop\\Mis stickers"} style={{ flex: "1", minWidth: "260px", padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
              {" "}
              <button type="button" className="btn btn-ghost" id="ib-save" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Usar esta carpeta
              </button>
            </div>
            <div className="frm">
              <button type="button" className="btn btn-primary" id="ib-open">Abrir la carpeta</button>
              {" "}
              <button type="button" className="btn btn-ghost" id="ib-now" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }}>
                Subir ahora lo que haya
              </button>
              {" "}
              <span id="ib-msg" className="muted" style={{ fontSize: ".9rem" }} />
            </div>
          </div>
          <div id="pl-box" hidden style={{ background: "#fff", border: "1px solid var(--line-strong,#ddd)", borderRadius: "12px", padding: "14px 16px", marginBottom: "14px" }}>
            <h3 style={{ margin: "0 0 4px" }}>🎁 Stickers argentinos incluidos (≈ 270)</h3>
            <p className="muted" style={{ margin: "0 0 10px", fontSize: ".9rem" }}>
              Memes con jerga argentina, frases y dibujos de cosas nuestras (mate, asado, choripán, empanada, alfajor, colectivo, Obelisco, camiseta albiceleste, Sol de Mayo, mapa…), hechos por nalv.estudio, ya separados en categorías. Se agregan solos la primera vez que abrís el sitio; este botón los vuelve a cargar si hace falta. Quedan en la galería para que tus clientes los vean y los sumen a su plancha. Si ya los cargaste, no se duplican. Después podés armar planchas de 58 × 50 solas desde la pestaña “Planchas armadas”.
            </p>
            <div className="frm">
              <button type="button" className="btn btn-primary" id="pl-btn">Cargar stickers argentinos</button>
              {" "}
              <span id="pl-msg" className="muted" style={{ fontSize: ".9rem" }} />
            </div>
          </div>
          <div id="falt-banner" hidden style={{ background: "#FFF4DC", border: "1px solid #F0D79A", borderRadius: "10px", padding: "12px 14px", color: "#6B4E00", marginBottom: "14px" }}>
            <b id="falt-t" />
            <div className="muted" style={{ color: "#6B4E00", margin: "4px 0 8px" }}>
              {"Tus datos (nombres, precios, categorías, pedidos) están a salvo: lo que falta son los "}
              <u>archivos de las imágenes</u>
              {" en "}
              <code id="falt-dir" />
              . Probablemente quedaron en la carpeta de una versión anterior del sitio. No se borra ni se mueve nada: solo se copian.
              <br />
              <b>Si no los encuentra en tu compu:</b>
              {" volvé a subir tu .zip o tu carpeta de stickers (más abajo, “Subir un .zip” o “Elegir carpeta”). Los que ya están cargados "}
              <u>recuperan su imagen</u>
              {" y conservan nombre y categoría; no se duplican."}
            </div>
            <button type="button" className="btn btn-primary" id="falt-btn">🔎 Buscar mis archivos en esta computadora</button>
            {" "}
            <span id="falt-msg" className="muted" style={{ color: "#6B4E00" }} />
          </div>
          <div className="panel" id="pend-panel" hidden>
            <h2>
              {"Stickers sugeridos por la gente "}
              <span className="muted">· esperando tu aprobación</span>
            </h2>
            <p className="muted" style={{ marginTop: "-4px" }}>
              Los suben desde el bot o desde la galería, y aceptaron que se publiquen. No se muestra nada en la web hasta que lo aprobás. Mirá que no tengan marcas, personajes ajenos, fotos de personas ni nada ofensivo.
            </p>
            <div className="frm">
              <button type="button" className="btn btn-primary" id="pend-all">Aprobar todos</button>
            </div>
            <div id="pend-grid" className="thumbs-big" />
          </div>
          <div className="admin-head" style={{ marginTop: "8px" }}>
            <h1 style={{ fontSize: "1.4rem", margin: "0" }}>Galería de stickers para descargar</h1>
          </div>
          <p style={{ color: "var(--ink-soft)", fontSize: ".88rem", marginTop: "-12px" }}>
            {"Lo que está acá se ve en la web, en la página "}
            <Link href="/stickers" target="_blank">Galería de stickers</Link>
            , con botón de descarga. Los diseños de clientes solo se pueden publicar si ellos marcaron el permiso (aparece “✔ Permitió publicar” en el pedido) y siempre los aprobás vos.
          </p>
          <form id="gal-form" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
            <input type="file" name="image" accept="image/*" multiple required />
            {" "}
            <input name="title" placeholder="Nombre (solo si es uno)" maxLength={60} style={{ padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
            {" "}
            <label style={{ fontSize: ".8rem" }}>
              <input type="checkbox" name="rights" value="1" required />
              {" Es mío o tengo derecho a compartirlo"}
            </label>
            {" "}
            <label style={{ fontSize: ".8rem" }}>
              <input type="checkbox" name="featured" value="1" />
              {" ⭐ Recomendado"}
            </label>
            {" "}
            <button className="btn btn-primary">Subir</button>
            {" "}
            <span id="gal-msg" style={{ fontSize: ".8rem", color: "#C0392B" }} />
          </form>
          <div id="bulk" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "16px", marginBottom: "16px" }}>
            <strong>Subir muchos juntos</strong>
            {" "}
            <span style={{ color: "var(--ink-soft)", fontSize: ".84rem" }}>— o arrastrá acá tus archivos, carpetas o .zip</span>
            <p style={{ color: "var(--ink-soft)", fontSize: ".84rem", margin: "6px 0 12px" }}>
              {"Elegí "}
              <b>varios archivos</b>
              {" (Ctrl+A dentro de la carpeta), "}
              <b>una carpeta entera</b>
              {" o "}
              <b>un .zip</b>
              . Se suben de a 10, se les pone de nombre el del archivo (después podés renombrarlos) y los repetidos se saltean solos. Si se corta, volvé a subir lo mismo: no se duplica.
            </p>
            <label style={{ fontSize: ".84rem", display: "block", marginBottom: "6px" }}>
              <input type="checkbox" id="bulk-rights" />
              {" Todos son míos o tengo derecho a compartirlos"}
            </label>
            {" "}
            <label style={{ fontSize: ".84rem", display: "block", marginBottom: "6px" }}>
              <input type="checkbox" id="bulk-cats" defaultChecked />
              {" 📂 Si hay "}
              <b>subcarpetas</b>
              {" (en la carpeta o en el .zip), usar el nombre de cada una como "}
              <b>categoría</b>
            </label>
            {" "}
            <label style={{ fontSize: ".84rem", display: "block", marginBottom: "12px" }}>
              <input type="checkbox" id="bulk-featured" />
              {" ⭐ Marcarlos como recomendados (aparecen arriba de todo en la web)"}
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-primary" id="bulk-files-btn">Elegir archivos</button>
              {" "}
              <button type="button" className="btn btn-ghost" id="bulk-folder-btn">Elegir carpeta</button>
              {" "}
              <button type="button" className="btn btn-ghost" id="bulk-zip-btn">Subir un .zip</button>
            </div>
            <input type="file" id="bulk-files" accept="image/*" multiple hidden />
            {" "}
            <input type="file" id="bulk-folder" {...DIRECTORY_PICKER} multiple hidden />
            {" "}
            <input type="file" id="bulk-zip" accept=".zip,application/zip" hidden />
            <div id="bulk-bar" style={{ display: "none", marginTop: "14px", height: "8px", background: "var(--line)", borderRadius: "99px", overflow: "hidden" }}>
              <div id="bulk-fill" style={{ height: "100%", width: "0", background: "var(--accent)", transition: "width .2s" }} />
            </div>
            <div id="bulk-msg" style={{ marginTop: "8px", fontSize: ".84rem" }} />
          </div>
          <div className="frm">
            <input id="gal-search" type="search" placeholder="Buscar en la galería…" style={{ padding: "8px 12px", border: "1px solid var(--line-strong)", borderRadius: "8px", width: "min(320px,100%)" }} />
            {" "}
            <label className="muted">
              <input type="checkbox" id="gal-feat-only" />
              {" Solo ⭐ recomendados"}
            </label>
            <span className="muted" id="gal-count-admin" />
          </div>
          <div className="frm" style={{ marginTop: "10px" }}>
            <select id="gal-cat-filter" style={{ padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px" }}>
              <option value="">Todas las categorías</option>
            </select>
            {" "}
            <button type="button" className="btn btn-ghost" id="gal-org" style={{ color: "var(--ink)", borderColor: "var(--line-strong)" }} title="Corrige nombres raros y vuelve a clasificar los que no cambiaste a mano">
              🗂 Ordenar por categorías
            </button>
            {" "}
            <span className="muted" id="gal-org-msg" />
          </div>
          <div className="frm" id="gal-bulk" style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "10px", padding: "10px 12px", marginTop: "8px" }}>
            <label className="muted">
              <input type="checkbox" id="gal-sel-all" />
              {" Seleccionar todos los que se ven"}
            </label>
            {" "}
            <b id="gal-sel-n" className="muted">0 seleccionados</b>
            {" "}
            <select id="gal-bulk-cat" style={{ padding: "8px", border: "1px solid var(--line-strong)", borderRadius: "8px" }} />
            {" "}
            <button type="button" className="btn btn-primary" id="gal-bulk-go" disabled>Mover a esa categoría</button>
          </div>
          <div id="gal-admin" className="thumbs-big" />
        </div>
      </div>
    </>
  );
}
