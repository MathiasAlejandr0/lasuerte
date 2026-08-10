import { paymentsMockEnabled } from "@/lib/db/orders";

export type PublicPaymentOptions = {
  mercadopago: boolean;
  webpay: boolean;
  mock: boolean;
  defaultProvider: "mercadopago" | "webpay" | "mock";
};

export function getPublicPaymentOptions(): PublicPaymentOptions {
  const mock = paymentsMockEnabled();
  const mercadopago = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
  const webpay = Boolean(process.env.WEBPAY_API_KEY);

  let defaultProvider: PublicPaymentOptions["defaultProvider"] = "mock";
  if (mercadopago) defaultProvider = "mercadopago";
  else if (webpay) defaultProvider = "webpay";
  else if (mock) defaultProvider = "mock";

  return { mercadopago, webpay, mock, defaultProvider };
}
