import { afterEach, describe, expect, it } from "vitest";
import { updateRaffle } from "@/lib/catalog/store";
import { assertRaffleAcceptsOrders, raffleAcceptsOrders } from "./orders-guard";

describe("orders-guard", () => {
  afterEach(() => {
    updateRaffle({ raffleStatus: "open" });
  });

  it("permite compras con sorteo abierto", () => {
    updateRaffle({ raffleStatus: "open" });
    expect(raffleAcceptsOrders()).toBe(true);
    expect(() => assertRaffleAcceptsOrders()).not.toThrow();
  });

  it("bloquea compras con sorteo cerrado", () => {
    updateRaffle({ raffleStatus: "closed" });
    expect(raffleAcceptsOrders()).toBe(false);
    expect(() => assertRaffleAcceptsOrders()).toThrow(/cerrado/i);
  });
});
