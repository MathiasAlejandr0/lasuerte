export type Pack = {
  id: string;
  slug: string;
  name: string;
  ticketCount: number;
  priceClp: number;
  image: string;
  featured?: boolean;
  order: number;
};

/** Premios a cubrir en analítica (costos estimados, no se muestran en la web). */
export type AnalysisPrize = {
  id: string;
  name: string;
  costClp: number;
};

export const DEFAULT_PRIZES: AnalysisPrize[] = [
  {
    id: "prize-motorrad-corsa",
    name: "MOTORRAD CORSA R150 2026",
    costClp: 2_800_000,
  },
];

export const RAFFLE = {
  id: "raffle-corsa-2026",
  title: "Sorteo MOTORRAD CORSA R150 0km 2026",
  prizeName: "MOTORRAD CORSA R150 2026",
  endsAt: "2026-10-01T00:00:00-03:00",
  ticketMin: 1,
  ticketMax: 100000,
  /** Compat: suma de DEFAULT_PRIZES (fuente de verdad: prizes en catalog store) */
  estimatedPrizeCostClp: DEFAULT_PRIZES.reduce((a, p) => a + p.costClp, 0),
  estimatedOpsCostClp: 400_000,
  /** URL del live (YouTube, Twitch, etc.). Vacío = sin transmisión configurada. */
  liveStreamUrl: "",
  /** open = sorteo activo; closed = cerrado (puede anunciarse ganador). */
  raffleStatus: "open" as "open" | "closed",
  winnerTicketNumber: null as number | null,
  winnerName: "",
  winnerNote: "",
};

export const PACKS: Pack[] = [
  {
    id: "pack-puerto-montt",
    slug: "puerto-montt",
    name: "Ilustración Puerto Montt",
    ticketCount: 1,
    priceClp: 5000,
    image: "/images/packs/puertomontt.webp",
    order: 1,
  },
  {
    id: "pack-llanquihue",
    slug: "llanquihue",
    name: "Ilustración Llanquihue",
    ticketCount: 2,
    priceClp: 8000,
    image: "/images/packs/llanquihue.webp",
    order: 3,
  },
  {
    id: "pack-chiloe",
    slug: "chiloe",
    name: "Ilustración Chiloé",
    ticketCount: 3,
    priceClp: 10000,
    image: "/images/packs/chiloe.webp",
    featured: true,
    order: 2,
  },
];

export const CAROUSEL_IMAGES = [
  { src: "/images/carousel/ilustracionespack.webp", alt: "Hero pack" },
  { src: "/images/carousel/chiloe.webp", alt: "Ilustración Chiloé" },
  { src: "/images/carousel/llanquihue.webp", alt: "Ilustración Llanquihue" },
  { src: "/images/carousel/puertomontt.webp", alt: "Ilustración Puerto Montt" },
];

export function formatClp(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPackById(id: string) {
  return PACKS.find((p) => p.id === id);
}
