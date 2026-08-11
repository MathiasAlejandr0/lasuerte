"use client";

import { useEffect, useState } from "react";
import { PACKS, RAFFLE, type Pack } from "@/data/packs";
import type { PublicPaymentOptions } from "@/lib/payments/available";

export type CatalogRaffle = typeof RAFFLE;

const DEFAULT_PAYMENTS: PublicPaymentOptions = {
  mercadopago: false,
  webpay: false,
  mock: true,
  defaultProvider: "mock",
};

export function useCatalog() {
  const [packs, setPacks] = useState<Pack[]>(PACKS);
  const [raffle, setRaffle] = useState<CatalogRaffle>(RAFFLE);
  const [payments, setPayments] =
    useState<PublicPaymentOptions>(DEFAULT_PAYMENTS);
  const [acceptsOrders, setAcceptsOrders] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          packs: Pack[];
          raffle: CatalogRaffle;
          payments?: PublicPaymentOptions;
          acceptsOrders?: boolean;
        };
        if (cancelled) return;
        if (data.packs?.length) setPacks(data.packs);
        if (data.raffle) {
          setRaffle({
            ...RAFFLE,
            ...data.raffle,
            liveStreamUrl: data.raffle.liveStreamUrl ?? "",
            raffleStatus:
              data.raffle.raffleStatus === "closed" ? "closed" : "open",
            code: data.raffle.code || RAFFLE.code,
            winnerTicketCode: data.raffle.winnerTicketCode ?? "",
            winnerName: data.raffle.winnerName ?? "",
            winnerNote: data.raffle.winnerNote ?? "",
          });
        }
        if (data.payments) setPayments(data.payments);
        if (typeof data.acceptsOrders === "boolean") {
          setAcceptsOrders(data.acceptsOrders);
        } else if (data.raffle) {
          setAcceptsOrders(data.raffle.raffleStatus !== "closed");
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { packs, raffle, payments, acceptsOrders, loaded };
}
