"use client";

import { useEffect } from "react";

/**
 * Observa todos los elementos con clase `.reveal` y les añade `.is-visible`
 * cuando entran en viewport. Convierte animaciones de scroll-driven reveals
 * en algo sencillo y accesible (prefers-reduced-motion cubierto en CSS).
 */
export function ScrollReveal() {
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
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    document
      .querySelectorAll<HTMLElement>(".reveal")
      .forEach((el) => observer.observe(el));

    const fallback = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 4500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
