/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Permitir que arquivos de download sejam servidos
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
}

module.exports = nextConfig