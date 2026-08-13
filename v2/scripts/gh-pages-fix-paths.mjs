/**
 * Tras `next build` con basePath, corrige rutas absolutas de /images y /favicon
 * que a veces salen sin el prefijo /lasuerte (bug de export + Image unoptimized).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const base = (process.env.NEXT_PUBLIC_BASE_PATH || "/lasuerte").replace(
  /\/$/,
  "",
);

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function rewrite(content) {
  // "/images/..." o '/images/...' o (/images/...) → con basePath
  return content
    .replaceAll(`"${base}/images/`, `"@@BASE_IMAGES@@`)
    .replaceAll(`'${base}/images/`, `'@@BASE_IMAGES_SQ@@`)
    .replaceAll(`"${base}/favicon/`, `"@@BASE_FAV@@`)
    .replaceAll(`'${base}/favicon/`, `'@@BASE_FAV_SQ@@`)
    .replaceAll(`"${base}/suertu2s_moto_hero.jpg`, `"@@BASE_HERO@@`)
    .replaceAll(`'${base}/suertu2s_moto_hero.jpg`, `'@@BASE_HERO_SQ@@`)
    .replaceAll(`"${base}/moto_fondo_desenfocado.mp4`, `"@@BASE_VIDEO@@`)
    .replaceAll(`'${base}/moto_fondo_desenfocado.mp4`, `'@@BASE_VIDEO_SQ@@`)
    .replace(/(["'(=])\/images\//g, `$1${base}/images/`)
    .replace(/(["'(=])\/favicon\//g, `$1${base}/favicon/`)
    .replace(/(["'(=])\/suertu2s_moto_hero\.jpg/g, `$1${base}/suertu2s_moto_hero.jpg`)
    .replace(/(["'(=])\/moto_fondo_desenfocado\.mp4/g, `$1${base}/moto_fondo_desenfocado.mp4`)
    .replaceAll(`"@@BASE_IMAGES@@`, `"${base}/images/`)
    .replaceAll(`'@@BASE_IMAGES_SQ@@`, `'${base}/images/`)
    .replaceAll(`"@@BASE_FAV@@`, `"${base}/favicon/`)
    .replaceAll(`'@@BASE_FAV_SQ@@`, `'${base}/favicon/`)
    .replaceAll(`"@@BASE_HERO@@`, `"${base}/suertu2s_moto_hero.jpg`)
    .replaceAll(`'@@BASE_HERO_SQ@@`, `'${base}/suertu2s_moto_hero.jpg`)
    .replaceAll(`"@@BASE_VIDEO@@`, `"${base}/moto_fondo_desenfocado.mp4`)
    .replaceAll(`'@@BASE_VIDEO_SQ@@`, `'${base}/moto_fondo_desenfocado.mp4`);
}

if (!fs.existsSync(outDir)) {
  console.error("out/ no existe — corre next build primero");
  process.exit(1);
}

let changed = 0;
for (const file of walk(outDir)) {
  if (!/\.(html|js|css|txt|json|map)$/i.test(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = rewrite(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

console.log(`gh-pages-fix-paths: updated ${changed} files (base=${base})`);
