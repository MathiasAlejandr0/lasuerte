import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyMercadoPagoWebhook } from "./mercadopago-webhook";

describe("verifyMercadoPagoWebhook", () => {
  it("acepta firma válida", () => {
    const secret = "whsec";
    const dataId = "123";
    const requestId = "req-1";
    const ts = "1700000000";
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const v1 = createHmac("sha256", secret).update(manifest).digest("hex");

    expect(
      verifyMercadoPagoWebhook({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(true);
  });

  it("rechaza firma inválida", () => {
    expect(
      verifyMercadoPagoWebhook({
        xSignature: "ts=1,v1=deadbeef",
        xRequestId: "req-1",
        dataId: "123",
        secret: "whsec",
      }),
    ).toBe(false);
  });
});
