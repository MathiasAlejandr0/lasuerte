import Link from "next/link";
import { Countdown } from "@/components/home/Countdown";
import { getRaffle } from "@/lib/catalog/store";

export default function SorteosActivosPage() {
  const raffle = getRaffle();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <span className="text-xs uppercase tracking-widest text-brand-greenBright font-bold">
          Sorteos activos
        </span>
        <h1 className="font-title text-3xl md:text-5xl font-black text-white">
          {raffle.title}
        </h1>
        <p className="text-brand-muted">
          Premio:{" "}
          <span className="text-brand-gold font-semibold">
            {raffle.prizeName}
          </span>
        </p>
      </div>

      <div className="flex justify-center">
        <Countdown endsAt={raffle.endsAt} />
      </div>

      <div className="border border-brand-gold/20 rounded-2xl p-6 bg-brand-bgLight/40 space-y-4 text-center">
        <p className="text-brand-cream text-sm leading-relaxed">
          Adquiere un pack de ilustración digital y recibe números de regalo
          para participar. El sorteo se realizará en vivo ante ministro de fe.
        </p>
        <Link
          href="/#comprar"
          className="inline-flex bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-extrabold uppercase px-8 py-3.5 rounded-full no-underline"
        >
          Participar ahora
        </Link>
      </div>
    </main>
  );
}
