const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const mode = process.env.NODE_ENV || 'development'

module.exports = {
  mode,
  entry: __dirname + '/src/app.js',
  output: {
    path: __dirname + '/dist',
  },
  devtool: false,
  devServer: {
    contentBase: __dirname + '/dist',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      {
        test: /\.post\.css$/,
        loader: [
          { production: MiniCssExtractPlugin.loader, development: 'style-loader' }[mode],
          { loader: 'css-loader', options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.(woff|woff2|eot|otf|ttf|txt|gif|jpg|png|svg)$/,
        loader: 'file-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'whitepaper',
          test: /packages\/whitepaper-react/,
          enforce: true,
        },
      },
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    mode === 'development' && new HotModuleReplacementPlugin(),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode)
    }),
    mode === 'production' && new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    new MiniCssExtractPlugin({ filename: '[contenthash].css' })
  ].filter(Boolean),
}
