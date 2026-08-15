# Suertu2s (lasuerte)

Migración de WordPress/WooCommerce a **Next.js 16 + Hostinger MySQL**.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

En local el checkout puede simular el pago (mock con token firmado) y redirigir a `/pago/exito`. En producción el mock está siempre desactivado.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Hostinger MySQL (driver `mysql2` con pool de conexiones y transacciones)
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
| `/admin`           | Panel de control    |
| `/afiliados`       | Portal de afiliados |

## Base de Datos (Hostinger MySQL)

1. En el panel de **Hostinger (hPanel)** o phpMyAdmin:
   - Crea una base de datos MySQL y un usuario con permisos.
   - Abre phpMyAdmin -> Selecciona la BD -> pestaña **Importar** o **SQL**.
   - Ejecuta el script `schema_hostinger.sql`.
2. Completa en `.env.local` (o panel de variables de entorno de tu servidor):
   - `MYSQL_HOST=localhost` (o el host/IP de Hostinger)
   - `MYSQL_PORT=3306`
   - `MYSQL_DATABASE=u123456789_suertu2s`
   - `MYSQL_USER=u123456789_suertu2s_user`
   - `MYSQL_PASSWORD=tu_contraseña_segura`
3. En Admin → Afiliados, asigna contraseña a los afiliados demo para habilitar su acceso al portal `/afiliados`.

> Sin variables `MYSQL_*` configuradas, la app funciona automáticamente en modo demo (memoria local).

## Pagos reales

- Credenciales Mercado Pago y/o Webpay en `.env.local`
- `MERCADOPAGO_WEBHOOK_SECRET` (obligatorio en producción)
- `NEXT_PUBLIC_SITE_URL` con la URL pública (webhooks)

## Seguridad (producción)

- `ADMIN_SESSION_SECRET` largo y aleatorio (obligatorio; distinto de la contraseña)
- `ADMIN_PASSWORD` o preferible `ADMIN_PASSWORD_HASH` (scrypt)
- `AFFILIATE_SESSION_SECRET` (opcional; si no, usa `ADMIN_SESSION_SECRET`)
- `TRUST_PROXY=true` detrás de Vercel/Cloudflare/nginx
