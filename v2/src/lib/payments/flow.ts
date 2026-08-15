import crypto from "crypto";

export function getFlowConfig() {
  const apiKey = process.env.FLOW_API_KEY?.trim() || "";
  const secretKey = process.env.FLOW_SECRET_KEY?.trim() || "";
  const env = process.env.FLOW_ENV === "production" ? "production" : "sandbox";
  const baseUrl =
    env === "production"
      ? "https://www.flow.cl/api"
      : "https://sandbox.flow.cl/api";

  return {
    apiKey,
    secretKey,
    env,
    baseUrl,
    isConfigured: Boolean(apiKey && secretKey),
  };
}

/**
 * Firma los parámetros según la especificación HMAC-SHA256 de Flow.cl.
 * Ordena las llaves alfabéticamente y las concatena en formato query string.
 */
export function signFlowParams(
  params: Record<string, string | number>,
  secretKey: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

  return crypto.createHmac("sha256", secretKey).update(toSign).digest("hex");
}

export type FlowCreatePaymentInput = {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
};

export async function createFlowPayment(input: FlowCreatePaymentInput) {
  const config = getFlowConfig();
  if (!config.isConfigured) {
    throw new Error(
      "Flow no está configurado (falta FLOW_API_KEY o FLOW_SECRET_KEY)",
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const params: Record<string, string | number> = {
    apiKey: config.apiKey,
    commerceOrder: input.commerceOrder,
    subject: input.subject,
    currency: "CLP",
    amount: Math.round(input.amount),
    email: input.email.toLowerCase().trim(),
    urlConfirmation: `${site}/api/payments/flow/webhook`,
    urlReturn: `${site}/api/payments/flow/return`,
  };

  const signature = signFlowParams(params, config.secretKey);
  params.s = signature;

  const formBody = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    formBody.append(key, String(value));
  }

  const res = await fetch(`${config.baseUrl}/payment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.code || !data.url) {
    throw new Error(
      `Error al crear orden en Flow: ${data.message || data.code || res.statusText}`,
    );
  }

  return {
    redirectUrl: `${data.url}?token=${data.token}`,
    token: String(data.token),
    flowOrder: data.flowOrder as number | undefined,
  };
}

export type FlowStatusResponse = {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number; // 1: pendiente, 2: pagado, 3: rechazado, 4: anulado
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  paymentData?: {
    date: string;
    media: string;
    amount: number;
    fee: number;
    balance: number;
  };
};

export async function getFlowPaymentStatus(
  token: string,
): Promise<FlowStatusResponse> {
  const config = getFlowConfig();
  if (!config.isConfigured) {
    throw new Error("Flow no está configurado");
  }

  const params: Record<string, string | number> = {
    apiKey: config.apiKey,
    token: token.trim(),
  };

  const signature = signFlowParams(params, config.secretKey);
  params.s = signature;

  const queryStr = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    queryStr.append(key, String(value));
  }

  const res = await fetch(
    `${config.baseUrl}/payment/getStatus?${queryStr.toString()}`,
    {
      method: "GET",
    },
  );

  const data = await res.json();
  if (!res.ok || data.code) {
    throw new Error(
      `Error al consultar estado en Flow: ${data.message || data.code || res.statusText}`,
    );
  }

  return data as FlowStatusResponse;
}
