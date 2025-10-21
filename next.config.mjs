const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_SUPABASE_URL || '']
    }
  },
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
