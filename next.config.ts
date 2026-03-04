import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/taskpane",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://appsforoffice.microsoft.com; style-src 'self' 'unsafe-inline'; frame-ancestors https://*.office.com https://*.office365.com https://*.outlook.com https://*.microsoft.com;",
          },
        ],
      },
      {
        source: "/manifest.xml",
        headers: [
          { key: "Content-Type", value: "application/xml" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
