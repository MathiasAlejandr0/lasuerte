"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Countdown } from "./Countdown";
import { LiveStreamPlayer } from "./LiveStreamPlayer";
import { CAROUSEL_IMAGES, RAFFLE } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";
import { HeroWavesCanvas } from "./HeroWavesCanvas";

export function Hero() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { raffle } = useCatalog();
  const endsAt = raffle.endsAt || RAFFLE.endsAt;
  const liveStreamUrl = raffle.liveStreamUrl ?? RAFFLE.liveStreamUrl ?? "";
  const raffleStatus = raffle.raffleStatus ?? RAFFLE.raffleStatus ?? "open";
  const winnerTicketNumber =
    raffle.winnerTicketNumber ?? RAFFLE.winnerTicketNumber;
  const winnerName = (raffle.winnerName ?? RAFFLE.winnerName ?? "").trim();
  const winnerNote = (raffle.winnerNote ?? RAFFLE.winnerNote ?? "").trim();
  const [liveMode, setLiveMode] = useState(false);

  const closed = raffleStatus === "closed";
  const hasWinner =
    winnerTicketNumber != null &&
    Number.isFinite(Number(winnerTicketNumber)) &&
    Number(winnerTicketNumber) > 0;
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
    if (showWinner || showLive) return;
    const el = carouselRef.current;
    if (!el) return;
    let index = 0;
    const id = setInterval(() => {
      const slides = el.children.length;
      if (!slides) return;
      index = (index + 1) % slides;
      el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(id);
  }, [showWinner, showLive]);

  return (
    <div className="relative w-full min-h-fit md:min-h-[calc(100vh-100px)] flex items-center overflow-hidden bg-[#020503] py-4 md:py-0">
      <HeroWavesCanvas />
      <div className="absolute bottom-0 left-0 right-0 h-[150px] md:h-[220px] bg-gradient-to-t from-[#020503] via-[#020503]/80 to-transparent pointer-events-none z-[5]" />

      <section
        id="inicio"
        className="relative z-10 w-full py-4 md:py-8 px-4 max-w-6xl mx-auto"
      >
        {showWinner ? (
          <div className="space-y-5 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-title text-white leading-tight m-0">
              ¡Ya tenemos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                GANADOR
              </span>
              !
            </h1>
            <div className="border-2 border-brand-gold/40 rounded-3xl bg-brand-bgLight/90 p-6 sm:p-8 space-y-3">
              <p className="text-xs text-brand-gold uppercase tracking-wider font-bold m-0">
                Número ganador
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-greenBright m-0 font-title">
                #{String(winnerTicketNumber).padStart(5, "0")}
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
              <Link
                href="#comprar"
                className="btn-header-comprar w-full max-w-md flex items-center justify-center bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-sans font-extrabold text-base md:text-lg uppercase py-3.5 sm:py-4 px-8 rounded-full no-underline text-center"
              >
                VER PACKS
              </Link>
            </div>
          </div>
        ) : showLive ? (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-title text-white leading-tight m-0">
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
              <Link
                href="#comprar"
                className="btn-header-comprar w-full max-w-md flex items-center justify-center bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-sans font-extrabold text-base md:text-lg uppercase py-3.5 sm:py-4 px-8 rounded-full no-underline text-center"
              >
                VER PACKS
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="md:col-span-7 space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-title text-white leading-tight">
                ¡Gána increibles <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
                  PREMIOS
                </span>
                !
              </h1>

              <p className="text-brand-muted text-sm sm:text-base md:text-lg max-w-xl">
                Adquiere hermosas ilustraciones de paisajes del sur de Chile. Con
                cada pack que compres, obtendrás boletos de regalo para participar
                en el sorteo de increibles premios.
              </p>

              <Countdown endsAt={endsAt} />

              <Link
                href="#comprar"
                className="btn-header-comprar mt-4 sm:mt-6 w-full max-w-md flex items-center justify-center bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-sans font-extrabold text-base md:text-lg uppercase py-3.5 sm:py-4 px-8 rounded-full no-underline text-center"
              >
                PARTICIPAR
              </Link>
            </div>

            <div className="md:col-span-5 relative group w-full max-w-lg mx-auto md:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 to-brand-gold/10 rounded-3xl blur-xl group-hover:from-brand-green/30 group-hover:to-brand-gold/20 transition-all duration-500 pointer-events-none" />
              <div className="relative bg-brand-bgLight border-2 border-brand-gold/30 rounded-3xl overflow-hidden shadow-2xl p-2 transition-all duration-500 hover:border-brand-greenBright/50 group">
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-2 rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {CAROUSEL_IMAGES.map((img) => (
                    <div
                      key={img.src}
                      className="shrink-0 w-full snap-center rounded-2xl overflow-hidden relative flex items-center justify-center bg-[#020503] aspect-[3/4] max-h-[550px]"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={600}
                        height={800}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        priority={img.src.includes("ilustracionespack")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
