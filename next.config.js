/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000" }],
      },
    ];
  },
};

module.exports = nextConfig;