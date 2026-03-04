import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/taskpane",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://appsforoffice.microsoft.com https://*.aspnetcdn.com https://*.msecnd.net",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://hexa-platform-demo.vercel.app https://*.office.com https://*.office365.com https://*.live.com",
              "img-src 'self' data: https:",
              "frame-ancestors https://*.office.com https://*.office365.com https://*.outlook.com https://*.outlook.live.com https://*.microsoft.com https://*.live.com https://*.officeapps.live.com",
            ].join("; ") + ";",
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
