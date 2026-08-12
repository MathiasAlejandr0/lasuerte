import type { NextConfig } from "next";

// React solo usa eval() en desarrollo (debug de errores). En producción no.
const isDev = process.env.NODE_ENV === "development";
/** Demo estática en GitHub Pages (sin Node/server). */
const isGhPages = process.env.GITHUB_PAGES === "1";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "lasuerte";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://webpay3gint.transbank.cl https://webpay3g.transbank.cl",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.twitch.tv https://www.twitch.tv",
      "child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.twitch.tv",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl https://www.mercadopago.cl https://www.mercadopago.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  ...(isGhPages
    ? {
        output: "export" as const,
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(!isGhPages
    ? {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
