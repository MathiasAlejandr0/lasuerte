import { Resend } from "resend";
import type { DbOrder, DbTicket } from "@/lib/db/types";
import { getPackById, getRaffle } from "@/lib/catalog/store";
import { escapeHtml } from "@/lib/security/html";
import { ticketDisplayCode } from "@/lib/tickets/codes";

export async function sendOrderConfirmation(
  order: DbOrder,
  tickets: DbTicket[],
  packIds: string[],
) {
  const raffleCode = getRaffle().code;
  const codes = tickets.map((t) => ticketDisplayCode(t, raffleCode)).join(", ");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const packs = packIds
    .map((id) => getPackById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const illustrationsHtml = packs.length
    ? packs
        .map((p) => {
          const src = `${siteUrl}${p.image}`;
          return `<div style="margin:12px 0">
            <p style="margin:0 0 8px;font-weight:bold;color:#fff5d4">${escapeHtml(p.name)}</p>
            <a href="${escapeHtml(src)}" style="color:#36f073">Ver / descargar ilustración</a>
            <div style="margin-top:8px">
              <img src="${escapeHtml(src)}" alt="${escapeHtml(p.name)}" width="280" style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.15)" />
            </div>
          </div>`;
        })
        .join("")
    : `<p style="color:#d8c28a">Tus ilustraciones quedan asociadas a este pedido. Si no las ves aquí, escríbenos con tu correo de compra.</p>`;

  const codesHtml = tickets.length
    ? `<ul style="padding-left:18px;margin:12px 0;font-size:18px;color:#f7c64b;font-weight:bold">
        ${tickets
          .map(
            (t) =>
              `<li style="margin:6px 0">${escapeHtml(ticketDisplayCode(t, raffleCode))}</li>`,
          )
          .join("")}
      </ul>`
    : `<p style="font-size:20px;color:#f7c64b;font-weight:bold">—</p>`;

  const safeName = escapeHtml(order.full_name);
  const safeEmail = escapeHtml(order.email);
  const safeOrderId = escapeHtml(order.id);
  const safeRaffleCode = escapeHtml(raffleCode);
  const site = escapeHtml(siteUrl);

  const html = `
    <div style="font-family:sans-serif;background:#05140a;color:#fff5d4;padding:24px">
      <h1 style="color:#36f073">¡Gracias por tu compra, ${safeName}!</h1>
      <p>Tu pago fue confirmado. Aquí tienes tus <strong>ilustraciones digitales</strong> y tus <strong>tickets de participación</strong> de la campaña <strong>${safeRaffleCode}</strong>.</p>
      <p style="color:#d8c28a;font-size:13px">Cada ticket se forma con el código de campaña más 5 dígitos aleatorios. Guárdalos: con ellos participas en la premiación.</p>
      <h2 style="color:#36f073;font-size:18px;margin-top:24px">Tus tickets</h2>
      ${codesHtml}
      <p>Puedes consultarlos cuando quieras en
        <a href="${site}/check-tickets" style="color:#36f073">Consultar tickets</a>
        ingresando tu correo (<strong>${safeEmail}</strong>).
      </p>
      <h2 style="color:#36f073;font-size:18px;margin-top:28px">Tus ilustraciones digitales</h2>
      ${illustrationsHtml}
      <p style="font-size:12px;color:#d8c28a;margin-top:24px">Pedido ${safeOrderId}</p>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.info("[email:mock]", {
      to: order.email,
      codes,
      packs: packs.map((p) => p.id),
    });
    return { mocked: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Suertu2s <noreply@suertu2s.cl>",
    to: order.email,
    subject: "Tus ilustraciones y códigos de sorteo Suertu2s",
    html,
  });
  return { mocked: false };
}
