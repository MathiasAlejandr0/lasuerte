import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin/auth";
import { getOrderDetail } from "@/lib/db/orders";
import { getPackById } from "@/lib/catalog/store";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const detail = await getOrderDetail(id);
    if (!detail) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    const items = detail.items.map((item) => ({
      ...item,
      pack_name: getPackById(item.pack_id)?.name || item.pack_id,
    }));

    return NextResponse.json({
      order: detail.order,
      items,
      tickets: detail.tickets,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
