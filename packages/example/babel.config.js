const prod = process.env.NODE_ENV === 'production'

module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [prod && 'babel-plugin-transform-react-remove-prop-types'].filter(Boolean),
}
