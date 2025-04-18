/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ THIS IGNORES ESLINT ERRORS ON VERCEL
  },
})
