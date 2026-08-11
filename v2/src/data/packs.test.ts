import { describe, expect, it } from "vitest";
import { formatClp, getPackById, PACKS } from "./packs";

describe("packs", () => {
  it("tiene 3 packs con precios positivos", () => {
    expect(PACKS).toHaveLength(3);
    for (const pack of PACKS) {
      expect(pack.priceClp).toBeGreaterThan(0);
      expect(pack.ticketCount).toBeGreaterThan(0);
    }
  });

  it("resuelve pack por id", () => {
    expect(getPackById("pack-chiloe")?.name).toMatch(/Chiloé/i);
    expect(getPackById("no-existe")).toBeUndefined();
  });

  it("formatea CLP", () => {
    expect(formatClp(5000)).toContain("5");
    expect(formatClp(5000)).toMatch(/\$|CLP|5\.000|5000/);
  });
});
