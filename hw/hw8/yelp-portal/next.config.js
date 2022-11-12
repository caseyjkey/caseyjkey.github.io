/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
	    {
		source: '/',
		destination: '/search',
		permanent: true,
	    },
    ]
  },
  distDir: 'build'
}

module.exports = nextConfig
