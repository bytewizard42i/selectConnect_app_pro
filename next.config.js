/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['qrcode.react'],
  experimental: {
    esmExternals: 'loose',
  },
  compiler: {
    // Enable SWC transforms
    styledComponents: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle ES modules properly
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };
    
    // Fix for crypto and other Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }

    // Handle .mjs files
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  // Cross-origin configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
  // Allow dev origins
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
