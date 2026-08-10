"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatClp } from "@/data/packs";
import { useCatalog } from "@/hooks/useCatalog";
import { useCart } from "@/store/cart";
import { PaymentBadges } from "./PaymentBadges";

export function Packs() {
  const addPack = useCart((s) => s.addPack);
  const router = useRouter();
  const { packs } = useCatalog();

  const handleBuy = (packId: string) => {
    addPack(packId, 1);
    router.push("/checkout");
  };

  return (
    <section id="comprar" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-black font-title text-white">
            Adquiere tus{" "}
            <span className="text-brand-gold">Packs de Ilustración</span>
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto text-sm md:text-base">
            Elige uno de nuestros 3 paquetes oficiales. Con cada pack recibirás
            espectaculares ilustraciones digitales de paisajes del sur de Chile
            y números de regalo para participar:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`group ticket-card flex flex-col justify-between p-8 rounded-2xl text-center cursor-pointer relative transition-all transform hover:-translate-y-1 border border-brand-gold/25 bg-brand-bg/80 hover:border-2 hover:border-brand-greenBright hover:bg-brand-green/25 hover:shadow-lg ${
                pack.order === 1
                  ? "md:order-1"
                  : pack.order === 2
                    ? "md:order-2"
                    : "md:order-3"
              }`}
            >
              {pack.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-greenBright text-black py-1 px-4 rounded-full text-[11px] font-extrabold uppercase tracking-wider z-10 opacity-90">
                  MÁS CONVENIENTE
                </div>
              )}

              <div className="mb-4 flex justify-center">
                <Image
                  src={pack.image}
                  alt={pack.name}
                  width={1000}
                  height={1333}
                  className="w-full h-auto rounded-xl mb-4 shadow-lg border border-brand-gold/10"
                />
              </div>

              <h3 className="text-2xl font-black text-white">{pack.name}</h3>
              <p className="text-sm text-brand-muted mt-2">
                +{pack.ticketCount} Número
                {pack.ticketCount > 1 ? "s" : ""} de Sorteo Gratis
              </p>
              <p className="text-white font-extrabold text-4xl mt-5">
                {formatClp(pack.priceClp)}{" "}
                <span className="text-sm text-brand-cream/60">CLP</span>
              </p>

              <button
                type="button"
                onClick={() => handleBuy(pack.id)}
                className="btn-buy mt-6 w-full py-3 rounded-lg text-sm font-bold transition-all cursor-pointer block text-center bg-brand-bg text-brand-gold border border-brand-gold/20 group-hover:bg-brand-greenBright group-hover:text-black group-hover:border-brand-greenBright"
              >
                Participar
              </button>
            </div>
          ))}
        </div>

        <PaymentBadges />
      </div>
    </section>
  );
}
