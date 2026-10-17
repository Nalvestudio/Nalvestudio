// migrate.ts — pasa los datos de la tienda actual (shop.json + carpeta de imágenes) a MySQL.
//
//   npx tsx tools/migrate-from-json/migrate.ts --data ../sticker-shop/data --uploads ../sticker-shop/uploads                  (SIMULACRO: no escribe nada)
//   npx tsx tools/migrate-from-json/migrate.ts --data ... --uploads ... --apply --copy-to ./storage                          (escribe en MySQL y copia imágenes)
//
//   --data     carpeta data de la tienda actual (shop.json + galeria/)
//   --uploads  carpeta uploads de la tienda actual (imágenes de pedidos)
//   --json     alternativa a --data si shop.json está en otro lado
//
// Por defecto es un simulacro: lee, valida y muestra el informe. Solo escribe con --apply.
import fs from 'node:fs';
import path from 'node:path';
import { buildPlan } from './plan';

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
const flag = (n: string) => args.includes('--' + n);

const dataDir = opt('data') || process.env.SHOP_DATA_DIR;
const jsonPath = opt('json') || (dataDir ? path.join(dataDir, 'shop.json') : undefined);
const uploadsDir = opt('uploads') || process.env.SHOP_UPLOAD_DIR;
// Las claves "uploads/xxx" viven en la carpeta uploads y las "galeria/xxx" en data/galeria.
const resolveKey = (k: string): string | null =>
  k.startsWith('uploads/') ? (uploadsDir ? path.join(uploadsDir, k.slice(8)) : null)
    : dataDir ? path.join(dataDir, k) : null;
const copyTo = opt('copy-to');
const apply = flag('apply');

if (!jsonPath) { console.error('Falta --data <carpeta data de la tienda> (o --json <shop.json>)'); process.exit(1); }
const shop = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const plan = buildPlan(shop);

// ¿están los archivos? (las claves son relativas a la carpeta data de la tienda actual)
const canCheck = !!(dataDir && uploadsDir);
const missing: string[] = canCheck ? plan.fileKeys.filter((k) => { const f = resolveKey(k); return !f || !fs.existsSync(f); }) : [];

const rows: [string, number][] = [
  ['usuarios', plan.users.length], ['pedidos', plan.orders.length], ['movimientos de estado', plan.statusEvents.length],
  ['stickers (sueltos + en planchas)', plan.items.length], ['planchas', plan.sheets.length], ['prendas', plan.shirts.length],
  ['packs', plan.packs.length], ['galería', plan.gallery.length], ['contactos', plan.contacts.length],
  ['bajas de mails', plan.optouts.length], ['gastos', plan.expenses.length], ['campañas', plan.campaigns.length],
];
console.log(apply ? '== MIGRACIÓN (escribe en MySQL) ==' : '== SIMULACRO (no escribe nada) ==');
for (const [n, c] of rows) console.log(`  ${n.padEnd(36)} ${c}`);
console.log(`  archivos referenciados               ${plan.fileKeys.length}${canCheck ? ` (faltan ${missing.length})` : ' (no verificados: pasá --data y --uploads)'}`);
const same = plan.totals.legacyOrdersTotal === plan.totals.planOrdersTotal;
console.log(`  Total de pedidos (suma $)            origen $${plan.totals.legacyOrdersTotal.toLocaleString('es-AR')} · destino $${plan.totals.planOrdersTotal.toLocaleString('es-AR')}${same ? '  OK coincide' : '  NO COINCIDE'}`);
for (const w of plan.warnings) console.log('  AVISO ' + w);
if (missing.length) console.log('  AVISO archivos que faltan (primeros 10):\n    ' + missing.slice(0, 10).join('\n    '));

if (!same) { console.error('Los totales no coinciden: no se escribe nada.'); process.exit(2); }
if (!apply) { console.log('\nSimulacro OK. Para escribir de verdad agregá --apply (con DATABASE_URL configurada).'); process.exit(0); }

(async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    if ((await prisma.order.count()) > 0 && !flag('force')) {
      console.error('La base ya tiene pedidos. Abortado (usá una base vacía, o --force bajo tu responsabilidad).');
      process.exit(3);
    }
    // Todo o nada: si algo falla, no queda nada a medias.
    await prisma.$transaction(async (tx: any) => {
      await tx.user.createMany({ data: plan.users as any });
      await tx.order.createMany({ data: plan.orders as any });
      await tx.orderStatusEvent.createMany({ data: plan.statusEvents as any });
      await tx.sheet.createMany({ data: plan.sheets as any });
      await tx.orderItem.createMany({ data: plan.items as any });
      await tx.shirt.createMany({ data: plan.shirts as any });
      await tx.packLine.createMany({ data: plan.packs as any });
      await tx.galleryItem.createMany({ data: plan.gallery as any });
      await tx.contact.createMany({ data: plan.contacts as any });
      await tx.optout.createMany({ data: plan.optouts as any });
      await tx.expense.createMany({ data: plan.expenses as any });
      await tx.campaign.createMany({ data: plan.campaigns as any });
    }, { timeout: 120_000 });

    // Verificación posterior: contar y sumar en la base destino.
    const [n, sum] = await Promise.all([prisma.order.count(), prisma.order.aggregate({ _sum: { total: true } })]);
    const ok = n === plan.orders.length && (sum._sum.total ?? 0) === plan.totals.legacyOrdersTotal;
    console.log(`\nVerificación en MySQL: ${n} pedidos, suma $${(sum._sum.total ?? 0).toLocaleString('es-AR')} -> ${ok ? 'OK' : 'NO COINCIDE'}`);
    if (!ok) process.exit(4);

    if (copyTo && canCheck) {
      let copied = 0;
      for (const k of plan.fileKeys) {
        const src = resolveKey(k);
        if (!src || !fs.existsSync(src)) continue;
        const dst = path.join(copyTo, k);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        copied++;
      }
      console.log(`Imágenes copiadas a ${copyTo}: ${copied}`);
    }
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => { console.error(e); process.exit(1); });
