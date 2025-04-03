const path = require("path");
const webpack = require("webpack");
// import path from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: "./src/main.jsx", // Your app entry point
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // Clean the output directory before building
  },
  mode: "development", // Use 'production' for production builds
  devServer: {
    static: "./dist",
    hot: true,
    liveReload: false,
    open: true,
    port: 3000, // Port for your development server
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], // Allow importing .js and .jsx files without specifying the extension
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      zlib: require.resolve("browserify-zlib"),
      url: require.resolve("url"),
      vm: require.resolve("vm-browserify"),
      process: require.resolve("process"),
      buffer: require.resolve("buffer"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Your index.html file
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new Dotenv({
      path: './.env', // Path to your .env file
      safe: true,     // Optionally checks .env.example for required variables
    }),
  ],
  devServer: {
    static: "./public",
    historyApiFallback: true, // This enables reloading for routes
    port: 3000,
    hot: true,
  },
};
