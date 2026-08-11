import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, parseDateRange } from "@/lib/admin/auth";
import { buildCustomers, filterOrdersByRange } from "@/lib/admin/analytics";
import { listOrders } from "@/lib/db/orders";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { from, to } = parseDateRange(req);
    const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase().trim();
    const all = await listOrders();
    // Clientes derivados de pedidos; se puede filtrar por activos en el rango
    const inRange = filterOrdersByRange(all, from, to);
    const emailsInRange = new Set(inRange.map((o) => o.email.toLowerCase()));
    let customers = buildCustomers(all).filter((c) =>
      emailsInRange.has(c.email),
    );

    if (q) {
      customers = customers.filter(
        (c) =>
          c.email.includes(q) ||
          c.full_name.toLowerCase().includes(q) ||
          c.rut.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }

    return NextResponse.json({ customers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar clientes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
