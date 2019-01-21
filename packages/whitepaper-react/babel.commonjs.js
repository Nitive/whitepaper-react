module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '4' } }],
    '@babel/preset-react',
  ],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
}
