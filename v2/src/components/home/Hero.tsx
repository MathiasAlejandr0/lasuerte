"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Countdown } from "./Countdown";
import { LiveStreamPlayer } from "./LiveStreamPlayer";
import { CAROUSEL_IMAGES, RAFFLE } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";

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
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const touchStartX = useRef(0);

  const slideCount = CAROUSEL_IMAGES.length;
  const goNext = useCallback(
    () => setActive((prev) => (prev + 1) % slideCount),
    [slideCount],
  );
  const goPrev = useCallback(
    () => setActive((prev) => (prev - 1 + slideCount) % slideCount),
    [slideCount],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  };

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
    if (showWinner || showLive || paused) return;
    const id = setInterval(goNext, 3200);
    return () => clearInterval(id);
  }, [showWinner, showLive, paused, goNext]);

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
    <div className="relative w-full min-h-fit md:min-h-[calc(100vh-100px)] flex items-center overflow-x-hidden bg-[#020503] py-4 md:py-0">
      <section
        id="inicio"
        className="relative z-10 w-full py-4 md:py-8 px-4 max-w-6xl mx-auto"
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
            <div className="md:col-span-7 min-w-0 space-y-4 lg:space-y-6">
              <div>
                <h1
                  ref={heroTitleRef}
                  className="display-title text-[1.65rem] sm:text-3xl md:text-[2.15rem] lg:text-[2.45rem] font-black font-title text-white m-0 leading-[1.18] tracking-tight max-w-[22ch] sm:max-w-xl"
                >
                  Compra Tus Ilustraciones Digitales
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                    Y Participa En El Sorteo De Nuestra Moto
                  </span>
                </h1>
              </div>

              <p className="text-brand-muted text-sm sm:text-base md:text-lg max-w-xl leading-relaxed m-0">
                Adquiere hermosas ilustraciones de paisajes del sur de Chile.
                Con cada pack que compres, obtendrás boletos de regalo para
                participar en el sorteo de increíbles premios.
              </p>

              <div>
                <Countdown endsAt={endsAt} />
              </div>

              <div>
                <CtaButton>PARTICIPAR</CtaButton>
              </div>
            </div>

            <div
              className="md:col-span-5 relative w-full max-w-lg mx-auto md:max-w-none select-none"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative carousel-3d-stage h-[380px] sm:h-[440px] md:h-[500px] w-full">
                {CAROUSEL_IMAGES.map((img, i) => {
                  const style = computeSlideStyle(
                    i,
                    active,
                    CAROUSEL_IMAGES.length,
                  );
                  const sideClick =
                    style.direction === -1
                      ? goPrev
                      : style.direction === 1
                        ? goNext
                        : undefined;
                  return (
                    <div
                      key={img.src}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: style.transform,
                        opacity: style.opacity,
                        zIndex: style.zIndex,
                        pointerEvents: style.pointerEvents,
                        transition: `transform 0.8s ${EASE}, opacity 0.8s ${EASE}`,
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div
                        role={sideClick ? "button" : undefined}
                        tabIndex={sideClick ? 0 : -1}
                        aria-label={
                          sideClick
                            ? `Ver siguiente imagen de ${img.alt}`
                            : img.alt
                        }
                        onClick={sideClick}
                        onKeyDown={
                          sideClick
                            ? (e) => {
                                if (
                                  e.key === "Enter" ||
                                  e.key === " " ||
                                  e.key === "ArrowRight" ||
                                  e.key === "ArrowLeft"
                                ) {
                                  e.preventDefault();
                                  sideClick();
                                }
                              }
                            : undefined
                        }
                        className={`w-[68%] max-w-[280px] rounded-[2rem] overflow-hidden border border-white/10 bg-brand-bgLight shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85)] ${
                          sideClick ? "cursor-pointer" : "cursor-default"
                        } ${style.direction === 0 ? "gradient-border" : ""}`}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={600}
                          height={800}
                          className="w-full h-auto object-contain"
                          priority={i === 0}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goPrev}
                aria-label="Imagen anterior"
                className="absolute left-1 md:left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/15 text-brand-cream backdrop-blur-md transition-all duration-300 cursor-pointer hover:bg-brand-gold hover:text-black hover:border-brand-gold hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Imagen siguiente"
                className="absolute right-1 md:right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/15 text-brand-cream backdrop-blur-md transition-all duration-300 cursor-pointer hover:bg-brand-gold hover:text-black hover:border-brand-gold hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {CAROUSEL_IMAGES.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Ver ${img.alt}`}
                    className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-brand-greenBright"
                        : "w-2 bg-white/25 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
