import Image from "next/image";

const SPONSORS = [
  {
    name: "Automotora Overdrive Chile",
    src: "/images/sponsors/overdrive.webp",
    width: 160,
    height: 60,
    className: "h-[26px] w-auto",
  },
  {
    name: "Salgado Automotriz",
    src: "/images/sponsors/salgado.webp",
    width: 140,
    height: 60,
    className: "h-[26px] w-auto",
  },
  {
    name: "RG Motors",
    src: "/images/sponsors/rg-motors.webp",
    width: 150,
    height: 48,
    className: "h-[19px] w-auto",
  },
  {
    name: "Automotriz Unidades Chile",
    src: "/images/sponsors/unidades-chile.webp",
    width: 140,
    height: 48,
    className: "h-[19px] w-auto",
  },
  {
    name: "Mechanicars",
    src: "/images/sponsors/mechanicars.webp",
    width: 140,
    height: 60,
    className: "h-[22px] w-auto",
  },
  {
    name: "El Nuevo Stylo Barbería",
    src: "/images/sponsors/barberianuevostylo.webp",
    width: 100,
    height: 100,
    className: "h-[25px] w-auto",
  },
  {
    name: "Frío Austral",
    src: "/images/sponsors/frio-austral.webp",
    width: 80,
    height: 80,
    className: "h-[23px] w-auto",
  },
  {
    name: "Dtodo",
    src: "/images/sponsors/dtodo.webp",
    width: 100,
    height: 48,
    className: "h-[19px] w-auto",
  },
  {
    name: "Godplay",
    src: "/images/sponsors/godplay.webp",
    width: 80,
    height: 80,
    className: "h-[23px] w-auto",
  },
];

function MarqueeItem() {
  return (
    <div className="inline-flex items-center gap-8 sm:gap-12 mx-4 shrink-0">
      {SPONSORS.map((sponsor) => (
        <div
          key={sponsor.name}
          title={sponsor.name}
          className="inline-flex items-center justify-center opacity-95 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <Image
            src={sponsor.src}
            alt={sponsor.name}
            width={sponsor.width}
            height={sponsor.height}
            className={`${sponsor.className} object-contain`}
            priority
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="home-green-banner fixed left-0 right-0 z-[999] text-white font-semibold text-xs py-2 overflow-hidden whitespace-nowrap select-none">
      <div className="w-full flex overflow-hidden">
        <div className="marquee-content">
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
        </div>
        <div className="marquee-content" aria-hidden="true">
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
        </div>
      </div>
    </div>
  );
}
