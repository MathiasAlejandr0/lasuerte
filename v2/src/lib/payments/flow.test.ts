import { describe, expect, it } from "vitest";
import { signFlowParams } from "./flow";

describe("Flow Payment Signature", () => {
  it("generates deterministic HMAC-SHA256 signature sorted alphabetically", () => {
    const params = {
      apiKey: "test-api-key",
      commerceOrder: "ORDER-123",
      amount: 5000,
      currency: "CLP",
    };
    const secret = "test-secret-key";
    const sig1 = signFlowParams(params, secret);
    const sig2 = signFlowParams(
      {
        currency: "CLP",
        amount: 5000,
        apiKey: "test-api-key",
        commerceOrder: "ORDER-123",
      },
      secret,
    );

    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // SHA-256 hex string length
  });
});
