import { describe, expect, it } from "vitest";
import { toLiveEmbedUrl } from "./embed";

describe("Live Stream Embed Parser", () => {
  it("converts TikTok LIVE user link to embed player URL", () => {
    const url1 = toLiveEmbedUrl("https://www.tiktok.com/@suertu2s/live");
    expect(url1).toBe("https://www.tiktok.com/embed/v2/live/%40suertu2s");

    const url2 = toLiveEmbedUrl("https://tiktok.com/@suertu2s");
    expect(url2).toBe("https://www.tiktok.com/embed/v2/live/%40suertu2s");

    const url3 = toLiveEmbedUrl("https://www.tiktok.com/live/@suertu2s");
    expect(url3).toBe("https://www.tiktok.com/embed/v2/live/%40suertu2s");
  });

  it("converts YouTube links to nocookie embed URL", () => {
    const url = toLiveEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(url).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );
  });
});
