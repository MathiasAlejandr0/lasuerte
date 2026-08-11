# Suertu2s — Qué incluye el proyecto

Documento para explicar en el trabajo qué es la plataforma, qué hacía desde el inicio y qué se agregó después.

---

## 1. Resumen

**Suertu2s** vende packs de ilustraciones digitales del sur de Chile. Con cada compra entrega números de regalo para un sorteo. Incluye pagos online, panel de administración y sistema de afiliados.

**Valor orientativo en Chile (desarrollo a medida):**  
aprox. **$3.200.000 – $7.000.000 CLP** (+ IVA).

Las claves de Mercado Pago, Webpay, Supabase y Resend las configura otra persona / el cliente.

---

## 2. Contexto: de dónde veníamos → a dónde llegamos

### Antes

- Sitio en WordPress / WooCommerce (`suertu2s.cl`)
- Lógica repartida en plugins y tema

### Ahora

- App a medida: **Next.js 16 + TypeScript + Tailwind + Supabase**
- Código propio: checkout, tickets, admin, afiliados, emails

---

## 3. Stack técnico

| Pieza              | Tecnología                                      |
| ------------------ | ----------------------------------------------- |
| App                | Next.js (App Router), React, TypeScript         |
| Estilos            | Tailwind CSS 4                                  |
| Base de datos      | Supabase (Postgres + RLS)                       |
| Pagos              | Mercado Pago + Webpay (Transbank)               |
| Emails             | Resend                                          |
| Carrito            | Zustand                                         |
| Calidad            | ESLint, Prettier, Vitest, Playwright, CI GitHub |

Sin Supabase configurado, la app puede correr en modo demo (memoria local).

---

## 4. Rutas del sitio (público)

| Ruta                         | Para qué sirve                                      |
| ---------------------------- | --------------------------------------------------- |
| `/`                          | Landing (hero, packs, FAQ, confianza de pago)       |
| `/carrito`                   | Resumen del carrito                                 |
| `/checkout`                  | Datos, método de pago y aceptación de bases         |
| `/check-tickets`             | Consultar números con el correo de compra           |
| `/sorteos-activos`           | Info del sorteo vigente                             |
| `/bases-legales`             | Bases / privacidad                                  |
| `/pago/exito`                | Pago exitoso                                        |
| `/pago/error`                | Pago fallido                                        |
| `/afiliados`                 | Portal del embajador / vendedor                     |
| `/admin`                     | Panel administrador                                 |

---

## 5. Flujo de compra

1. El usuario elige un pack (ilustración + N números de regalo).
2. Va al carrito y al checkout.
3. Acepta privacidad, bases del sorteo y mayoría de edad.
4. Elige **Mercado Pago** o **Webpay** (en local también puede usar pago de prueba).
5. Paga → el sistema marca el pedido como pagado, asigna números y envía email.
6. Puede consultar sus números en “Consultar números”.

### Landing (experiencia)

- Marca Suertu2s y countdown al gran sorteo
- Packs con precio y cantidad de números
- Logos de medios de pago (confianza)
- **Live:** al llegar el contador a 0, se ocultan foto y countdown y aparece el reproductor (YouTube/Twitch)
- **Ganador:** si el admin cierra el sorteo y carga el número, se anuncia en la portada

---

## 6. Lo que YA hacía (base de la migración)

Estas capacidades existían como núcleo del producto:

1. Landing fiel al sitio original (estética, packs, FAQ)
2. Packs de ilustración con precio CLP y números de regalo
3. Carrito y checkout
4. Pedidos creados en servidor (precios no se confían al navegador)
5. Backend preparado para Mercado Pago y Webpay
6. Asignación de números al confirmar pago
7. Consulta de tickets por email
8. Email de confirmación (Resend) con números e ilustraciones
9. Panel admin: pedidos, clientes, números, afiliados
10. Referidos / afiliados (códigos, comisiones, liquidaciones)
11. Analítica (ingresos, embudo, break-even estimado)
12. CI básico (typecheck, lint, tests)

---

## 7. Lo NUEVO (mejoras posteriores)

Esto es lo más importante para explicar “qué sumamos”.

### 7.1 Pagos reales en la pantalla de checkout

| | |
| --- | --- |
| **Antes** | El checkout siempre usaba “pago de prueba” (mock). |
| **Ahora** | El usuario elige **Mercado Pago** o **Webpay** según estén configurados. |

- En producción el mock está **siempre desactivado**.
- En local, el mock usa un **token firmado** (más seguro).

### 7.2 Transmisión en vivo del sorteo

- En Admin → Ajustes se configura el **link del live**.
- Cuando el contador llega a 0: se ocultan foto + countdown y aparece el reproductor.
- Soporta YouTube y Twitch.

### 7.3 Cierre del sorteo y ganador

- El admin puede **abrir o cerrar** el sorteo.
- Puede cargar **número ganador**, nombre y nota pública.
- Con sorteo cerrado + ganador → se muestra en la portada.
- Con sorteo cerrado → **no se permiten nuevas compras**.

### 7.4 Panel admin más operativo

| Sección    | Qué se puede hacer                                              |
| ---------- | --------------------------------------------------------------- |
| Pedidos    | Marcar pagado, emitir números, reenviar email, marcar fallido   |
| Ajustes    | Sorteo, packs, premios, live, cierre y ganador                  |
| Resumen    | Checklist “Listo para operar”                                   |
| Afiliados  | Generar y copiar clave temporal del portal                      |
| Listados   | Exportar CSV                                                    |
| Idioma     | Toda la interfaz admin en español                               |

### 7.5 Portal de afiliados

- Login con email y contraseña (guardada con hash seguro).
- Dashboard de ventas, comisiones y QR del código.
- El admin asigna o cambia la clave del portal.

### 7.6 Email más fiable

- Se guarda si el email de confirmación **ya se envió**.
- Si falla el primer envío, un reintento del webhook puede mandarlo después.
- El admin puede **forzar reenvío** desde el pedido.

### 7.7 Seguridad

- Sesión admin con cookie segura (httpOnly + firma).
- Secreto de sesión aparte de la contraseña (obligatorio en producción).
- Opción de contraseña admin con hash (scrypt).
- Protección anti-CSRF en APIs admin y afiliados.
- Headers de seguridad (CSP, HSTS, etc.).
- Webhook de Mercado Pago con firma y validación de monto.
- Rate limit en login, checkout y webhooks.

### 7.8 Base de datos (una sola migración)

Archivo único:

`supabase/migrations/20260811000000_init.sql`

Incluye todo de una vez: sorteo, packs, pedidos, tickets, afiliados, liquidaciones, password de afiliados, flag de email, RLS y asignación segura de números.

---

## 8. Mapa del panel administrador (`/admin`)

| Sección   | Qué permite                                              |
| --------- | -------------------------------------------------------- |
| Resumen   | KPIs, alertas, checklist operativo                       |
| Analítica | Ingresos, embudo, break-even, mix packs / pasarelas      |
| Pedidos   | Buscar, filtrar, detalle y acciones                      |
| Clientes  | Listado y export                                         |
| Números   | Tickets emitidos                                         |
| Afiliados | Altas, comisiones, liquidaciones, clave del portal       |
| Ajustes   | Sorteo, premios, packs, live, cierre/ganador, estado env |

Login: correo autorizado + contraseña de entorno.

---

## 9. Qué configura otra persona (no es falta de código)

- Credenciales **Mercado Pago** (+ secreto del webhook)
- Credenciales **Webpay / Transbank**
- Proyecto **Supabase** + aplicar la migración SQL
- **Resend** (API key y correo remitente)
- Variables de producción (`ADMIN_*`, URL del sitio, etc.)
- Revisión legal de bases y textos

Con eso cargado, el cobro real ya está contemplado en el código.

---

## 10. Qué aún falta pulir (si preguntan)

1. El catálogo editable del admin aún puede vivir en archivo local; a futuro conviene guardarlo en Supabase.
2. El checkout pide pocos datos del comprador (hoy prioriza el email).
3. Las bases legales deben validarse con un abogado.
4. Mejoras posteriores posibles: SEO avanzado, 2FA admin, rate limit distribuido.

---

## 11. Demo sugerida (5 minutos)

1. Landing → packs → countdown  
2. Carrito → checkout → mostrar selector Mercado Pago / Webpay  
3. Pago de prueba (local) → éxito → consultar números  
4. Admin → Resumen → Pedidos  
5. Ajustes → live y cierre/ganador  
6. Afiliados → generar clave → mencionar `/afiliados`  

---

## 12. Mensaje corto para la reunión

Migramos Suertu2s de WordPress a una app Next.js propia: venta de packs, números de sorteo, pagos Mercado Pago/Webpay, emails, admin y afiliados.

Después reforzamos seguridad, dejamos el checkout listo para cobros reales, agregamos live del sorteo, cierre/ganador, bloqueo de compras al cerrar, y emails con reintento.

Falta que el cliente o infra cargue las claves de pago, Supabase y Resend. El código ya contempla ese go-live.

---

*Uso interno / presentación laboral — repositorio Suertu2s.*
