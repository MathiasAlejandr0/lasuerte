# Suertu2s

Plataforma de adquisición de arte digital e ilustraciones con tickets de participación en premios oficiales (Next.js).

## Estructura del Proyecto

El proyecto principal activo se encuentra en la carpeta **`v2/`**.

- **Frontend & App:** Next.js 16 (Turbopack) con React 19, TypeScript y Tailwind CSS.
- **Pasarela de Pagos:** Integración oficial con **Flow.cl** (Webpay, Tarjetas de Crédito/Débito, Cuenta RUT, Servipag).
- **Notificaciones en Vivo:** Avisos interactivos de compras de clientes recientes en tiempo real.
- **Panel de Administración (`/admin`):** Gestión de pedidos, historial de campañas de premiación, clientes, ajustes y pagos a afiliados.
- **Portal de Afiliados (`/afiliados`):** Registro, links de referidos (`?ref=CODIGO`), generación de códigos QR automáticos y métricas de comisiones.
- **Consulta de Tickets (`/check-tickets`):** Búsqueda de tickets de participación asociados al correo de compra.

## Cómo levantar el proyecto en local

1. Entra en la carpeta `v2`:
   ```bash
   cd v2
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno en `v2/.env.local` (puedes basarte en `v2/.env.example`):
   - Llaves de Flow (`FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_ENV`)
   - URL del sitio (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`)
   - Redes sociales y correos de contacto

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre en tu navegador:
   - Sitio web: [http://localhost:3000](http://localhost:3000)
   - Portal de Afiliados: [http://localhost:3000/afiliados](http://localhost:3000/afiliados)
   - Panel de Administración: [http://localhost:3000/admin](http://localhost:3000/admin)

## Despliegue en Vercel

El repositorio está configurado en la raíz con `vercel.json` para compilar y desplegar automáticamente la carpeta `v2/`.
