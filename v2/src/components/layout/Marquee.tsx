import Image from "next/image";

const SPONSORS = [
  {
    name: "Automotora Overdrive Chile",
    src: "/images/sponsors/overdrive.webp",
    width: 140,
    height: 48,
    className: "h-[19px] w-auto",
  },
  {
    name: "Salgado Automotriz",
    src: "/images/sponsors/salgado.webp",
    width: 120,
    height: 48,
    className: "h-[19px] w-auto",
  },
  {
    name: "RG Motors",
    src: "/images/sponsors/rg-motors.webp",
    width: 150,
    height: 48,
    className: "h-[17px] w-auto",
  },
  {
    name: "Automotriz Unidades Chile",
    src: "/images/sponsors/unidades-chile.webp",
    width: 140,
    height: 48,
    className: "h-[17px] w-auto",
  },
  {
    name: "Frío Austral",
    src: "/images/sponsors/frio-austral.webp",
    width: 80,
    height: 80,
    className: "h-[20px] w-auto",
  },
  {
    name: "Dtodo",
    src: "/images/sponsors/dtodo.webp",
    width: 100,
    height: 48,
    className: "h-[16px] w-auto",
  },
  {
    name: "Godplay",
    src: "/images/sponsors/godplay.webp",
    width: 80,
    height: 80,
    className: "h-[19px] w-auto",
  },
];

function MarqueeItem() {
  return (
    <div className="inline-flex items-center gap-5 mx-5 shrink-0">
      <span className="text-white font-semibold text-xs whitespace-nowrap tracking-wide">
        Adquiere tu ilustración digital y participa por el gran premio — Pago
        100% seguro con Flow
      </span>

      <span className="text-white/40 text-[10px]" aria-hidden="true">
        ✦
      </span>

      <div className="inline-flex items-center gap-4 sm:gap-5 px-3.5 py-1 rounded-full bg-black/30 border border-white/15 backdrop-blur-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f7c64b] opacity-90 pr-1">
          Sponsors:
        </span>
        {SPONSORS.map((sponsor) => (
          <div
            key={sponsor.name}
            title={sponsor.name}
            className="inline-flex items-center justify-center opacity-85 hover:opacity-100 transition-all duration-200 hover:scale-105"
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

      <span className="text-white/40 text-[10px]" aria-hidden="true">
        ✦
      </span>
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
