import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local-network / link-local IP that browsers use when opening
  // the dev server from outside VS Code's built-in preview.
  allowedDevOrigins: ["169.254.83.107"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1.awsstatic.com",
        port: "",
        pathname: "/training-and-certification/certification-badges/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
