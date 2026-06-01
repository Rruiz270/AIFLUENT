import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET || 'k9$mP2xR7vL4nQ8wJ5tY1zA3bF6cH0dG',
    AUTH_TRUST_HOST: 'true',
  },
};

export default nextConfig;
