import { describe, expect, it } from "vitest";
import {
  formatTicketCode,
  isValidRaffleCode,
  isValidTicketCodeForRaffle,
  normalizeRaffleCode,
  parseTicketCode,
} from "./codes";

describe("ticket codes", () => {
  it("normaliza el código del sorteo", () => {
    expect(normalizeRaffleCode(" s2s-26 ")).toBe("S2S26");
    expect(isValidRaffleCode("S2S26")).toBe(true);
    expect(isValidRaffleCode("A")).toBe(false);
  });

  it("compone código de participación con 5 dígitos", () => {
    expect(formatTicketCode("S2S26", 7)).toBe("S2S2600007");
    expect(formatTicketCode("S2S26", 48291)).toBe("S2S2648291");
  });

  it("parsea el código completo", () => {
    expect(parseTicketCode("S2S2648291")).toEqual({
      raffleCode: "S2S26",
      suffix: 48291,
    });
    expect(isValidTicketCodeForRaffle("S2S2648291", "S2S26")).toBe(true);
    expect(isValidTicketCodeForRaffle("OTRO048291", "S2S26")).toBe(false);
  });
});
