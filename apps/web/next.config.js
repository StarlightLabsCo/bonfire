const million = require('million/compiler');
const { withAxiom } = require('next-axiom');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['websocket'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: process.env.NEXT_PUBLIC_IMAGES_HOSTNAME },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_OPENAI_DALLE3_HOSTNAME,
        pathname: process.env.NEXT_PUBLIC_OPENAI_DALLE3_PATHNAME,
      },
    ],
  },
};

module.exports = withAxiom(
  withSentryConfig(
    million.next(nextConfig, { auto: { rsc: true } }),
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,
      org: 'starlightlabs',
      project: 'bonfire-web',
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    },
  ),
);
