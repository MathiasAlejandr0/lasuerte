"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

type Tilt3DProps = {
  children: ReactNode;
  maxTilt?: number;
  glare?: boolean;
  className?: string;
};

/**
 * Efecto 3D tipo Apple: la tarjeta se inclina en perspectiva siguiendo
 * el mouse (rotateX/rotateY) y muestra un brillo que acompaña el cursor.
 * Se ejecuta por manipulación directa del DOM para evitar re-renders.
 */
export function Tilt3D({
  children,
  maxTilt = 12,
  glare = true,
  className,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(
      2,
    )}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateZ(10px)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${(
        (px + 0.5) *
        100
      ).toFixed(
        1,
      )}% ${((py + 0.5) * 100).toFixed(1)}%, rgba(255,255,255,0.22), transparent 55%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`group/tilt relative transition-transform duration-300 ease-out will-change-transform ${className ?? ""}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {glare ? (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
          style={{ mixBlendMode: "overlay" }}
        />
      ) : null}
    </div>
  );
}
