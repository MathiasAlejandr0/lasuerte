import { getRaffle } from "@/lib/catalog/store";

/** Lanza si el sorteo no acepta nuevas compras. */
export function assertRaffleAcceptsOrders() {
  const raffle = getRaffle();
  if (raffle.raffleStatus === "closed") {
    throw new Error(
      "El sorteo ya está cerrado. No se pueden realizar nuevas compras.",
    );
  }
}

export function raffleAcceptsOrders() {
  return getRaffle().raffleStatus !== "closed";
}
