"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Countdown } from "./Countdown";
import { LiveStreamPlayer } from "./LiveStreamPlayer";
import { CAROUSEL_IMAGES, RAFFLE } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";
import { triggerLuckEffect } from "@/components/ui/GoldenCloverEffect";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

type SlideStyle = {
  transform: string;
  opacity: number;
  zIndex: number;
  pointerEvents: "auto" | "none";
  direction: -1 | 0 | 1;
};

function computeSlideStyle(
  index: number,
  active: number,
  len: number,
): SlideStyle {
  let d = index - active;
  if (d > len / 2) d -= len;
  if (d < -len / 2) d += len;
  const ad = Math.abs(d);
  const sign = Math.sign(d);
  const direction = (ad === 0 ? 0 : sign) as -1 | 0 | 1;

  if (ad === 0) {
    return {
      transform: "translateX(0) translateZ(0) rotateY(0deg) scale(1)",
      opacity: 1,
      zIndex: 5,
      pointerEvents: "auto",
      direction,
    };
  }
  if (ad === 1) {
    return {
      transform: `translateX(${sign * 55}%) translateZ(-160px) rotateY(${
        -sign * 34
      }deg) scale(0.84)`,
      opacity: 0.55,
      zIndex: 3,
      pointerEvents: "auto",
      direction,
    };
  }
  return {
    transform: `translateX(${sign * 92}%) translateZ(-340px) rotateY(${
      -sign * 50
    }deg) scale(0.62)`,
    opacity: 0.12,
    zIndex: 1,
    pointerEvents: "none",
    direction,
  };
}

function CtaButton({ children }: { children: ReactNode }) {
  return (
    <Link
      href="#comprar"
      onClick={(e) => triggerLuckEffect(e.clientX, e.clientY)}
      className="btn-header-comprar w-full max-w-md flex items-center justify-center bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-sans font-extrabold text-base md:text-lg uppercase py-3.5 sm:py-4 px-8 rounded-full no-underline text-center"
    >
      {children}
    </Link>
  );
}

export function Hero() {
  const { raffle } = useCatalog();
  const endsAt = raffle.endsAt || RAFFLE.endsAt;
  const liveStreamUrl = raffle.liveStreamUrl ?? RAFFLE.liveStreamUrl ?? "";
  const raffleStatus = raffle.raffleStatus ?? RAFFLE.raffleStatus ?? "open";
  const winnerTicketCode = (
    raffle.winnerTicketCode ??
    RAFFLE.winnerTicketCode ??
    ""
  ).trim();
  const winnerName = (raffle.winnerName ?? RAFFLE.winnerName ?? "").trim();
  const winnerNote = (raffle.winnerNote ?? RAFFLE.winnerNote ?? "").trim();
  const [liveMode, setLiveMode] = useState(false);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const closed = raffleStatus === "closed";
  const hasWinner = winnerTicketCode.length >= 7;
  const showWinner = closed && hasWinner;
  const showLive = !showWinner && (liveMode || closed);

  useEffect(() => {
    const targetMs = new Date(endsAt).getTime();
    if (Number.isNaN(targetMs)) {
      setLiveMode(false);
      return;
    }

    const tick = () => setLiveMode(Date.now() >= targetMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  useEffect(() => {
    const title = heroTitleRef.current;
    if (!title) return;
    if (!("fontVariationSettings" in title.style)) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = title.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.5)));
        const weight = Math.round(700 + progress * 200);
        title.style.fontVariationSettings = `"wght" ${weight}`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full min-h-[550px] md:min-h-[calc(100vh-100px)] flex items-center overflow-hidden py-8 md:py-12">
      {/* Showroom Background Image - High-Res 334KB Uncompressed */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/hero-showroom.jpg"
          alt="Suertu2s Showroom Moto Corsa R150"
          fill
          priority
          unoptimized
          className="object-cover object-[82%_center] md:object-center filter brightness-[1.02] contrast-[1.04] saturate-[1.06] transform-gpu"
        />
        {/* Soft, localized gradient overlay behind left text only */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[48%] bg-gradient-to-r from-[#030a05]/92 via-[#030a05]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#030a05] to-transparent pointer-events-none" />
      </div>

      <section
        id="inicio"
        className="relative z-10 w-full py-6 md:py-12 px-4 max-w-6xl mx-auto"
      >
        {showWinner ? (
          <div className="space-y-5 max-w-3xl mx-auto text-center">
            <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-black font-title text-white leading-tight m-0">
              ¡Ya tenemos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                GANADOR
              </span>
              !
            </h1>
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-3">
              <p className="text-xs text-brand-gold uppercase tracking-wider font-bold m-0">
                Código ganador
              </p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-greenBright m-0 font-title tracking-wide break-all">
                {winnerTicketCode}
              </p>
              {winnerName ? (
                <p className="text-white text-lg sm:text-xl font-bold m-0">
                  {winnerName}
                </p>
              ) : null}
              {winnerNote ? (
                <p className="text-brand-muted text-sm sm:text-base m-0">
                  {winnerNote}
                </p>
              ) : null}
            </div>
            {liveStreamUrl.trim() ? (
              <LiveStreamPlayer url={liveStreamUrl} />
            ) : null}
            <div className="flex justify-center">
              <CtaButton>VER PACKS</CtaButton>
            </div>
          </div>
        ) : showLive ? (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl font-black font-title text-white leading-tight m-0">
                ¡El{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                  SORTEO
                </span>{" "}
                {closed ? "terminó!" : "está en vivo!"}
              </h1>
              <p className="text-brand-muted text-sm sm:text-base m-0">
                {closed
                  ? "Mira la transmisión o espera el anuncio del ganador."
                  : "Mira la transmisión del sorteo en directo."}
              </p>
            </div>
            <LiveStreamPlayer url={liveStreamUrl} />
            <div className="flex justify-center">
              <CtaButton>VER PACKS</CtaButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="md:col-span-7 lg:col-span-6 min-w-0 space-y-5 md:space-y-6">
              <div>
                <h1
                  ref={heroTitleRef}
                  className="display-title text-2xl sm:text-3xl md:text-[2.1rem] lg:text-[2.45rem] font-black font-title text-white m-0 leading-[1.18] tracking-tight max-w-[22ch] sm:max-w-xl drop-shadow-md"
                >
                  Compra Tus
                  <br />
                  Ilustraciones Digitales
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                    Y Participa En El Sorteo De Nuestra Moto
                  </span>
                </h1>
              </div>

              <p className="text-brand-muted text-sm sm:text-base md:text-lg max-w-xl leading-relaxed m-0 font-medium drop-shadow-sm">
                Adquiere hermosas ilustraciones de paisajes del sur de Chile.
                Con cada producto que compres, obtendrás boletos de regalo para
                participar en el sorteo de increíbles premios.
              </p>

              <div className="max-w-md">
                <Countdown endsAt={endsAt} />
              </div>

              <div className="max-w-md pt-1">
                <CtaButton>PARTICIPAR</CtaButton>
              </div>
            </div>

            <div className="hidden md:block md:col-span-5 lg:col-span-6 min-h-[380px]" />
          </div>
        )}
      </section>
    </div>
  );
}
