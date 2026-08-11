import { afterEach, describe, expect, it } from "vitest";
import { createMockConfirmToken, verifyMockConfirmToken } from "./mock-token";

describe("mock confirm token", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("firma y valida token para el mismo orderId", () => {
    process.env.MOCK_PAYMENT_SECRET = "mock-secret";
    const token = createMockConfirmToken("order-1");
    expect(verifyMockConfirmToken(token, "order-1")).toBe(true);
    expect(verifyMockConfirmToken(token, "order-2")).toBe(false);
    expect(verifyMockConfirmToken(token + "x", "order-1")).toBe(false);
  });
});
