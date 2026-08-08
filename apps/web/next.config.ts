import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@benzo/shared", "@benzo/types", "@benzo/ui"]
};

export default nextConfig;

