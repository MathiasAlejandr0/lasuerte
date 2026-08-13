"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Observa todos los elementos con clase `.reveal` y les añade `.is-visible`
 * cuando entran en viewport o cuando cambia la ruta (evitando que queden en opacity:0
 * al volver del checkout o navegar entre páginas).
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );

    const scanAndObserve = () => {
      const elements = document.querySelectorAll<HTMLElement>(".reveal");
      const windowHeight = window.innerHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Si el elemento ya está en o arriba del viewport, mostrar inmediatamente
        if (rect.top < windowHeight * 1.15 && rect.bottom > -50) {
          el.classList.add("is-visible");
        } else {
          observer.observe(el);
        }
      });
    };

    // Ejecutar escaneo inmediato y en el siguiente frame
    scanAndObserve();
    const rafId = requestAnimationFrame(scanAndObserve);

    // Observar cambios dinámicos en el DOM (re-render de componentes)
    const mutationObserver = new MutationObserver(() => {
      scanAndObserve();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Respaldo de seguridad: asegurar que ningún texto quede invisible por más de 800ms
    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 800);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
}
