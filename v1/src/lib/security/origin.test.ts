import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isSameOriginRequest } from "./origin";

function req(headers: Record<string, string>) {
  return new NextRequest("http://localhost:3000/api/admin/orders", {
    method: "POST",
    headers,
  });
}

describe("isSameOriginRequest", () => {
  it("acepta Sec-Fetch-Site same-origin", () => {
    expect(
      isSameOriginRequest(
        req({ host: "localhost:3000", "sec-fetch-site": "same-origin" }),
      ),
    ).toBe(true);
  });

  it("acepta Origin coincidente", () => {
    expect(
      isSameOriginRequest(
        req({
          host: "suertu2s.cl",
          origin: "https://suertu2s.cl",
        }),
      ),
    ).toBe(true);
  });

  it("rechaza Origin distinto", () => {
    expect(
      isSameOriginRequest(
        req({
          host: "suertu2s.cl",
          origin: "https://evil.test",
        }),
      ),
    ).toBe(false);
  });

  it("rechaza sin señales de origen", () => {
    expect(isSameOriginRequest(req({ host: "suertu2s.cl" }))).toBe(false);
  });
});
