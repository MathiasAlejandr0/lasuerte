import fs from "fs";
import path from "path";
import {
  DEFAULT_PRIZES,
  PACKS as DEFAULT_PACKS,
  RAFFLE as DEFAULT_RAFFLE,
  type AnalysisPrize,
  type Pack,
} from "@/data/packs";
import {
  formatTicketCode,
  isValidRaffleCode,
  isValidTicketCodeForRaffle,
  normalizeRaffleCode,
} from "@/lib/tickets/codes";

export type { AnalysisPrize };

export type RaffleSettings = {
  id: string;
  title: string;
  prizeName: string;
  endsAt: string;
  /** Prefijo del código de participación (ej. S2S26). */
  code: string;
  ticketMin: number;
  ticketMax: number;
  /** Compat: suma de costos de `prizes` */
  estimatedPrizeCostClp: number;
  estimatedOpsCostClp: number;
  /** Link de transmisión en vivo del sorteo */
  liveStreamUrl: string;
  raffleStatus: "open" | "closed";
  /** Código completo ganador (sorteo + 5 dígitos). */
  winnerTicketCode: string;
  winnerName: string;
  winnerNote: string;
};

/** Sorteo ya terminado, guardado como historial. */
export type ArchivedRaffle = RaffleSettings & {
  archivedAt: string;
  ordersCount: number;
  ticketsCount: number;
};

export type NewRaffleInput = {
  title: string;
  prizeName: string;
  code: string;
  endsAt: string;
  prizeCostClp: number;
  opsCostClp?: number;
  liveStreamUrl?: string;
};

type CatalogStore = {
  raffle: RaffleSettings;
  packs: Pack[];
  prizes: AnalysisPrize[];
  raffleHistory: ArchivedRaffle[];
};

const globalStore = globalThis as unknown as {
  __suertuCatalog?: CatalogStore;
  __suertuCatalogLoaded?: boolean;
};

const CATALOG_PATH = path.join(process.cwd(), ".data", "catalog.json");

function sumPrizeCosts(prizes: AnalysisPrize[]) {
  return prizes.reduce((a, p) => a + Math.max(0, Math.round(p.costClp)), 0);
}

function syncPrizeCostCompat(data: CatalogStore) {
  if (!Array.isArray(data.prizes) || data.prizes.length === 0) {
    data.prizes = migratePrizesFromLegacy(data.raffle);
  }
  data.raffle.estimatedPrizeCostClp = sumPrizeCosts(data.prizes);
}

/** Repara catálogos en memoria sin prizes[]. */
function ensureCatalogShape(data: CatalogStore): CatalogStore {
  if (!data.raffle) {
    data.raffle = { ...DEFAULT_RAFFLE };
  }
  if (typeof data.raffle.liveStreamUrl !== "string") {
    data.raffle.liveStreamUrl = "";
  }
  if (!isValidRaffleCode(data.raffle.code || "")) {
    data.raffle.code = DEFAULT_RAFFLE.code;
  } else {
    data.raffle.code = normalizeRaffleCode(data.raffle.code);
  }
  if (
    data.raffle.raffleStatus !== "open" &&
    data.raffle.raffleStatus !== "closed"
  ) {
    data.raffle.raffleStatus = "open";
  }
  if (typeof data.raffle.winnerTicketCode !== "string") {
    data.raffle.winnerTicketCode = "";
  } else {
    data.raffle.winnerTicketCode = data.raffle.winnerTicketCode
      .trim()
      .toUpperCase();
  }
  if (typeof data.raffle.winnerName !== "string") {
    data.raffle.winnerName = "";
  }
  if (typeof data.raffle.winnerNote !== "string") {
    data.raffle.winnerNote = "";
  }
  if (!Array.isArray(data.packs) || data.packs.length === 0) {
    data.packs = DEFAULT_PACKS.map((p) => ({ ...p }));
  }
  if (!Array.isArray(data.prizes) || data.prizes.length === 0) {
    data.prizes = migratePrizesFromLegacy(data.raffle);
  }
  if (!Array.isArray(data.raffleHistory)) {
    data.raffleHistory = [];
  }
  syncPrizeCostCompat(data);
  return data;
}

function cloneDefaults(): CatalogStore {
  const prizes = DEFAULT_PRIZES.map((p) => ({ ...p }));
  return {
    raffle: {
      ...DEFAULT_RAFFLE,
      estimatedPrizeCostClp: sumPrizeCosts(prizes),
    },
    packs: DEFAULT_PACKS.map((p) => ({ ...p })),
    prizes,
    raffleHistory: [],
  };
}

function normalizePrize(
  raw: unknown,
  fallback?: AnalysisPrize,
): AnalysisPrize | null {
  if (!raw || typeof raw !== "object") return fallback ? { ...fallback } : null;
  const p = raw as Partial<AnalysisPrize>;
  const id = String(p.id || fallback?.id || "").trim();
  const name = String(p.name || fallback?.name || "").trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    costClp: Math.max(
      0,
      Math.round(Number(p.costClp ?? fallback?.costClp ?? 0)),
    ),
  };
}

function normalizeArchivedRaffle(raw: unknown): ArchivedRaffle | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<RaffleSettings> & {
    archivedAt?: string;
    ordersCount?: number;
    ticketsCount?: number;
  };
  const code = String(r.code || "")
    .trim()
    .toUpperCase();
  if (!isValidRaffleCode(code)) return null;
  return {
    id: String(r.id || "").trim() || `raffle-${code.toLowerCase()}`,
    title: String(r.title || "").trim(),
    prizeName: String(r.prizeName || "").trim(),
    endsAt: String(r.endsAt || ""),
    code,
    ticketMin: Math.max(0, Number(r.ticketMin ?? 0)),
    ticketMax: Math.max(1, Number(r.ticketMax ?? 1)),
    estimatedPrizeCostClp: Math.max(
      0,
      Math.round(Number(r.estimatedPrizeCostClp ?? 0)),
    ),
    estimatedOpsCostClp: Math.max(
      0,
      Math.round(Number(r.estimatedOpsCostClp ?? 0)),
    ),
    liveStreamUrl: String(r.liveStreamUrl ?? "").trim(),
    raffleStatus: r.raffleStatus === "closed" ? "closed" : "open",
    winnerTicketCode: String(r.winnerTicketCode ?? "")
      .trim()
      .toUpperCase(),
    winnerName: String(r.winnerName ?? "").trim(),
    winnerNote: String(r.winnerNote ?? "").trim(),
    archivedAt: String(r.archivedAt || ""),
    ordersCount: Math.max(0, Number(r.ordersCount ?? 0)),
    ticketsCount: Math.max(0, Number(r.ticketsCount ?? 0)),
  };
}

function migratePrizesFromLegacy(
  raffle: Partial<RaffleSettings> | undefined,
): AnalysisPrize[] {
  const name = String(raffle?.prizeName || DEFAULT_RAFFLE.prizeName).trim();
  const cost = Math.max(
    0,
    Math.round(
      Number(
        raffle?.estimatedPrizeCostClp ?? DEFAULT_RAFFLE.estimatedPrizeCostClp,
      ),
    ),
  );
  return [
    {
      id: DEFAULT_PRIZES[0]?.id || "prize-legacy",
      name: name || "Premio principal",
      costClp: cost,
    },
  ];
}

function mergePersisted(raw: unknown): CatalogStore {
  const base = cloneDefaults();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<CatalogStore> & {
    raffle?: Partial<RaffleSettings>;
  };

  if (data.raffle && typeof data.raffle === "object") {
    const r = data.raffle as Partial<RaffleSettings> & {
      winnerTicketNumber?: number | null;
    };
    const code = isValidRaffleCode(String(r.code ?? ""))
      ? normalizeRaffleCode(String(r.code))
      : base.raffle.code;

    let winnerTicketCode = String(
      r.winnerTicketCode ?? base.raffle.winnerTicketCode ?? "",
    )
      .trim()
      .toUpperCase();
    // Migración desde catálogos viejos con número secuencial
    if (
      !winnerTicketCode &&
      r.winnerTicketNumber != null &&
      String(r.winnerTicketNumber).trim() !== "" &&
      Number.isFinite(Number(r.winnerTicketNumber))
    ) {
      winnerTicketCode = formatTicketCode(code, Number(r.winnerTicketNumber));
    }

    base.raffle = {
      ...base.raffle,
      title: String(r.title ?? base.raffle.title),
      prizeName: String(r.prizeName ?? base.raffle.prizeName),
      endsAt: String(r.endsAt ?? base.raffle.endsAt),
      code,
      ticketMin: Number(r.ticketMin ?? base.raffle.ticketMin),
      ticketMax: Number(r.ticketMax ?? base.raffle.ticketMax),
      estimatedOpsCostClp: Number(
        r.estimatedOpsCostClp ?? base.raffle.estimatedOpsCostClp,
      ),
      liveStreamUrl: String(
        r.liveStreamUrl ?? base.raffle.liveStreamUrl ?? "",
      ).trim(),
      raffleStatus:
        r.raffleStatus === "closed" || r.raffleStatus === "open"
          ? r.raffleStatus
          : base.raffle.raffleStatus,
      winnerTicketCode,
      winnerName: String(r.winnerName ?? base.raffle.winnerName ?? "").trim(),
      winnerNote: String(r.winnerNote ?? base.raffle.winnerNote ?? "").trim(),
    };
  }

  if (Array.isArray(data.prizes) && data.prizes.length > 0) {
    const next: AnalysisPrize[] = [];
    for (const incoming of data.prizes) {
      const prize = normalizePrize(incoming);
      if (prize) next.push(prize);
    }
    if (next.length) base.prizes = next;
  } else if (data.raffle) {
    // Catálogo viejo sin prizes[] → migrar desde prizeName + estimatedPrizeCostClp
    base.prizes = migratePrizesFromLegacy(data.raffle);
  }

  if (Array.isArray(data.packs)) {
    for (const incoming of data.packs) {
      if (!incoming?.id) continue;
      const pack = base.packs.find((p) => p.id === incoming.id);
      if (!pack) continue;
      if (incoming.name != null) pack.name = String(incoming.name);
      if (incoming.priceClp != null) {
        pack.priceClp = Math.max(0, Math.round(Number(incoming.priceClp)));
      }
      if (incoming.ticketCount != null) {
        pack.ticketCount = Math.max(
          1,
          Math.round(Number(incoming.ticketCount)),
        );
      }
      if (incoming.featured != null) pack.featured = Boolean(incoming.featured);
      if (incoming.order != null) pack.order = Number(incoming.order);
    }
  }

  if (Array.isArray(data.raffleHistory)) {
    for (const raw of data.raffleHistory) {
      const archived = normalizeArchivedRaffle(raw);
      if (archived) base.raffleHistory.push(archived);
    }
  }

  syncPrizeCostCompat(base);
  return base;
}

function loadFromDisk(): CatalogStore | null {
  try {
    if (!fs.existsSync(CATALOG_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8")) as unknown;
    return mergePersisted(raw);
  } catch {
    return null;
  }
}

function persistToDisk(data: CatalogStore) {
  try {
    syncPrizeCostCompat(data);
    const dir = path.dirname(CATALOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      CATALOG_PATH,
      JSON.stringify(
        {
          raffle: data.raffle,
          prizes: data.prizes.map((p) => ({
            id: p.id,
            name: p.name,
            costClp: p.costClp,
          })),
          packs: data.packs.map((p) => ({
            id: p.id,
            name: p.name,
            priceClp: p.priceClp,
            ticketCount: p.ticketCount,
            featured: Boolean(p.featured),
            order: p.order,
          })),
          raffleHistory: data.raffleHistory,
        },
        null,
        2,
      ),
      "utf8",
    );
  } catch (err) {
    console.error("[catalog] no se pudo persistir", err);
  }
}

function store(): CatalogStore {
  if (!globalStore.__suertuCatalogLoaded) {
    globalStore.__suertuCatalog = loadFromDisk() ?? cloneDefaults();
    globalStore.__suertuCatalogLoaded = true;
  }
  if (!globalStore.__suertuCatalog) {
    globalStore.__suertuCatalog = cloneDefaults();
  }
  return ensureCatalogShape(globalStore.__suertuCatalog);
}

function touch() {
  persistToDisk(store());
}

export function getRaffle(): RaffleSettings {
  const s = store();
  syncPrizeCostCompat(s);
  return { ...s.raffle };
}

export function getPrizes(): AnalysisPrize[] {
  return store().prizes.map((p) => ({ ...p }));
}

export function getPrizeById(id: string) {
  const prize = store().prizes.find((p) => p.id === id);
  return prize ? { ...prize } : undefined;
}

export function replacePrizes(
  prizes: Array<{ id?: string; name: string; costClp: number }>,
) {
  if (!prizes.length) throw new Error("Debes tener al menos un premio");
  store().prizes = prizes.map((p, idx) => {
    const id =
      String(p.id || "").trim() ||
      `prize-${idx + 1}-${Math.random().toString(36).slice(2, 8)}`;
    const name = String(p.name).trim();
    if (name.length < 2) throw new Error("Cada premio necesita un nombre");
    return {
      id,
      name,
      costClp: Math.max(0, Math.round(Number(p.costClp))),
    };
  });
  syncPrizeCostCompat(store());
  touch();
  return getPrizes();
}

export function getPacks(): Pack[] {
  return [...store().packs]
    .map((p) => ({ ...p }))
    .sort((a, b) => a.order - b.order);
}

export function getPackById(id: string) {
  const pack = store().packs.find((p) => p.id === id);
  return pack ? { ...pack } : undefined;
}

export function updateRaffle(patch: Partial<RaffleSettings>) {
  const raffle = store().raffle;
  if (patch.title != null) raffle.title = String(patch.title).trim();
  if (patch.prizeName != null)
    raffle.prizeName = String(patch.prizeName).trim();
  if (patch.endsAt != null) raffle.endsAt = String(patch.endsAt);
  if (patch.code != null) {
    const next = normalizeRaffleCode(String(patch.code));
    if (!isValidRaffleCode(next)) {
      throw new Error(
        "El código del sorteo debe tener 2–12 caracteres (A-Z y 0-9)",
      );
    }
    raffle.code = next;
  }
  if (patch.ticketMin != null) raffle.ticketMin = Number(patch.ticketMin);
  if (patch.ticketMax != null) raffle.ticketMax = Number(patch.ticketMax);
  if (patch.liveStreamUrl != null) {
    raffle.liveStreamUrl = String(patch.liveStreamUrl).trim();
  }
  if (patch.raffleStatus === "open" || patch.raffleStatus === "closed") {
    raffle.raffleStatus = patch.raffleStatus;
  }
  if (patch.winnerTicketCode !== undefined) {
    const raw = String(patch.winnerTicketCode || "")
      .trim()
      .toUpperCase();
    if (!raw) {
      raffle.winnerTicketCode = "";
    } else if (!isValidTicketCodeForRaffle(raw, raffle.code)) {
      throw new Error(
        `El código ganador debe ser el código del sorteo (${raffle.code}) más 5 dígitos`,
      );
    } else {
      raffle.winnerTicketCode = raw;
    }
  }
  if (patch.winnerName != null) {
    raffle.winnerName = String(patch.winnerName).trim();
  }
  if (patch.winnerNote != null) {
    raffle.winnerNote = String(patch.winnerNote).trim();
  }
  if (patch.estimatedOpsCostClp != null) {
    raffle.estimatedOpsCostClp = Math.max(
      0,
      Math.round(Number(patch.estimatedOpsCostClp)),
    );
  }
  // estimatedPrizeCostClp se ignora si hay prizes; se recalcula desde prizes
  if (patch.estimatedPrizeCostClp != null && store().prizes.length === 1) {
    store().prizes[0].costClp = Math.max(
      0,
      Math.round(Number(patch.estimatedPrizeCostClp)),
    );
  }
  syncPrizeCostCompat(store());
  touch();
  return getRaffle();
}

export function getRaffleHistory(): ArchivedRaffle[] {
  return store().raffleHistory.map((r) => ({ ...r }));
}

export type RaffleCycleStats = {
  ordersCount: number;
  ticketsCount: number;
};

/**
 * Cierra el ciclo actual: lo archiva en el historial (con sus estadísticas)
 * y deja activo un sorteo nuevo. Devuelve el nuevo sorteo.
 */
export function createNewRaffle(
  input: NewRaffleInput,
  stats: RaffleCycleStats = { ordersCount: 0, ticketsCount: 0 },
) {
  const s = store();
  const title = String(input.title ?? "").trim();
  const prizeName = String(input.prizeName ?? "").trim();
  const code = normalizeRaffleCode(String(input.code ?? ""));
  const ends = new Date(input.endsAt);

  if (title.length < 3)
    throw new Error("El título debe tener al menos 3 caracteres");
  if (prizeName.length < 2) {
    throw new Error("El premio debe tener al menos 2 caracteres");
  }
  if (!isValidRaffleCode(code)) {
    throw new Error(
      "El código del sorteo debe tener 2–12 caracteres (A-Z y 0-9)",
    );
  }
  const codeInUse =
    s.raffle.code === code || s.raffleHistory.some((r) => r.code === code);
  if (codeInUse) {
    throw new Error(
      `El código ${code} ya fue usado. Usa un código nuevo para este ciclo`,
    );
  }
  if (Number.isNaN(ends.getTime())) {
    throw new Error("La fecha de cierre no es válida");
  }
  if (ends.getTime() <= Date.now()) {
    throw new Error("La fecha de cierre debe ser en el futuro");
  }
  const prizeCost = Math.max(1, Math.round(Number(input.prizeCostClp ?? 0)));
  const opsCost = Math.max(0, Math.round(Number(input.opsCostClp ?? 0)));

  const current = s.raffle;
  s.raffleHistory.unshift({
    ...current,
    archivedAt: new Date().toISOString(),
    ordersCount: Math.max(0, Math.round(stats.ordersCount)),
    ticketsCount: Math.max(0, Math.round(stats.ticketsCount)),
  });

  s.raffle = {
    id: `raffle-${code.toLowerCase()}`,
    title,
    prizeName,
    endsAt: ends.toISOString(),
    code,
    ticketMin: 0,
    ticketMax: 99999,
    estimatedPrizeCostClp: prizeCost,
    estimatedOpsCostClp: opsCost,
    liveStreamUrl: String(input.liveStreamUrl ?? "").trim(),
    raffleStatus: "open",
    winnerTicketCode: "",
    winnerName: "",
    winnerNote: "",
  };
  s.prizes = [
    {
      id: "prize-main",
      name: prizeName,
      costClp: prizeCost,
    },
  ];
  s.raffle.estimatedPrizeCostClp = sumPrizeCosts(s.prizes);
  touch();
  return getRaffle();
}

export function updatePack(
  id: string,
  patch: Partial<
    Pick<Pack, "name" | "priceClp" | "ticketCount" | "featured" | "order">
  >,
) {
  const pack = store().packs.find((p) => p.id === id);
  if (!pack) throw new Error("Paquete no encontrado");
  if (patch.name != null) pack.name = String(patch.name).trim();
  if (patch.priceClp != null) {
    pack.priceClp = Math.max(0, Math.round(Number(patch.priceClp)));
  }
  if (patch.ticketCount != null) {
    pack.ticketCount = Math.max(1, Math.round(Number(patch.ticketCount)));
  }
  if (patch.featured != null) pack.featured = Boolean(patch.featured);
  if (patch.order != null) pack.order = Number(patch.order);
  touch();
  return { ...pack };
}

export function replacePacks(
  packs: Array<
    Partial<Pack> & {
      id: string;
      name: string;
      priceClp: number;
      ticketCount: number;
    }
  >,
) {
  for (const incoming of packs) {
    const pack = store().packs.find((p) => p.id === incoming.id);
    if (!pack) throw new Error(`Pack no encontrado: ${incoming.id}`);
    pack.name = String(incoming.name).trim();
    pack.priceClp = Math.max(0, Math.round(Number(incoming.priceClp)));
    pack.ticketCount = Math.max(1, Math.round(Number(incoming.ticketCount)));
    if (incoming.order != null) pack.order = Number(incoming.order);
  }
  const featuredId = packs.find((p) => p.featured)?.id;
  if (featuredId) {
    for (const p of store().packs) {
      p.featured = p.id === featuredId;
    }
  }
  touch();
  return getPacks();
}
