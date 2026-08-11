import {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Environment,
} from "transbank-sdk";

function getOptions() {
  const env = process.env.WEBPAY_ENV || "integration";
  if (env === "production") {
    return new Options(
      process.env.WEBPAY_COMMERCE_CODE!,
      process.env.WEBPAY_API_KEY!,
      Environment.Production,
    );
  }
  return new Options(
    process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY,
    Environment.Integration,
  );
}

export async function createWebpayTransaction(params: {
  orderId: string;
  amount: number;
  sessionId: string;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const buyOrder = params.orderId.replace(/-/g, "").slice(0, 26);
  const tx = new WebpayPlus.Transaction(getOptions());
  const response = await tx.create(
    buyOrder,
    params.sessionId.slice(0, 61),
    params.amount,
    `${site}/api/payments/webpay/return?orderId=${params.orderId}`,
  );
  return {
    token: response.token,
    url: response.url,
    buyOrder,
  };
}

export async function commitWebpayTransaction(token: string) {
  const tx = new WebpayPlus.Transaction(getOptions());
  return tx.commit(token);
}
