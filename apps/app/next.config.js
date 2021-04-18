/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const withSvgr = require('next-plugin-svgr')
const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')([ '@vramework/example-*', 'react-select-search'])
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withPlugins(
  [
    withTM({
      webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            webapp: path.resolve(__dirname, '../../packages/dom/styles/'),
        };
        return config
      },
    }),
    withSvgr,
    withBundleAnalyzer,
  ],
  {
    typescript: {
      // This is needed because, well, nextjs forces incompatible import
      // syntax.
      ignoreBuildErrors: true,
    },
    images: {
      domains: ['localhost', 'app.vlandor.com'],
    },
    i18n: {
      locales: ['en', 'de'],
      defaultLocale: 'en'
    }
  },
)
