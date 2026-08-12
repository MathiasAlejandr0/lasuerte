# Suertu2s

Proyecto de sorteos online (Next.js). El repositorio contiene dos versiones del proyecto en carpetas separadas:

## Demo en GitHub Pages

Versión visual estática de **v2** (sin backend/pagos):

**https://mathiasalejandr0.github.io/lasuerte/**

> Es un demo de diseño y catálogo. Checkout, admin y APIs requieren el servidor Next.js completo (`cd v2 && npm run dev`).

## v1/ — Versión original

Proyecto base que estaba publicado originalmente en este repositorio.

- Estructura y funcionalidad original (checkout, admin, afiliados, pagos).
- Se mantiene intacta por si se quiere conservar esa versión.

## v2/ — Versión 2

Versión actual con el trabajo más reciente.

- Nuevo panel **Sorteos** en el administrador: ciclo activo, creación de un nuevo ciclo de sorteo (archiva el anterior con sus pedidos/códigos en un historial) y consulta del historial de sorteos.
- Acceso rápido al ciclo activo desde el Resumen del admin.
- El catálogo local (`catalog.json`) se guarda en `.data/` (ignorado por git).

## Cómo correr cada versión

Cada carpeta es un proyecto Next.js independiente.

```bash
cd v1   # o v2
npm install
npm run dev
```

> Las variables de entorno secretas (`.env.local`) no se suben al repositorio. Copia el archivo `.env.local` desde tu máquina de desarrollo o crea uno a partir de `.env.example`.
