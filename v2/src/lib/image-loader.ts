/**
 * Loader para next/image en export estático (GitHub Pages).
 * Asegura el prefijo basePath (/lasuerte) en todas las imágenes locales.
 */
export default function imageLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${base}${path}`;
}
