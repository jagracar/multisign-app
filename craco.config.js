const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          process: require.resolve("process/browser"),
          buffer: require.resolve("buffer/"),
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ],
    },
  },
};
