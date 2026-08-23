# 🚀 Guía de Despliegue: Supabase + Vercel + Cloudflare

Esta guía detalla paso a paso cómo desplegar la plataforma **Suertu2s** con una arquitectura moderna, segura, escalable y de alto rendimiento utilizando:
- **Supabase**: Base de datos PostgreSQL gestionada con RLS y procedimiento atómico de emisión de boletos.
- **Vercel**: Alojamiento Serverless para Next.js con headers de seguridad y caché optimizada.
- **Cloudflare**: Red CDN global, protección DDoS/WAF, proxy DNS y certificado SSL Full (strict).

---

## 📋 Arquitectura del Sistema

```
  [ Usuario / Cliente ]
           │
           ▼
  [ Cloudflare (CDN / WAF / SSL Full Strict) ] ── (cf-connecting-ip)
           │
           ▼
  [ Vercel (Next.js 16 Serverless / Edge) ]
           │
           ├──▶ [ Supabase (PostgreSQL DB + RLS) ]
           ├──▶ [ Flow.cl (Pasarela de Pagos) ]
           └──▶ [ Resend (Emails Transaccionales) ]
```

---

## 1️⃣ Paso 1: Configurar Supabase (Base de Datos)

1. **Crear Proyecto**:
   - Ingresa a [https://supabase.com](https://supabase.com) y haz clic en **"New Project"**.
   - Asigna un nombre (ej. `suertu2s-db`) y una contraseña segura para la base de datos.
   - Selecciona la región más cercana a tus usuarios (ej. `South America (São Paulo)`).

2. **Ejecutar el Esquema SQL**:
   - En el panel de Supabase, ve al menú lateral izquierdo y haz clic en **SQL Editor** -> **New query**.
   - Abre el archivo `supabase_schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor.
   - Haz clic en **Run** (o presiona `Ctrl + Enter`).
   - Esto creará automáticamente:
     - Las tablas: `raffles`, `packs`, `affiliates`, `orders`, `order_items`, `tickets`, `affiliate_payouts`.
     - Índices de alto rendimiento para búsquedas instantáneas.
     - Políticas de seguridad **Row Level Security (RLS)**.
     - La función almacenada `fulfill_order_and_generate_tickets` (generación atómica y sin colisiones de números de boletos 0..99999).
     - El sorteo inicial y los paquetes de ilustraciones.

3. **Copiar las Credenciales**:
   - Ve a **Project Settings** -> **API**.
   - Copia los siguientes valores:
     - **Project URL** ➔ `NEXT_PUBLIC_SUPABASE_URL`
     - **anon / public key** ➔ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** (haz clic en *Reveal*) ➔ `SUPABASE_SERVICE_ROLE_KEY` *(¡Nunca la compartas en el frontend!)*

---

## 2️⃣ Paso 2: Desplegar en Vercel

1. **Importar el Repositorio**:
   - Ingresa a [https://vercel.com](https://vercel.com) y haz clic en **"Add New..."** -> **"Project"**.
   - Conecta tu repositorio de GitHub (`MathiasAlejandr0/lasuerte` o `4trebol`).

2. **Configurar el Proyecto**:
   - **Framework Preset**: Next.js.
   - **Root Directory**: Si el proyecto está en la carpeta `v2`, selecciona `v2` como Root Directory (o deja la raíz ya que el `vercel.json` de la raíz se encarga de compilar `v2`).

3. **Variables de Entorno en Vercel**:
   En la sección **Environment Variables**, agrega las siguientes variables para los entornos **Production** y **Preview**:

   | Variable | Descripción / Valor Ejemplo |
   | :--- | :--- |
   | `NEXT_PUBLIC_SITE_URL` | `https://tudominio.cl` (URL final del sitio) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (clave pública de Supabase) |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` (clave service_role de Supabase) |
   | `TRUST_PROXY` | `true` |
   | `PAYMENTS_MOCK` | `false` (en producción siempre `false`) |
   | `FLOW_API_KEY` | Tu API Key de Flow.cl |
   | `FLOW_SECRET_KEY` | Tu Secret Key de Flow.cl |
   | `FLOW_ENV` | `production` (o `sandbox` para pruebas) |
   | `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (API Key de Resend) |
   | `EMAIL_FROM` | `Suertu2s <contacto@tudominio.cl>` |
   | `ADMIN_EMAILS` | `tu-email-admin@ejemplo.cl` |
   | `ADMIN_PASSWORD_HASH` | Hash scrypt generado para la contraseña admin |
   | `ADMIN_SESSION_SECRET` | Clave aleatoria larga de al menos 32 caracteres |
   | `AFFILIATE_SESSION_SECRET` | Clave aleatoria larga para sesiones de afiliados |

4. **Desplegar**:
   - Haz clic en **"Deploy"**. Vercel compilará la aplicación y te entregará una URL `*.vercel.app`.

---

## 3️⃣ Paso 3: Configurar Cloudflare (DNS, CDN y SSL)

1. **Añadir Dominio a Cloudflare**:
   - Ingresa a [https://dash.cloudflare.com](https://dash.cloudflare.com) y añade tu dominio (ej. `suertu2s.cl`).
   - Cambia los servidores de nombres (Nameservers) en tu registrador de dominio (ej. NIC Chile o DonDominio) por los asignados por Cloudflare.

2. **Configurar Registros DNS**:
   - En Cloudflare -> **DNS** -> **Records**:
     - **Registro CNAME para Subdominios / www**:
       - Tipo: `CNAME`
       - Nombre: `www` (o subdominio deseado)
       - Target: `cname.vercel-dns.com`
       - Proxy status: **Proxied** (Nube naranja activa)
     - **Registro para el Apex (@)**:
       - Tipo: `CNAME` o `A` (según las indicaciones del panel de Vercel en Domains -> Add Domain)
       - Target: `cname.vercel-dns.com` o la IP de Vercel `76.76.21.21`
       - Proxy status: **Proxied** (Nube naranja activa)

3. **Configurar SSL/TLS**:
   - En Cloudflare -> **SSL/TLS**:
     - Selecciona el modo **"Full (strict)"** (Completo estricto). Esto garantiza cifrado de extremo a extremo entre Cloudflare y los servidores de Vercel.
   - En **SSL/TLS** -> **Edge Certificates**:
     - Activa **Always Use HTTPS**.
     - Activa **Automatic HTTPS Rewrites**.
     - Minimum TLS Version: `TLS 1.2` o `TLS 1.3`.

4. **Ajustes de Velocidad y Compatibilidad con Next.js**:
   - En **Speed** -> **Optimization**:
     - **Rocket Loader**: **Desactivado** *(Off)* (Rocket Loader puede alterar la ejecución asíncrona de React/Next.js).
     - **Auto Minify**: Desmarcar JavaScript si está habilitado (Next.js ya optimiza y minifica el bundle en el build).
     - **Early Hints**: Activado *(On)*.
     - **HTTP/3 (with QUIC)**: Activado *(On)*.

5. **Regla WAF para Webhooks de Pagos**:
   - Para evitar que los desafíos antibot bloqueen los avisos automáticos de pago de Flow.cl:
   - En **Security** -> **WAF** -> **Custom Rules** -> **Create rule**:
     - Name: `Allow Flow.cl Webhooks`
     - Expression: `(http.request.uri.path contains "/api/payments/flow/webhook")`
     - Action: `Skip` (Skip all remaining security features / Bot Management).

---

## 4️⃣ Paso 4: Verificación y Pruebas

Una vez completada la configuración, realiza la siguiente lista de comprobación:

- [ ] **Acceso Web**: Entra a tu dominio y comprueba que cargue con candado HTTPS válido.
- [ ] **Panel Admin (`/admin`)**:
  - Inicia sesión con tus credenciales de administrador.
  - En la pestaña de Estado, confirma que aparezca **"Supabase PostgreSQL conectada"** con indicador verde.
- [ ] **Generación de Boletos**:
  - Realiza una compra de prueba en modo Sandbox o Mock.
  - Verifica que los boletos se hayan creado en la tabla `tickets` de Supabase con el formato correcto (ej. `S2S2648291`).
- [ ] **Buscador de Boletos (`/check-tickets`)**:
  - Busca por el email del comprador y confirma que aparezcan los boletos emitidos.
- [ ] **Portal de Afiliados (`/afiliados`)**:
  - Prueba el inicio de sesión con el código demo `STJP48` y revisa el balance y métricas.
