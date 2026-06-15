import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  ...(process.env.NODE_ENV === "development" && {

    allowedDevOrigins: [
      "192.168.40.189",
      "10.90.68.30",
    ],

  }),

  env: {

    NEXT_PUBLIC_BUILD_DATE:
      new Date().toISOString(),

  },

};

export default nextConfig;