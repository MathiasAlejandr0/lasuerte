"use client";

/** Aviso visible solo en el demo estático de GitHub Pages. */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_STATIC !== "1") return null;

  return (
    <div className="sticky top-0 z-[100] bg-brand-gold text-black text-center text-xs sm:text-sm font-bold px-3 py-2">
      Demo visual en GitHub Pages — catálogo y diseño. Checkout, pagos y admin
      requieren el servidor completo.
    </div>
  );
}
