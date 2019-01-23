const postcss =  require('postcss');

const removeAllExceptPrecssVars = postcss.plugin(
  "postcss-remove-all-except-precss-vars",
  () => {
    return root => {
      root.walk(node => {
        if (node.type !== "decl" || node.prop[0] !== "$") {
          node.remove();
        }
      });
    };
  },
);

module.exports = {
  plugins: [
    require('postcss-import')({
      plugins: [removeAllExceptPrecssVars],
    }),
    require('precss'),
    require('postcss-preset-env')({
      autoprefixer: {
        browsers: [
          'last 2 version',
          '> 1%',
          'not dead',
          'IE 11',
        ],
      },
    }),
  ],
}
