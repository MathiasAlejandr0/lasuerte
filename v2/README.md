# Suertu2s (lasuerte)

Migración de WordPress/WooCommerce a **Next.js 16 + Supabase**.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

En local el checkout puede simular el pago (mock con token firmado) y redirigir a `/pago/exito`. En producción el mock está siempre desactivado.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres + RLS) — ver `supabase/migrations/`
- Mercado Pago Checkout Pro + Transbank Webpay Plus
- Resend (emails)
- Zustand (carrito)

## Rutas

| Ruta               | Descripción         |
| ------------------ | ------------------- |
| `/`                | Landing             |
| `/carrito`         | Carrito             |
| `/checkout`        | Checkout + pago     |
| `/check-tickets`   | Consulta de números |
| `/sorteos-activos` | Sorteo vigente      |
| `/bases-legales`   | Bases               |
| `/admin`           | Pedidos             |

## Supabase

1. Crea un proyecto en Supabase
2. Aplica **una sola** migración (esquema completo):  
   `supabase/migrations/20260811000000_init.sql`  
   (SQL Editor → pegar → Run, o `supabase db push` / link + migrate)
3. Completa en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. En Admin → Afiliados, asigna contraseña a `embajador@suertu2s.cl` / `demo@suertu2s.cl` para el portal `/afiliados`

Sin Supabase, la app usa un store en memoria (útil para demo local).

> Si ya habías aplicado migraciones viejas en un proyecto, parte de un proyecto limpio o resetea el schema: este archivo reemplaza el historial fragmentado anterior.

## Pagos reales

- Credenciales Mercado Pago y/o Webpay en `.env.local`
- `MERCADOPAGO_WEBHOOK_SECRET` (obligatorio en producción)
- `NEXT_PUBLIC_SITE_URL` con la URL pública (webhooks)

## Seguridad (producción)

- `ADMIN_SESSION_SECRET` largo y aleatorio (obligatorio; distinto de la contraseña)
- `ADMIN_PASSWORD` o preferible `ADMIN_PASSWORD_HASH` (scrypt)
- `AFFILIATE_SESSION_SECRET` (opcional; si no, usa `ADMIN_SESSION_SECRET`)
- `TRUST_PROXY=true` detrás de Vercel/Cloudflare/nginx
