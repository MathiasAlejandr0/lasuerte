"use client";

import { useEffect, useState } from "react";
import { toLiveEmbedUrl } from "@/lib/live/embed";

export function LiveStreamPlayer({ url }: { url: string }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = window.location.hostname || "localhost";
    setEmbedUrl(toLiveEmbedUrl(url, { host }));
    setReady(true);
  }, [url]);

  if (!url.trim()) {
    return (
      <div className="w-full aspect-video rounded-2xl border border-brand-gold/30 bg-brand-bgLight/90 flex items-center justify-center p-6 text-center">
        <p className="text-brand-cream text-sm sm:text-base m-0 max-w-md">
          El evento ya comenzó. La transmisión en vivo se mostrará aquí cuando
          se configure el enlace.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full aspect-video rounded-2xl border border-brand-gold/30 bg-brand-bgLight/90 animate-pulse" />
    );
  }

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video rounded-2xl border border-brand-gold/30 bg-brand-bgLight/90 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-brand-cream text-sm m-0">
          No se pudo cargar el reproductor con este enlace.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-greenBright font-bold text-sm underline"
        >
          Abrir transmisión en otra pestaña
        </a>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border-2 border-brand-gold/40 overflow-hidden bg-black shadow-2xl">
      <div className="px-3 py-2 bg-brand-bgLight/95 border-b border-brand-gold/20">
        <span className="text-xs text-brand-gold uppercase tracking-wider font-bold">
          En vivo · Transmisión oficial
        </span>
      </div>
      <div className="relative w-full aspect-video">
        <iframe
          src={embedUrl}
          title="Transmisión en vivo del sorteo"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
