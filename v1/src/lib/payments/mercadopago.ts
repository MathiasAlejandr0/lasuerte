import { MercadoPagoConfig, Preference } from "mercadopago";

export async function createMercadoPagoPreference(params: {
  orderId: string;
  title: string;
  amount: number;
  email: string;
}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta configurar MERCADOPAGO_ACCESS_TOKEN");

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      external_reference: params.orderId,
      payer: { email: params.email },
      items: [
        {
          id: params.orderId,
          title: params.title,
          quantity: 1,
          unit_price: params.amount,
          currency_id: "CLP",
        },
      ],
      back_urls: {
        success: `${site}/pago/exito?orderId=${params.orderId}`,
        failure: `${site}/pago/error?orderId=${params.orderId}`,
        pending: `${site}/pago/exito?orderId=${params.orderId}&pending=1`,
      },
      auto_return: "approved",
      notification_url: `${site}/api/payments/mercadopago/webhook`,
    },
  });

  return {
    id: result.id!,
    initPoint: result.init_point || result.sandbox_init_point || "",
  };
}
