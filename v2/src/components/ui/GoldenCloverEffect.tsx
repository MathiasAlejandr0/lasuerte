"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  targetX: number;
  targetY: number;
  delay: number;
  duration: number;
  isStar?: boolean;
}

interface CloverBurst {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

let audioCtx: AudioContext | null = null;

export function playLuckSound() {
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Arpeggio armónico de campana dorada
    const notes = [
      { freq: 523.25, time: 0, duration: 0.7, gain: 0.15 }, // C5
      { freq: 659.25, time: 0.07, duration: 0.7, gain: 0.18 }, // E5
      { freq: 783.99, time: 0.14, duration: 0.8, gain: 0.2 }, // G5
      { freq: 987.77, time: 0.21, duration: 0.9, gain: 0.22 }, // B5
      { freq: 1046.5, time: 0.28, duration: 1.0, gain: 0.25 }, // C6
      { freq: 1318.51, time: 0.35, duration: 1.2, gain: 0.28 }, // E6
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(0.001, now + time);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + time + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });

    const sparkles = [2093, 2637, 3135];
    sparkles.forEach((freq, idx) => {
      if (!audioCtx) return;
      const startTime = now + 0.3 + idx * 0.06;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.07, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch (err) {
    console.warn("Audio playback error:", err);
  }
}

export function triggerLuckEffect(x?: number, y?: number) {
  if (typeof window === "undefined") return;

  playLuckSound();

  const posX = x ?? window.innerWidth / 2;
  const posY = y ?? window.innerHeight / 2;

  const event = new CustomEvent("trigger-clover-effect", {
    detail: { x: posX, y: posY },
  });
  window.dispatchEvent(event);
}

// Imagen del Trébol 3D de Oro Macizo enviado por el usuario con fondo 100% transparente
function UserSolidGoldClover({
  className = "w-full h-full",
}: {
  className?: string;
}) {
  return (
    <img
      src="/images/golden-clover-user.png"
      alt="Trébol de Oro Macizo"
      className={`${className} object-contain pointer-events-none select-none`}
      style={{ background: "transparent" }}
    />
  );
}

// Estrellita de Destello de Oro ✨
function GoldSparkleStar({
  className = "w-full h-full",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} pointer-events-none select-none`}
      fill="none"
    >
      <path
        d="M20,0 C20,11 29,20 40,20 C29,20 20,29 20,40 C20,29 11,20 0,20 C11,20 20,11 20,0 Z"
        fill="#FFF7C2"
      />
    </svg>
  );
}

export function GoldenCloverEffect() {
  const [bursts, setBursts] = useState<CloverBurst[]>([]);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEv = e as CustomEvent<{ x: number; y: number }>;
      const originX = customEv.detail.x;
      const originY = customEv.detail.y;

      const newParticles: Particle[] = [];
      const particleCount = 14;

      for (let i = 0; i < particleCount; i++) {
        const isStar = i % 3 === 0;
        const angle =
          (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distanceX = (Math.random() - 0.5) * 160;
        const distanceY = -120 - Math.random() * 110;

        newParticles.push({
          id: i,
          x: originX,
          y: originY,
          size: isStar ? 12 + Math.random() * 12 : 24 + Math.random() * 20,
          rotation: Math.random() * 360,
          targetX: originX + distanceX,
          targetY: originY + distanceY,
          delay: Math.random() * 0.1,
          duration: 0.95 + Math.random() * 0.45,
          isStar,
        });
      }

      const burstId = Date.now() + Math.random();
      setBursts((prev) => [
        ...prev,
        { id: burstId, x: originX, y: originY, particles: newParticles },
      ]);

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 1600);
    };

    window.addEventListener("trigger-clover-effect", handleTrigger);
    return () => {
      window.removeEventListener("trigger-clover-effect", handleTrigger);
    };
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute inset-0">
          {/* Trébol Principal de Oro Macizo enviado por el usuario con resplandor dorado */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-clover-pop"
            style={{
              left: `${burst.x}px`,
              top: `${burst.y}px`,
              width: "60px",
              height: "60px",
            }}
          >
            <UserSolidGoldClover className="w-full h-full drop-shadow-[0_0_24px_rgba(247,198,75,1)]" />
          </div>

          {/* Partículas del Trébol del usuario y Destellos de Oro ✨ */}
          {burst.particles.map((p) => (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 animate-clover-float"
              style={
                {
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  "--target-x": `${p.targetX - p.x}px`,
                  "--target-y": `${p.targetY - p.y}px`,
                  "--rotation": `${p.rotation}deg`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                } as React.CSSProperties
              }
            >
              {p.isStar ? (
                <GoldSparkleStar className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]" />
              ) : (
                <UserSolidGoldClover className="w-full h-full drop-shadow-[0_0_12px_rgba(247,198,75,0.95)]" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
