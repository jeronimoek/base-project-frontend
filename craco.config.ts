import path from 'path'

module.exports = {
  webpack: {
    alias: {
      '@pages': path.resolve(__dirname, 'src/pages'),
    },
  },
}
