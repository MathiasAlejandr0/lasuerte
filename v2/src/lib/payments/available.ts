import { paymentsMockEnabled } from "@/lib/db/orders";

export type PublicPaymentOptions = {
  flow: boolean;
  mock: boolean;
  defaultProvider: "flow" | "mock";
};

export function getPublicPaymentOptions(): PublicPaymentOptions {
  const mock = paymentsMockEnabled();
  const flow = Boolean(
    process.env.FLOW_API_KEY && process.env.FLOW_SECRET_KEY,
  );

  let defaultProvider: PublicPaymentOptions["defaultProvider"] = "mock";
  if (flow) defaultProvider = "flow";
  else if (mock) defaultProvider = "mock";

  return { flow, mock, defaultProvider };
}
