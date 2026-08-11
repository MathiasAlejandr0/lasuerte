"use client";

import { useEffect, useRef } from "react";

export function HeroWavesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationId = 0;
    let time = 0;
    let visible = !document.hidden;

    const drops = [
      {
        x: 200,
        y: 150,
        radius: 160,
        progress: 0.1,
        speed: 0.0025,
        maxAmp: 0.2,
      },
      {
        x: 600,
        y: 300,
        radius: 200,
        progress: 0.4,
        speed: 0.003,
        maxAmp: 0.25,
      },
      {
        x: 400,
        y: 100,
        radius: 140,
        progress: 0.7,
        speed: 0.002,
        maxAmp: 0.18,
      },
      {
        x: 800,
        y: 250,
        radius: 180,
        progress: 0.9,
        speed: 0.0035,
        maxAmp: 0.22,
      },
    ];

    const nebulas = [
      {
        pctX: 0.25,
        pctY: 0.4,
        ampPctX: 0.15,
        ampPctY: 0.1,
        speedX: 0.25,
        speedY: 0.18,
        radPct: 0.8,
        rgb: "54, 240, 115",
        opacity: 0.14,
      },
      {
        pctX: 0.75,
        pctY: 0.6,
        ampPctX: 0.12,
        ampPctY: 0.15,
        speedX: 0.15,
        speedY: 0.22,
        radPct: 0.9,
        rgb: "247, 198, 75",
        opacity: 0.11,
      },
    ];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!visible) {
        animationId = 0;
        return;
      }
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      time += 0.012;

      for (const drop of drops) {
        drop.progress += drop.speed;
        if (drop.progress >= 1) {
          drop.x = Math.random() * w;
          drop.y = Math.random() * h;
          drop.radius = 120 + Math.random() * 120;
          drop.progress = 0;
          drop.speed = 0.002 + Math.random() * 0.003;
          drop.maxAmp = 0.15 + Math.random() * 0.2;
        }
      }

      const nebulaFactor = 0.6 + 0.2 * Math.sin(time * 0.8);
      ctx.globalCompositeOperation = "screen";
      for (const neb of nebulas) {
        const nx =
          w * neb.pctX + Math.sin(time * neb.speedX) * (w * neb.ampPctX);
        const ny =
          h * neb.pctY + Math.cos(time * neb.speedY) * (h * neb.ampPctY);
        const radius = Math.min(w, h) * neb.radPct;
        const grad = ctx.createRadialGradient(nx, ny, 10, nx, ny, radius);
        const op = neb.opacity * nebulaFactor;
        grad.addColorStop(0, `rgba(${neb.rgb}, ${op})`);
        grad.addColorStop(0.5, `rgba(${neb.rgb}, ${op * 0.3})`);
        grad.addColorStop(1, `rgba(${neb.rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      const spacing = w < 768 ? 64 : 84;
      const cols = Math.floor(w / spacing) + 2;
      const rows = Math.floor(h / spacing) + 2;
      const baseRadiusMax = ((w < 768 ? 16 : 22) / 4) * 0.7;
      const baseOpacityVal = w < 768 ? 0.05 : 0.08;

      const sweepDuration = 7.5;
      const localTime = time % 8;
      let sweepCenter = -9999;
      if (localTime < sweepDuration) {
        const pct = localTime / sweepDuration;
        const t = pct < 0.5 ? 2 * pct * pct : 1 - Math.pow(-2 * pct + 2, 2) / 2;
        sweepCenter = t * (2 * h + 600) - 300;
      }

      for (let c = 0; c < cols; c++) {
        const x = c * spacing;
        const fadeX = Math.min(1, Math.min(x, w - x) / (w * 0.46));
        for (let r = 0; r < rows; r++) {
          const y = r * spacing;
          let wave = 0.03 * Math.sin(x * 0.004 + y * 0.002 + time);
          if (sweepCenter !== -9999) {
            const dist = Math.abs(y + x * 0.35 - sweepCenter);
            if (dist < 180) wave += (1 - dist / 180) * 0.18;
          }
          for (const drop of drops) {
            const dx = x - drop.x;
            const dy = y - drop.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < drop.radius) {
              const ring = Math.abs(dist / drop.radius - drop.progress);
              if (ring < 0.18) {
                wave += (1 - ring / 0.18) * drop.maxAmp * (1 - drop.progress);
              }
            }
          }
          const fadeY = Math.min(1, Math.min(y, h - y) / (h * 0.35));
          const amp = Math.max(0, wave) * fadeX * fadeY;
          const radius = baseRadiusMax * (0.35 + amp * 2.2);
          const opacity = baseOpacityVal * (0.25 + amp * 2.5) * fadeX * fadeY;
          if (opacity < 0.02) continue;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(54, 240, 115, ${opacity * 0.25})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(247, 198, 75, ${opacity})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && !animationId) draw();
    };
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
