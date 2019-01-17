const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: __dirname + '/src/app.js',
  output: {
    path: __dirname + '/dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.post\.css$/,
        loader: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader: 'postcss-loader', options: require('./postcss.config') },
        ],
      },
      {
        test: /\.(woff|woff2|eot|otf|ttf|txt|gif|jpg|png)$/,
        loader: 'file-loader',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
}
