/**
 * Retorna la ruta del asset incluyendo el prefijo basePath (e.g. /lasuerte)
 * cuando la app está desplegada en GitHub Pages.
 */
export function getAssetPath(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${base}${cleanPath}`;
}
