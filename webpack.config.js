const path = require("path");
const webpack = require("webpack"); //to access built-in plugins

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.ts$/, use: "ts-loader" },
      {
        test: require.resolve("./src/model-loader.ts"),
        use: [
          {
            loader: "val-loader"
          }
        ]
      }
    ]
  }
};
