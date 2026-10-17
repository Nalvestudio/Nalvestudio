# nalv.estudio — base de migración a Next.js + MySQL

Esto es el **cimiento** para mover la tienda de Express + `shop.json` a Next.js + MySQL.
La tienda actual (`sticker-shop`) **no se toca** y sigue funcionando mientras tanto.

## Qué hay y qué falta (en limpio)

| Pieza | Estado |
|---|---|
| `packages/shared` — precios, envíos, acomodo de planchas (MaxRects 58×50, 0,5 cm) en TypeScript | ✅ Hecho. 6 pruebas contra el código actual (miles de casos al azar): mismos precios y mismas coordenadas |
| `apps/web/prisma/schema.prisma` — esquema MySQL | ✅ Hecho y validado con el parser de Prisma. ⚠️ Todavía no corrió contra un MySQL real |
| `tools/migrate-from-json` — pasa pedidos, usuarios, galería, gastos y archivos | ✅ Simulacro probado con tus datos reales (totales coinciden). ⚠️ El modo `--apply` no se pudo probar acá (no había MySQL) |
| `apps/web` — Next.js con API `/api/price`, `/api/shipping/quote`, `/api/sheet/pack`, `/api/health` | ✅ Compila y responde igual que la tienda actual |
| Pantallas de la tienda (inicio, editor de stickers, planchas, remeras, checkout, seguimiento) | ❌ Sin portar: es la parte grande |
| Panel admin (pedidos, descargas, estados) | ❌ Sin portar |
| Login de clientes y admin (JWT) | ❌ Sin hacer |
| Procesado de imágenes (sharp, quitar fondo con IA, PNG 300 dpi de la plancha) | ❌ Sin portar (hoy vive en `sticker-shop/*.js`) |
| Subida de archivos a S3/R2 | ❌ Sin hacer |

## ¿Hace falta NestJS?

No para empezar. Next.js ya trae backend (route handlers) y alcanza para esta tienda. Nest conviene si más adelante
hay un equipo grande, colas de trabajo pesadas o una app móvil que consuma la misma API. Si se agrega, `@nalv/shared`
y `schema.prisma` se reutilizan tal cual.

## Cómo correrlo

Requisitos: Node 20+ y (para la base) Docker.

```bash
npm install
npm test                      # 11 pruebas (paridad de precios/envíos/planchas + migración)
npm run typecheck

docker compose up -d          # MySQL local
cp .env.example apps/web/.env
cd apps/web
npx prisma migrate dev --name init      # crea las tablas
npx prisma generate
npm run dev                   # http://localhost:3000  (calculadora de prueba)
```

## Pasar los datos de la tienda actual

```bash
# 1) SIMULACRO: lee, valida, compara totales. No escribe nada.
npx tsx tools/migrate-from-json/migrate.ts --data ../sticker-shop/data --uploads ../sticker-shop/uploads

# 2) De verdad (base vacía): escribe todo en una transacción, verifica cantidad y suma $, copia imágenes.
DATABASE_URL="mysql://nalv:nalv@localhost:3306/nalv" \
npx tsx tools/migrate-from-json/migrate.ts --data ../sticker-shop/data --uploads ../sticker-shop/uploads --apply --copy-to ./storage
```

Conserva ids y códigos `NALV-0001…`. Si el total en $ de origen y destino no coincide, no escribe nada.
`--data` y `--uploads` son las carpetas que usa tu servidor actual (en producción, las del disco persistente, no las de prueba).

## Publicarlo

Es una app Node (no hosting estático): `next build` genera `.next/standalone`. Necesita un servidor/VPS o un servicio
tipo Render/Railway/Fly con Node, una base MySQL (PlanetScale/Railway/propia) y disco o bucket S3/R2 para las imágenes.

## Reglas que se respetan

- Dinero siempre en pesos enteros (`Int`), nunca decimales.
- Los precios y tarifas se editan en `packages/shared/src/data.ts` (un solo lugar).
- Si se toca un precio, las pruebas de paridad fallan a propósito: hay que actualizar también la versión de referencia.
- Las imágenes no van en la base: se guarda solo su clave (`uploads/...`, `galeria/...`).
