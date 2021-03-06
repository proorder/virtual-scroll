const path = require('path')

module.exports = {
  resolve: {
    extensions: ['.js', '.json', '.vue', '.styl', '.ts'],
    root: path.resolve(__dirname),
    alias: {
      '~': path.resolve(__dirname),
    },
  },
}
