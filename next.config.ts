import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "cheerio", "node-vibrant"],
};

export default nextConfig;
