import { describe, expect, it, afterEach } from "vitest";
import { getAssetPath } from "./assets";

describe("getAssetPath", () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = originalEnv;
  });

  it("retorna string vacío si src es falsy", () => {
    expect(getAssetPath("")).toBe("");
  });

  it("mantiene URLs absolutas de HTTP/HTTPS intactas", () => {
    expect(getAssetPath("https://example.com/image.jpg")).toBe(
      "https://example.com/image.jpg",
    );
    expect(getAssetPath("http://demo.com/video.mp4")).toBe(
      "http://demo.com/video.mp4",
    );
  });

  it("mantiene data URLs intactas", () => {
    expect(getAssetPath("data:image/png;base64,1234")).toBe(
      "data:image/png;base64,1234",
    );
  });

  it("retorna ruta relativa estándar si NEXT_PUBLIC_BASE_PATH no está definido", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(getAssetPath("/suertu2s_moto_hero.jpg")).toBe(
      "/suertu2s_moto_hero.jpg",
    );
  });

  it("agrega el prefijo basePath cuando NEXT_PUBLIC_BASE_PATH está configurado", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/lasuerte";
    expect(getAssetPath("/suertu2s_moto_hero.jpg")).toBe(
      "/lasuerte/suertu2s_moto_hero.jpg",
    );
    expect(getAssetPath("moto_fondo_desenfocado.mp4")).toBe(
      "/lasuerte/moto_fondo_desenfocado.mp4",
    );
  });
});
