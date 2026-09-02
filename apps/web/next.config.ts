import type { NextConfig } from "next";

// Defense-in-depth headers — there's no known live XSS/clickjacking vector
// today, but these cost nothing and contain the blast radius if one is ever
// introduced. `frame-ancestors 'none'` + X-Frame-Options covers clickjacking;
// connect-src allows the browser-direct calls to apps/api (AD-3's client
// fetch path) alongside same-origin.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://res.cloudinary.com",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ""} https://api.cloudinary.com`,
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
