import { randomUUID } from "crypto";
import type mysql from "mysql2/promise";
import { RAFFLE } from "@/data/packs";
import { assertRaffleAcceptsOrders } from "@/lib/catalog/orders-guard";
import { getPackById } from "@/lib/catalog/store";
import { hashPassword } from "@/lib/security/password";
import { isDbConfigured, query, transaction } from "./mysql";
import {
  memoryCreateOrder,
  memoryCreatePayout,
  memoryFindAffiliateByEmail,
  memoryFulfillOrder,
  memoryGetAffiliateById,
  memoryGetOrder,
  memoryGetOrderByPayment,
  memoryGetOrderItems,
  memoryGetOrderTickets,
  memoryListAffiliates,
  memoryListOrderItems,
  memoryListOrders,
  memoryListPayouts,
  memoryListTickets,
  memoryLookupTickets,
  memoryMarkConfirmationEmailSent,
  memoryMarkFailed,
  memorySeedDemoSales,
  memorySetPaymentExternal,
  memoryUpsertAffiliate,
} from "./memory";
import type {
  CheckoutInput,
  CommissionType,
  DbAffiliate,
  DbAffiliatePayout,
  DbOrder,
  DbOrderItem,
  DbTicket,
  OrderStatus,
  PaymentProvider,
} from "./types";

const RAFFLE_UUID = "a0000000-0000-4000-8000-000000000001";

const PACK_UUID: Record<string, string> = {
  "pack-puerto-montt": "b0000000-0000-4000-8000-000000000001",
  "pack-llanquihue": "b0000000-0000-4000-8000-000000000002",
  "pack-chiloe": "b0000000-0000-4000-8000-000000000003",
};

const PACK_ID_BY_UUID: Record<string, string> = Object.fromEntries(
  Object.entries(PACK_UUID).map(([id, uuid]) => [uuid, id]),
);

type SqlRow = mysql.RowDataPacket;

function mapOrder(row: SqlRow): DbOrder {
  return {
    id: String(row.id),
    email: String(row.email),
    full_name: String(row.full_name),
    rut: String(row.rut),
    phone: String(row.phone),
    status: row.status as OrderStatus,
    payment_provider: (row.payment_provider as PaymentProvider) ?? null,
    payment_external_id: row.payment_external_id
      ? String(row.payment_external_id)
      : null,
    total_clp: Number(row.total_clp),
    raffle_id: String(row.raffle_id),
    referral_code: row.referral_code ? String(row.referral_code) : null,
    referral_name: row.referral_name ? String(row.referral_name) : null,
    affiliate_id: row.affiliate_id ? String(row.affiliate_id) : null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    paid_at: row.paid_at
      ? row.paid_at instanceof Date
        ? row.paid_at.toISOString()
        : String(row.paid_at)
      : null,
    confirmation_email_sent_at: row.confirmation_email_sent_at
      ? row.confirmation_email_sent_at instanceof Date
        ? row.confirmation_email_sent_at.toISOString()
        : String(row.confirmation_email_sent_at)
      : null,
  };
}

function mapOrderItem(row: SqlRow): DbOrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    pack_id: String(row.pack_id),
    quantity: Number(row.quantity),
    unit_price_clp: Number(row.unit_price_clp),
    ticket_count: Number(row.ticket_count),
  };
}

function mapTicket(row: SqlRow): DbTicket {
  return {
    id: String(row.id),
    raffle_id: String(row.raffle_id),
    order_id: String(row.order_id),
    number: Number(row.number),
    code: String(row.code),
    email: String(row.email),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

function mapAffiliate(row: SqlRow): DbAffiliate {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    commission_type: row.commission_type as CommissionType,
    commission_value: Number(row.commission_value),
    active: Boolean(row.active),
    notes: row.notes ? String(row.notes) : null,
    password_hash: row.password_hash ? String(row.password_hash) : null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
  };
}

function mapPayout(row: SqlRow): DbAffiliatePayout {
  return {
    id: String(row.id),
    affiliate_id: String(row.affiliate_id),
    amount_clp: Number(row.amount_clp),
    period_from:
      row.period_from instanceof Date
        ? row.period_from.toISOString().slice(0, 10)
        : String(row.period_from).slice(0, 10),
    period_to:
      row.period_to instanceof Date
        ? row.period_to.toISOString().slice(0, 10)
        : String(row.period_to).slice(0, 10),
    note: row.note ? String(row.note) : null,
    paid_at:
      row.paid_at instanceof Date
        ? row.paid_at.toISOString()
        : String(row.paid_at),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

/** Solo asocia un afiliado existente; no crea fichas desde la compra pública. */
async function resolveAffiliateId(code?: string) {
  if (!code?.trim()) {
    return {
      affiliateId: null as string | null,
      code: null as string | null,
    };
  }
  const normalized = code.toUpperCase().trim();

  if (!isDbConfigured()) {
    const { memoryFindAffiliateByCode } = await import("./memory");
    const aff = memoryFindAffiliateByCode(normalized);
    return { affiliateId: aff?.id ?? null, code: normalized };
  }

  const rows = await query<SqlRow[]>(
    "SELECT id, code FROM affiliates WHERE UPPER(code) = ? AND active = 1 LIMIT 1",
    [normalized],
  );

  if (rows.length > 0) {
    return {
      affiliateId: String(rows[0].id),
      code: String(rows[0].code),
    };
  }

  return { affiliateId: null, code: normalized };
}

export async function createOrder(input: CheckoutInput) {
  assertRaffleAcceptsOrders();

  if (!isDbConfigured()) {
    return memoryCreateOrder(input);
  }

  let total = 0;
  let ticketTotal = 0;
  const lines: Array<{
    id: string;
    pack_id: string;
    quantity: number;
    unit_price_clp: number;
    ticket_count: number;
  }> = [];

  for (const item of input.items) {
    const pack = getPackById(item.packId);
    if (!pack || item.quantity <= 0)
      throw new Error(`Paquete inválido: ${item.packId}`);
    const packUuid = PACK_UUID[pack.id];
    if (!packUuid) throw new Error(`Paquete no mapeado: ${pack.id}`);
    total += pack.priceClp * item.quantity;
    const tickets = pack.ticketCount * item.quantity;
    ticketTotal += tickets;
    lines.push({
      id: randomUUID(),
      pack_id: packUuid,
      quantity: item.quantity,
      unit_price_clp: pack.priceClp,
      ticket_count: tickets,
    });
  }

  if (!lines.length) throw new Error("Carrito vacío");

  const referral = await resolveAffiliateId(input.referralCode);

  const orderId = randomUUID();
  const createdAt = new Date();

  await transaction(async (conn) => {
    await conn.execute(
      `INSERT INTO orders (
        id, email, full_name, rut, phone, status, payment_provider,
        total_clp, raffle_id, referral_code, referral_name, affiliate_id,
        created_at, paid_at, confirmation_email_sent_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        orderId,
        input.email.toLowerCase().trim(),
        input.fullName.trim(),
        input.rut.trim(),
        input.phone.trim(),
        input.provider,
        total,
        RAFFLE_UUID,
        referral.code,
        input.referralName?.trim() || null,
        referral.affiliateId,
        createdAt,
      ],
    );

    for (const line of lines) {
      await conn.execute(
        `INSERT INTO order_items (id, order_id, pack_id, quantity, unit_price_clp, ticket_count)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          line.id,
          orderId,
          line.pack_id,
          line.quantity,
          line.unit_price_clp,
          line.ticket_count,
        ],
      );
    }
  });

  const createdOrder = await getOrder(orderId);
  if (!createdOrder)
    throw new Error("No se pudo crear el pedido en la base de datos");

  return { order: createdOrder, ticketTotal, items: lines };
}

export async function getOrder(id: string) {
  if (!isDbConfigured()) return memoryGetOrder(id);
  const rows = await query<SqlRow[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id],
  );
  return rows.length > 0 ? mapOrder(rows[0]) : null;
}

export async function setPaymentExternal(
  orderId: string,
  externalId: string,
  provider: PaymentProvider,
) {
  if (!isDbConfigured()) {
    return memorySetPaymentExternal(orderId, externalId, provider);
  }
  await query(
    "UPDATE orders SET payment_external_id = ?, payment_provider = ? WHERE id = ?",
    [externalId, provider, orderId],
  );
  const order = await getOrder(orderId);
  if (!order) throw new Error("Pedido no encontrado");
  return order;
}

export async function fulfillOrder(orderId: string) {
  if (!isDbConfigured()) {
    return memoryFulfillOrder(orderId);
  }

  return transaction(async (conn) => {
    // Atomic claim within transaction — FOR UPDATE locks order row
    const [orderRows] = await conn.execute<SqlRow[]>(
      "SELECT * FROM orders WHERE id = ? FOR UPDATE",
      [orderId],
    );

    if (orderRows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    const order = mapOrder(orderRows[0]);

    if (order.status === "paid") {
      const [ticketRows] = await conn.execute<SqlRow[]>(
        "SELECT * FROM tickets WHERE order_id = ? ORDER BY number",
        [orderId],
      );
      return {
        order,
        tickets: ticketRows.map(mapTicket),
        alreadyPaid: true,
      };
    }

    if (order.status !== "pending") {
      throw new Error("El pedido no está pendiente de pago");
    }

    const paidAt = new Date();

    const [updateResult] = await conn.execute<mysql.ResultSetHeader>(
      "UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'pending'",
      [paidAt, orderId],
    );

    if (updateResult.affectedRows === 0) {
      // Perdió la carrera de concurrencia
      const [retryRows] = await conn.execute<SqlRow[]>(
        "SELECT * FROM orders WHERE id = ?",
        [orderId],
      );
      const retryOrder = mapOrder(retryRows[0]);
      const [ticketRows] = await conn.execute<SqlRow[]>(
        "SELECT * FROM tickets WHERE order_id = ? ORDER BY number",
        [orderId],
      );
      return {
        order: retryOrder,
        tickets: ticketRows.map(mapTicket),
        alreadyPaid: true,
      };
    }

    // Comprobar si ya existen tickets para este pedido
    const [existingTickets] = await conn.execute<SqlRow[]>(
      "SELECT * FROM tickets WHERE order_id = ? ORDER BY number",
      [orderId],
    );

    if (existingTickets.length > 0) {
      const updatedOrder = {
        ...order,
        status: "paid" as const,
        paid_at: paidAt.toISOString(),
      };
      return {
        order: updatedOrder,
        tickets: existingTickets.map(mapTicket),
        alreadyPaid: false,
      };
    }

    // Obtener la cantidad total de boletos a generar
    const [items] = await conn.execute<SqlRow[]>(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId],
    );

    const totalTickets = items.reduce(
      (acc: number, item: SqlRow) => acc + Number(item.ticket_count),
      0,
    );

    // Obtener código de sorteo
    const [raffleRows] = await conn.execute<SqlRow[]>(
      "SELECT code FROM raffles WHERE id = ?",
      [order.raffle_id],
    );
    const raffleCode =
      raffleRows.length > 0 ? String(raffleRows[0].code) : "S2S26";

    // Generar tickets aleatorios de manera atómica
    const assignedCodes: string[] = [];
    for (let i = 0; i < totalTickets; i++) {
      let attempts = 0;
      let inserted = false;

      while (!inserted) {
        attempts++;
        if (attempts > 100) {
          throw new Error("No se pudo asignar código único de boleto");
        }

        const suffix = Math.floor(Math.random() * 100000);
        const ticketCode = raffleCode + String(suffix).padStart(5, "0");
        const ticketId = randomUUID();

        try {
          await conn.execute(
            `INSERT INTO tickets (id, raffle_id, order_id, number, code, email, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              ticketId,
              order.raffle_id,
              orderId,
              suffix,
              ticketCode,
              order.email,
            ],
          );
          assignedCodes.push(ticketCode);
          inserted = true;
        } catch (err: unknown) {
          // Si es error de clave duplicada (ER_DUP_ENTRY / 1062 en MySQL), reintentamos con otro sufijo aleatorio
          const sqlErr = err as { code?: string; errno?: number };
          if (
            sqlErr.code === "ER_DUP_ENTRY" ||
            sqlErr.errno === 1062 ||
            String(err).includes("Duplicate entry")
          ) {
            continue;
          }
          throw err;
        }
      }
    }

    const [finalTickets] = await conn.execute<SqlRow[]>(
      "SELECT * FROM tickets WHERE order_id = ? ORDER BY code",
      [orderId],
    );

    const finalOrder = {
      ...order,
      status: "paid" as const,
      paid_at: paidAt.toISOString(),
    };

    return {
      order: finalOrder,
      tickets: finalTickets.map(mapTicket),
      alreadyPaid: false,
      assignedCodes,
    };
  });
}

export async function lookupTicketsByEmail(email: string) {
  if (!isDbConfigured()) return memoryLookupTickets(email);
  const rows = await query<SqlRow[]>(
    "SELECT * FROM tickets WHERE LOWER(email) = LOWER(?) ORDER BY number",
    [email.trim()],
  );
  return rows.map(mapTicket);
}

function ensureDemoSeed() {
  if (!isDbConfigured()) memorySeedDemoSales();
}

export async function listOrders() {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryListOrders();
  const rows = await query<SqlRow[]>(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000",
  );
  return rows.map(mapOrder);
}

export async function listOrderItems() {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryListOrderItems();
  const rows = await query<SqlRow[]>("SELECT * FROM order_items LIMIT 5000");
  return rows.map(mapOrderItem);
}

export async function listTickets() {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryListTickets();
  const rows = await query<SqlRow[]>(
    "SELECT * FROM tickets ORDER BY number DESC LIMIT 5000",
  );
  return rows.map(mapTicket);
}

/** Pack IDs del catálogo asociados a un pedido (para email de ilustraciones). */
export async function getOrderPackIds(orderId: string): Promise<string[]> {
  const detail = await getOrderDetail(orderId);
  if (!detail) return [];
  const ids = new Set<string>();
  for (const item of detail.items) {
    const catalogId = PACK_ID_BY_UUID[item.pack_id] || item.pack_id;
    if (getPackById(catalogId)) ids.add(catalogId);
  }
  return [...ids];
}

export async function getOrderDetail(orderId: string) {
  ensureDemoSeed();
  if (!isDbConfigured()) {
    const order = memoryGetOrder(orderId);
    if (!order) return null;
    return {
      order,
      items: memoryGetOrderItems(orderId),
      tickets: memoryGetOrderTickets(orderId),
    };
  }

  const order = await getOrder(orderId);
  if (!order) return null;

  const [itemsRows, ticketsRows] = await Promise.all([
    query<SqlRow[]>("SELECT * FROM order_items WHERE order_id = ?", [orderId]),
    query<SqlRow[]>(
      "SELECT * FROM tickets WHERE order_id = ? ORDER BY number",
      [orderId],
    ),
  ]);

  return {
    order,
    items: itemsRows.map(mapOrderItem),
    tickets: ticketsRows.map(mapTicket),
  };
}

export async function listAffiliates() {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryListAffiliates();
  const rows = await query<SqlRow[]>("SELECT * FROM affiliates ORDER BY code");
  return rows.map(mapAffiliate);
}

export async function getAffiliateById(id: string) {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryGetAffiliateById(id);
  const rows = await query<SqlRow[]>(
    "SELECT * FROM affiliates WHERE id = ? LIMIT 1",
    [id],
  );
  return rows.length > 0 ? mapAffiliate(rows[0]) : null;
}

export async function findAffiliateByEmail(email: string) {
  ensureDemoSeed();
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;
  if (!isDbConfigured()) return memoryFindAffiliateByEmail(normalized);
  const rows = await query<SqlRow[]>(
    "SELECT * FROM affiliates WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [normalized],
  );
  return rows.length > 0 ? mapAffiliate(rows[0]) : null;
}

export async function listPayouts() {
  ensureDemoSeed();
  if (!isDbConfigured()) return memoryListPayouts();
  const rows = await query<SqlRow[]>(
    "SELECT * FROM affiliate_payouts ORDER BY paid_at DESC LIMIT 1000",
  );
  return rows.map(mapPayout);
}

export async function createPayout(input: {
  affiliate_id: string;
  amount_clp: number;
  period_from: string;
  period_to: string;
  note?: string | null;
}) {
  if (!isDbConfigured()) return memoryCreatePayout(input);

  const payoutId = randomUUID();
  const paidAt = new Date();
  const amount = Math.round(input.amount_clp);
  const from = input.period_from.slice(0, 10);
  const to = input.period_to.slice(0, 10);
  const note = input.note?.trim() || null;

  await query(
    `INSERT INTO affiliate_payouts (
      id, affiliate_id, amount_clp, period_from, period_to, note, paid_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [payoutId, input.affiliate_id, amount, from, to, note, paidAt, paidAt],
  );

  const rows = await query<SqlRow[]>(
    "SELECT * FROM affiliate_payouts WHERE id = ? LIMIT 1",
    [payoutId],
  );
  return mapPayout(rows[0]);
}

export async function upsertAffiliate(
  input: Partial<DbAffiliate> & {
    code: string;
    name: string;
    password?: string;
  },
) {
  const password_hash =
    input.password != null && input.password.length > 0
      ? hashPassword(input.password)
      : input.password_hash;

  if (!isDbConfigured()) {
    return memoryUpsertAffiliate({
      ...input,
      password_hash: password_hash !== undefined ? password_hash : undefined,
    });
  }

  const code = input.code.toUpperCase().trim();
  const existingRows = await query<SqlRow[]>(
    "SELECT id FROM affiliates WHERE UPPER(code) = ? LIMIT 1",
    [code],
  );

  if (existingRows.length > 0) {
    const affiliateId = String(existingRows[0].id);
    let sql = `UPDATE affiliates SET name = ?, email = ?, phone = ?, commission_type = ?, commission_value = ?, active = ?, notes = ?, updated_at = NOW()`;
    const params: unknown[] = [
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.commission_type ?? "percent",
      input.commission_value ?? 10,
      (input.active ?? true) ? 1 : 0,
      input.notes ?? null,
    ];

    if (password_hash !== undefined) {
      sql += `, password_hash = ?`;
      params.push(password_hash);
    }
    sql += ` WHERE id = ?`;
    params.push(affiliateId);

    await query(sql, params);
    const updated = await getAffiliateById(affiliateId);
    return updated!;
  } else {
    const affiliateId = randomUUID();
    await query(
      `INSERT INTO affiliates (
        id, code, name, email, phone, commission_type, commission_value, active, notes, password_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        affiliateId,
        code,
        input.name,
        input.email ?? null,
        input.phone ?? null,
        input.commission_type ?? "percent",
        input.commission_value ?? 10,
        (input.active ?? true) ? 1 : 0,
        input.notes ?? null,
        password_hash ?? null,
      ],
    );
    const created = await getAffiliateById(affiliateId);
    return created!;
  }
}

export async function markOrderFailed(orderId: string) {
  if (!isDbConfigured()) return memoryMarkFailed(orderId);
  await query(
    "UPDATE orders SET status = 'failed' WHERE id = ? AND status = 'pending'",
    [orderId],
  );
  return getOrder(orderId);
}

export async function getOrderByPaymentExternal(externalId: string) {
  if (!isDbConfigured()) return memoryGetOrderByPayment(externalId);
  const rows = await query<SqlRow[]>(
    "SELECT * FROM orders WHERE payment_external_id = ? LIMIT 1",
    [externalId],
  );
  return rows.length > 0 ? mapOrder(rows[0]) : null;
}

export async function markConfirmationEmailSent(orderId: string) {
  if (!isDbConfigured()) {
    return memoryMarkConfirmationEmailSent(orderId);
  }
  await query(
    "UPDATE orders SET confirmation_email_sent_at = NOW() WHERE id = ?",
    [orderId],
  );
  return getOrder(orderId);
}

/**
 * Pagos de prueba. En producción siempre desactivado.
 * En local: activo salvo PAYMENTS_MOCK=false.
 */
export function paymentsMockEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.PAYMENTS_MOCK === "false") return false;
  if (process.env.PAYMENTS_MOCK === "true") return true;
  return true;
}

/** Conteo de pedidos y códigos emitidos para un ciclo de sorteo. */
export async function getRaffleCycleStats(raffleId: string) {
  if (!isDbConfigured()) {
    return {
      ordersCount: memoryListOrders().filter((o) => o.raffle_id === raffleId)
        .length,
      ticketsCount: memoryListTickets().filter((t) => t.raffle_id === raffleId)
        .length,
    };
  }

  const [ordersRes, ticketsRes] = await Promise.all([
    query<SqlRow[]>(
      "SELECT COUNT(*) as count FROM orders WHERE raffle_id = ?",
      [raffleId],
    ),
    query<SqlRow[]>(
      "SELECT COUNT(*) as count FROM tickets WHERE raffle_id = ?",
      [raffleId],
    ),
  ]);

  return {
    ordersCount: Number(ordersRes[0]?.count ?? 0),
    ticketsCount: Number(ticketsRes[0]?.count ?? 0),
  };
}

export { RAFFLE, RAFFLE_UUID };
