import { afterEach, describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./session";
import { verifyAdminSessionTokenEdge } from "./session-edge";

describe("admin session", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("firma y verifica token válido", () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_PASSWORD = "pass";
    process.env.ADMIN_EMAILS = "admin@suertu2s.cl";

    const token = createAdminSessionToken("admin@suertu2s.cl");
    const session = verifyAdminSessionToken(token);
    expect(session?.email).toBe("admin@suertu2s.cl");
  });

  it("verifica igual en Edge (Web Crypto)", async () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_EMAILS = "admin@suertu2s.cl";

    const token = createAdminSessionToken("admin@suertu2s.cl");
    const session = await verifyAdminSessionTokenEdge(token, "test-secret");
    expect(session?.email).toBe("admin@suertu2s.cl");
  });

  it("rechaza token alterado", () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_EMAILS = "admin@suertu2s.cl";

    const token = createAdminSessionToken("admin@suertu2s.cl");
    expect(verifyAdminSessionToken(token + "x")).toBeNull();
  });

  it("rechaza email no autorizado", () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_EMAILS = "admin@suertu2s.cl";

    const token = createAdminSessionToken("otro@suertu2s.cl");
    expect(verifyAdminSessionToken(token)).toBeNull();
  });
});
