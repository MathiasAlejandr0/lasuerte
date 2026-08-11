import { RAFFLE } from "@/data/packs";
import { assertRaffleAcceptsOrders } from "@/lib/catalog/orders-guard";
import { getPackById, getRaffle } from "@/lib/catalog/store";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/security/password";
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
  DbAffiliate,
  DbAffiliatePayout,
  DbOrder,
  DbOrderItem,
  DbTicket,
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

/** Solo asocia un afiliado existente; no crea fichas desde la compra pública. */
async function resolveAffiliateId(code?: string, _name?: string) {
  if (!code?.trim()) {
    return {
      affiliateId: null as string | null,
      code: null as string | null,
    };
  }
  const normalized = code.toUpperCase().trim();

  if (!isSupabaseConfigured()) {
    const { memoryFindAffiliateByCode } = await import("./memory");
    const aff = memoryFindAffiliateByCode(normalized);
    return { affiliateId: aff?.id ?? null, code: normalized };
  }

  const sb = getSupabaseAdmin();
  const { data: existing } = await sb
    .from("affiliates")
    .select("*")
    .ilike("code", normalized)
    .eq("active", true)
    .maybeSingle();

  if (existing) {
    return {
      affiliateId: existing.id as string,
      code: existing.code as string,
    };
  }

  return { affiliateId: null, code: normalized };
}

export async function createOrder(input: CheckoutInput) {
  assertRaffleAcceptsOrders();

  if (!isSupabaseConfigured()) {
    return memoryCreateOrder(input);
  }

  const sb = getSupabaseAdmin();
  let total = 0;
  let ticketTotal = 0;
  const lines: Array<{
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
      pack_id: packUuid,
      quantity: item.quantity,
      unit_price_clp: pack.priceClp,
      ticket_count: tickets,
    });
  }

  if (!lines.length) throw new Error("Carrito vacío");

  const referral = await resolveAffiliateId(
    input.referralCode,
    input.referralName,
  );

  const { data: order, error } = await sb
    .from("orders")
    .insert({
      email: input.email.toLowerCase().trim(),
      full_name: input.fullName.trim(),
      rut: input.rut.trim(),
      phone: input.phone.trim(),
      status: "pending",
      payment_provider: input.provider,
      total_clp: total,
      raffle_id: RAFFLE_UUID,
      referral_code: referral.code,
      referral_name: input.referralName?.trim() || null,
      affiliate_id: referral.affiliateId,
      confirmation_email_sent_at: null,
    })
    .select("*")
    .single();

  if (error || !order)
    throw new Error(error?.message || "No se pudo crear el pedido");

  const { error: itemsError } = await sb
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsError) throw new Error(itemsError.message);

  return { order: order as DbOrder, ticketTotal, items: lines };
}

export async function getOrder(id: string) {
  if (!isSupabaseConfigured()) return memoryGetOrder(id);
  const { data } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as DbOrder | null) ?? null;
}

export async function setPaymentExternal(
  orderId: string,
  externalId: string,
  provider: PaymentProvider,
) {
  if (!isSupabaseConfigured()) {
    return memorySetPaymentExternal(orderId, externalId, provider);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({ payment_external_id: externalId, payment_provider: provider })
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DbOrder;
}

export async function fulfillOrder(orderId: string) {
  if (!isSupabaseConfigured()) {
    return memoryFulfillOrder(orderId);
  }

  const sb = getSupabaseAdmin();
  const order = await getOrder(orderId);
  if (!order) throw new Error("Pedido no encontrado");

  if (order.status === "paid") {
    const { data: tickets } = await sb
      .from("tickets")
      .select("*")
      .eq("order_id", orderId)
      .order("number");
    return { order, tickets: tickets ?? [], alreadyPaid: true };
  }

  if (order.status !== "pending") {
    throw new Error("El pedido no está pendiente de pago");
  }

  // Atomic claim — only one concurrent fulfiller wins
  const paidAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await sb
    .from("orders")
    .update({ status: "paid", paid_at: paidAt })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (claimError) throw new Error(claimError.message);

  if (!claimed) {
    const again = await getOrder(orderId);
    if (again?.status === "paid") {
      const { data: tickets } = await sb
        .from("tickets")
        .select("*")
        .eq("order_id", orderId)
        .order("number");
      return { order: again, tickets: tickets ?? [], alreadyPaid: true };
    }
    throw new Error("No se pudo confirmar el pago del pedido");
  }

  const { data: existingTickets } = await sb
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("number");

  if (existingTickets?.length) {
    return {
      order: claimed as DbOrder,
      tickets: existingTickets,
      alreadyPaid: false,
    };
  }

  const { data: items, error: itemsError } = await sb
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (itemsError) throw new Error(itemsError.message);

  const count = (items ?? []).reduce(
    (acc, i) => acc + (i.ticket_count as number),
    0,
  );

  const { data: codes, error: assignError } = await sb.rpc("assign_tickets", {
    p_order_id: orderId,
    p_count: count,
  });
  if (assignError) throw new Error(assignError.message);

  const { data: tickets } = await sb
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("code");

  return {
    order: claimed as DbOrder,
    tickets: tickets ?? [],
    alreadyPaid: false,
    assignedCodes: codes as string[],
  };
}

export async function lookupTicketsByEmail(email: string) {
  if (!isSupabaseConfigured()) return memoryLookupTickets(email);
  const { data, error } = await getSupabaseAdmin()
    .from("tickets")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .order("number");
  if (error) throw new Error(error.message);
  return data ?? [];
}

function ensureDemoSeed() {
  if (!isSupabaseConfigured()) memorySeedDemoSales();
}

export async function listOrders() {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryListOrders();
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data as DbOrder[]) ?? [];
}

export async function listOrderItems() {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryListOrderItems();
  const { data, error } = await getSupabaseAdmin()
    .from("order_items")
    .select("*")
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data as DbOrderItem[]) ?? [];
}

export async function listTickets() {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryListTickets();
  const { data, error } = await getSupabaseAdmin()
    .from("tickets")
    .select("*")
    .order("number", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data as DbTicket[]) ?? [];
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
  if (!isSupabaseConfigured()) {
    const order = memoryGetOrder(orderId);
    if (!order) return null;
    return {
      order,
      items: memoryGetOrderItems(orderId),
      tickets: memoryGetOrderTickets(orderId),
    };
  }

  const sb = getSupabaseAdmin();
  const { data: order } = await sb
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: tickets }] = await Promise.all([
    sb.from("order_items").select("*").eq("order_id", orderId),
    sb.from("tickets").select("*").eq("order_id", orderId).order("number"),
  ]);

  return {
    order: order as DbOrder,
    items: (items as DbOrderItem[]) ?? [],
    tickets: (tickets as DbTicket[]) ?? [],
  };
}

export async function listAffiliates() {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryListAffiliates();
  const { data, error } = await getSupabaseAdmin()
    .from("affiliates")
    .select("*")
    .order("code");
  if (error) throw new Error(error.message);
  return ((data as DbAffiliate[]) ?? []).map((a) => ({
    ...a,
    password_hash: a.password_hash ?? null,
  }));
}

export async function getAffiliateById(id: string) {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryGetAffiliateById(id);
  const { data, error } = await getSupabaseAdmin()
    .from("affiliates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const a = data as DbAffiliate;
  return { ...a, password_hash: a.password_hash ?? null };
}

export async function findAffiliateByEmail(email: string) {
  ensureDemoSeed();
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;
  if (!isSupabaseConfigured()) return memoryFindAffiliateByEmail(normalized);
  const { data, error } = await getSupabaseAdmin()
    .from("affiliates")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const a = data as DbAffiliate;
  return { ...a, password_hash: a.password_hash ?? null };
}

export async function listPayouts() {
  ensureDemoSeed();
  if (!isSupabaseConfigured()) return memoryListPayouts();
  const { data, error } = await getSupabaseAdmin()
    .from("affiliate_payouts")
    .select("*")
    .order("paid_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data as DbAffiliatePayout[]) ?? [];
}

export async function createPayout(input: {
  affiliate_id: string;
  amount_clp: number;
  period_from: string;
  period_to: string;
  note?: string | null;
}) {
  if (!isSupabaseConfigured()) return memoryCreatePayout(input);

  const { data, error } = await getSupabaseAdmin()
    .from("affiliate_payouts")
    .insert({
      affiliate_id: input.affiliate_id,
      amount_clp: Math.round(input.amount_clp),
      period_from: input.period_from.slice(0, 10),
      period_to: input.period_to.slice(0, 10),
      note: input.note?.trim() || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DbAffiliatePayout;
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

  if (!isSupabaseConfigured()) {
    return memoryUpsertAffiliate({
      ...input,
      password_hash: password_hash !== undefined ? password_hash : undefined,
    });
  }

  const sb = getSupabaseAdmin();
  const code = input.code.toUpperCase().trim();
  const payload: Record<string, unknown> = {
    code,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    commission_type: input.commission_type ?? "percent",
    commission_value: input.commission_value ?? 10,
    active: input.active ?? true,
    notes: input.notes ?? null,
    updated_at: new Date().toISOString(),
  };
  if (password_hash !== undefined) {
    payload.password_hash = password_hash;
  }

  const { data, error } = await sb
    .from("affiliates")
    .upsert(payload, { onConflict: "code" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const a = data as DbAffiliate;
  return { ...a, password_hash: a.password_hash ?? null };
}

export async function markOrderFailed(orderId: string) {
  if (!isSupabaseConfigured()) return memoryMarkFailed(orderId);
  const { data } = await getSupabaseAdmin()
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  return data as DbOrder | null;
}

export async function getOrderByPaymentExternal(externalId: string) {
  if (!isSupabaseConfigured()) return memoryGetOrderByPayment(externalId);
  const { data } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("payment_external_id", externalId)
    .maybeSingle();
  return (data as DbOrder | null) ?? null;
}

export async function markConfirmationEmailSent(orderId: string) {
  if (!isSupabaseConfigured()) {
    return memoryMarkConfirmationEmailSent(orderId);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DbOrder | null) ?? null;
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
  if (!isSupabaseConfigured()) {
    return {
      ordersCount: memoryListOrders().filter((o) => o.raffle_id === raffleId)
        .length,
      ticketsCount: memoryListTickets().filter((t) => t.raffle_id === raffleId)
        .length,
    };
  }
  const [orders, tickets] = await Promise.all([
    getSupabaseAdmin()
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", raffleId),
    getSupabaseAdmin()
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("raffle_id", raffleId),
  ]);
  return {
    ordersCount: orders.count ?? 0,
    ticketsCount: tickets.count ?? 0,
  };
}

export { RAFFLE, RAFFLE_UUID };
