module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require features/**/*.ts",
    "--publish-quiet",
  ].join(" "),
};
