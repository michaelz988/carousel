module.exports = {
  lintOnSave: false,
  configureWebpack: {
    devtool: 'source-map'
  },
  devServer: {
    port: 8081,
    headers: {
    'Cross-Origin-Opener-Policy': 'unsafe-none'
  }
  }
}