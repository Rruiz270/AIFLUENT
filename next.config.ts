import type { NextConfig } from "next";
import path from "path";

// Headers de segurança aplicados a todas as respostas (hardening de produção).
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // microphone=(self) libera a gravação de áudio na própria origem (Inbox).
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Garante que o binário do ffmpeg-static seja empacotado na função de mídia
  // (usado para transcodificar áudio webm → ogg/opus antes de enviar ao WhatsApp).
  outputFileTracingIncludes: {
    "/api/conversations/[id]/media": [
      "./node_modules/ffmpeg-static/**",
      "node_modules/ffmpeg-static/ffmpeg",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
