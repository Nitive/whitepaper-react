module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { browsers: '> 0.5%, last 2 versions, Firefox ESR, not dead' },
        modules: false
      }
    ],
    '@babel/preset-react',
  ],
}
