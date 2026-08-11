"use client";

import { useEffect, useState } from "react";
import { RAFFLE } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(targetMs: number): Parts {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const EMPTY: Parts = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export function Countdown({ endsAt }: { endsAt?: string }) {
  const { raffle } = useCatalog();
  const target = endsAt || raffle.endsAt || RAFFLE.endsAt;
  const [parts, setParts] = useState<Parts>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const targetMs = new Date(target).getTime();
    setParts(getParts(targetMs));
    setReady(true);
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells = [
    { label: "Días", value: parts.days, bright: false },
    { label: "Horas", value: parts.hours, bright: false },
    { label: "Min", value: parts.minutes, bright: false },
    { label: "Seg", value: parts.seconds, bright: true },
  ];

  return (
    <div className="border border-brand-gold/25 rounded-2xl p-3 sm:p-4 bg-[#07160b] max-w-md w-full">
      <span className="text-xs text-brand-gold uppercase tracking-wider font-bold block mb-2">
        Tiempo restante para el gran sorteo:
      </span>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="bg-brand-bg p-1.5 sm:p-2 rounded-lg border border-brand-gold/10"
          >
            <span
              key={`${cell.label}-${ready ? cell.value : "empty"}`}
              className={`tick-pop text-xl sm:text-2xl md:text-3xl font-extrabold block ${
                cell.bright ? "text-brand-greenBright" : "text-white"
              }`}
            >
              {ready ? pad(cell.value) : "--"}
            </span>
            <span className="text-[9px] sm:text-[10px] text-brand-muted uppercase font-semibold">
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
