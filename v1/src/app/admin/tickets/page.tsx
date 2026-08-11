"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/AdminContext";
import {
  EmptyState,
  exportCsv,
  Field,
  formatDate,
  Panel,
  StatusBadge,
} from "@/components/admin/ui";
import { orderStatusLabel } from "@/lib/i18n/labels";

type TicketRow = {
  id: string;
  number: number;
  email: string;
  order_id: string;
  created_at: string;
  order_status: string | null;
  full_name: string | null;
  paid_at: string | null;
};

export default function AdminTicketsPage() {
  const { authed, adminFetch, readJson, setError, refreshKey, from, to } =
    useAdmin();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await adminFetch(
          `/api/admin/tickets?q=${encodeURIComponent(q)}`,
        );
        const json = await readJson<{ tickets: TicketRow[] }>(res, "Números");
        if (!cancelled) setTickets(json.tickets || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los números",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed, adminFetch, readJson, setError, refreshKey, from, to, q]);

  if (!authed) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-title text-2xl font-black text-white m-0">
            Números del sorteo
          </h2>
          <p className="text-sm text-brand-muted m-0 mt-1">
            {tickets.length} números emitidos en el período
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            exportCsv(`numeros_${from}_${to}.csv`, [
              ["numero", "correo", "nombre", "pedido_id", "estado", "fecha"],
              ...tickets.map((t) => [
                String(t.number),
                t.email,
                t.full_name || "",
                t.order_id,
                orderStatusLabel(t.order_status),
                t.paid_at || t.created_at,
              ]),
            ])
          }
          className="text-xs text-black bg-brand-gold font-bold px-3 py-2 rounded-lg border-none cursor-pointer"
        >
          Exportar CSV
        </button>
      </div>

      <div className="max-w-md">
        <Field
          label="Buscar número o correo"
          value={q}
          onChange={setQ}
          placeholder="ej. 42 o demo+1@"
        />
      </div>

      <Panel title="Inventario de números">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-brand-muted text-[11px] uppercase">
              <tr>
                <th className="px-3 py-2">Número</th>
                <th className="px-3 py-2">Participante</th>
                <th className="px-3 py-2">Pedido</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="px-3 py-2.5 text-brand-gold font-black text-base">
                    #{t.number}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-white font-semibold">
                      {t.full_name || "—"}
                    </div>
                    <div className="text-[11px] text-brand-muted">
                      {t.email}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href="/admin/orders"
                      className="text-brand-greenBright text-xs no-underline font-semibold"
                      title={t.order_id}
                    >
                      {t.order_id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    {t.order_status ? (
                      <StatusBadge status={t.order_status} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-brand-muted whitespace-nowrap">
                    {formatDate(t.paid_at || t.created_at)}
                  </td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState title="Sin números en el período" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
