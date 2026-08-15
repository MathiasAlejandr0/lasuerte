/** Convierte un link de transmisión a URL usable en iframe. */

export function toLiveEmbedUrl(
  raw: string,
  opts?: { host?: string },
): string | null {
  const input = raw.trim();
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // TikTok
  if (
    host === "tiktok.com" ||
    host === "m.tiktok.com" ||
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com"
  ) {
    if (url.pathname.includes("/embed/")) {
      return url.toString();
    }

    const parts = url.pathname.split("/").filter(Boolean);

    // Formato: /@usuario/live o /@usuario
    if (parts[0] && parts[0].startsWith("@")) {
      const username = parts[0];
      return `https://www.tiktok.com/embed/v2/live/${encodeURIComponent(username)}`;
    }

    // Formato: /live/usuario o /live/@usuario
    if (parts[0] === "live" && parts[1]) {
      const username = parts[1].startsWith("@") ? parts[1] : `@${parts[1]}`;
      return `https://www.tiktok.com/embed/v2/live/${encodeURIComponent(username)}`;
    }

    // Formato video individual: /@usuario/video/1234567890
    if (parts[0] && parts[1] === "video" && parts[2]) {
      return `https://www.tiktok.com/embed/v2/${encodeURIComponent(parts[2])}`;
    }

    return url.toString();
  }

  // YouTube
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "youtu.be"
  ) {
    let id = "";
    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/")[2] || "";
    } else if (url.pathname.startsWith("/live/")) {
      id = url.pathname.split("/")[2] || "";
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/")[2] || "";
    } else {
      id = url.searchParams.get("v") || "";
    }
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  }

  // Twitch
  if (host === "twitch.tv" || host === "player.twitch.tv") {
    const parent = opts?.host || "localhost";
    if (host === "player.twitch.tv") {
      const channel = url.searchParams.get("channel");
      const video = url.searchParams.get("video");
      if (channel) {
        return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&autoplay=true`;
      }
      if (video) {
        return `https://player.twitch.tv/?video=${encodeURIComponent(video)}&parent=${encodeURIComponent(parent)}&autoplay=true`;
      }
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "videos" && parts[1]) {
      return `https://player.twitch.tv/?video=${encodeURIComponent(parts[1])}&parent=${encodeURIComponent(parent)}&autoplay=true`;
    }
    if (parts[0]) {
      return `https://player.twitch.tv/?channel=${encodeURIComponent(parts[0])}&parent=${encodeURIComponent(parent)}&autoplay=true`;
    }
    return null;
  }

  // Ya es un embed genérico
  if (url.pathname.includes("/embed")) {
    return url.toString();
  }

  // Otros enlaces: intentar iframe directo
  return url.toString();
}
