module.exports = {
  plugins: [
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-transform-shorthand-properties"
  ],
  presets: [
    ["@babel/preset-env", {targets: "maintained node versions"}]
  ],
  env: {
    test_coverage: {
      plugins: [
        ["istanbul", {exclude: ["test/**/*.js", "**/*_spec.js"]}]
      ]
    },
    browser: {
      presets: [
        ["@babel/preset-env", {
          targets: "last 2 versions",
          useBuiltIns: "entry",
          corejs: 3,
          shippedProposals: true
        }]
      ]
    }
  },
  sourceMaps: true
}
