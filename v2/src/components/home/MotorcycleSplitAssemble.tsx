"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function MotorcycleSplitAssemble() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const containerCenter = rect.top + rect.height / 2;
      const startPos = windowHeight * 0.95;
      const endPos = windowHeight * 0.50;

      let progress = (startPos - containerCenter) / (startPos - endPos);
      progress = Math.max(0, Math.min(1, progress));

      setScrollProgress(progress);
      setIsJoined(progress >= 0.94);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isJoined || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 12, y: -y * 12 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const p = scrollProgress;
  const easeProgress = 1 - Math.pow(1 - p, 3.5);

  const offsetX = (1 - easeProgress) * 140;
  const offsetY = (1 - easeProgress) * 110;
  const translateZ = (1 - easeProgress) * 120;
  const rotX = (1 - easeProgress) * 22;
  const rotY = (1 - easeProgress) * 24;
  const rotZ = (1 - easeProgress) * 12;
  const scale = 0.85 + easeProgress * 0.15;
  const opacity = 0.35 + easeProgress * 0.65;
  const blur = (1 - easeProgress) * 6;

  const imageSrc = "/suertu2s_moto_hero.jpg";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[380px] aspect-square mx-auto cursor-pointer group"
      style={{ perspective: "1400px" }}
    >
      {/* Ambient Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr from-brand-gold/35 via-brand-greenBright/30 to-brand-gold/35 rounded-[32px] filter blur-2xl transition-all duration-700 pointer-events-none ${
          isJoined ? "opacity-100 scale-105" : "opacity-15 scale-90"
        }`}
      />

      {/* 3D Stage Container */}
      <div
        className="relative w-full h-full"
        style={{
          transform: isJoined
            ? `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`
            : "none",
          transition: isJoined ? "transform 0.2s ease-out" : "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 1. SEPARATED FLYING STAGE: Active only when progress < 0.94 (Fades out cleanly when joined) */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isJoined ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Tile 1: Top-Left */}
          <div
            className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-[24px] rounded-tr-none rounded-bl-none rounded-br-none overflow-hidden glass-card border border-white/20 shadow-2xl"
            style={{
              transform: `translate3d(${-offsetX}px, ${-offsetY}px, ${translateZ}px) rotateX(${-rotX}deg) rotateY(${-rotY}deg) rotateZ(${-rotZ}deg) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              willChange: "transform, opacity, filter",
            }}
          >
            <div className="absolute w-[200%] h-[200%] top-0 left-0">
              <Image
                src={imageSrc}
                alt="Motorrad Corsa R150 Top-Left"
                fill
                unoptimized
                sizes="380px"
                className="object-cover select-none"
                priority
              />
            </div>
          </div>

          {/* Tile 2: Top-Right */}
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2 rounded-tr-[24px] rounded-tl-none rounded-br-none rounded-bl-none overflow-hidden glass-card border border-white/20 shadow-2xl"
            style={{
              transform: `translate3d(${offsetX}px, ${-offsetY}px, ${translateZ}px) rotateX(${-rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              willChange: "transform, opacity, filter",
            }}
          >
            <div className="absolute w-[200%] h-[200%] top-0 left-[-100%]">
              <Image
                src={imageSrc}
                alt="Motorrad Corsa R150 Top-Right"
                fill
                unoptimized
                sizes="380px"
                className="object-cover select-none"
                priority
              />
            </div>
          </div>

          {/* Tile 3: Bottom-Left */}
          <div
            className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-[24px] rounded-br-none rounded-tl-none rounded-tr-none overflow-hidden glass-card border border-white/20 shadow-2xl"
            style={{
              transform: `translate3d(${-offsetX}px, ${offsetY}px, ${translateZ}px) rotateX(${rotX}deg) rotateY(${-rotY}deg) rotateZ(${rotZ * 0.8}deg) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              willChange: "transform, opacity, filter",
            }}
          >
            <div className="absolute w-[200%] h-[200%] top-[-100%] left-0">
              <Image
                src={imageSrc}
                alt="Motorrad Corsa R150 Bottom-Left"
                fill
                unoptimized
                sizes="380px"
                className="object-cover select-none"
                priority
              />
            </div>
          </div>

          {/* Tile 4: Bottom-Right */}
          <div
            className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-[24px] rounded-bl-none rounded-tr-none rounded-tl-none overflow-hidden glass-card border border-white/20 shadow-2xl"
            style={{
              transform: `translate3d(${offsetX}px, ${offsetY}px, ${translateZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${-rotZ * 0.8}deg) scale(${scale})`,
              opacity,
              filter: `blur(${blur}px)`,
              willChange: "transform, opacity, filter",
            }}
          >
            <div className="absolute w-[200%] h-[200%] top-[-100%] left-[-100%]">
              <Image
                src={imageSrc}
                alt="Motorrad Corsa R150 Bottom-Right"
                fill
                unoptimized
                sizes="380px"
                className="object-cover select-none"
                priority
              />
            </div>
          </div>
        </div>

        {/* 2. UNIFIED MASTER CARD: Active ONLY when progress >= 0.94 (100% clean single card, no double borders or ghosting!) */}
        <div
          className={`absolute inset-0 rounded-[32px] overflow-hidden glass-card border border-brand-gold/60 p-2 shadow-[0_20px_50px_rgba(247,198,75,0.25)] transition-all duration-500 ease-out ${
            isJoined ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="w-full h-full rounded-[24px] overflow-hidden relative bg-black">
            <Image
              src={imageSrc}
              alt="Motorrad Corsa R150 2026 Ensamblada"
              fill
              unoptimized
              sizes="380px"
              className="object-cover select-none rounded-[24px]"
              priority
            />

            {/* Apple Specular Shimmer Streak */}
            <div
              className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 transition-all duration-1000 ${
                isJoined ? "translate-x-full opacity-100" : "-translate-x-full opacity-0"
              }`}
            />
          </div>
        </div>

        {/* Apple Capsule Badge when Assembled */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-brand-gold/50 text-brand-gold text-[11px] font-title font-extrabold tracking-wider uppercase transition-all duration-500 flex items-center gap-2 shadow-2xl pointer-events-none z-30 ${
            isJoined ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-greenBright opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-greenBright" />
          </span>
          MOTORRAD CORSA R150 0 KM
        </div>
      </div>
    </div>
  );
}
