const path = require("path");
const webpack = require("webpack");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const bundlePath = path.resolve(__dirname, "dist/");

module.exports = (_env, argv) => {
  let entryPoints = {
    VideoOverlay: {
      path: "./src/VideoOverlay.tsx",
      outputHtml: "video_overlay.html",
      build: true,
    },
    Config: {
      path: "./src/Config.tsx",
      outputHtml: "config.html",
      build: true,
    },
    LiveConfig: {
      path: "./src/LiveConfig.tsx",
      outputHtml: "live_config.html",
      build: true,
    },
  };

  let entry = {};

  // edit webpack plugins here!
  let plugins = [
    new CleanWebpackPlugin(["dist"]),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development", // defaults to development
      API_URL:
        argv && argv.mode === "development"
          ? "http://localhost:5000"
          : "https://dbdinfo.sholtrop.dev",
    }),
  ];
  if (argv && argv.mode === "development")
    plugins.push(new webpack.HotModuleReplacementPlugin());

  for (name in entryPoints) {
    if (entryPoints[name].build) {
      entry[name] = entryPoints[name].path;
      plugins.push(
        new HtmlWebpackPlugin({
          inject: true,
          chunks: [name],
          template: "./template.html",
          filename: entryPoints[name].outputHtml,
          title: "Dead by Daylight Live Info extension",
        })
      );
    }
  }

  let config = {
    entry,
    optimization: {
      minimize: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              {
                targets: "ie 11, chrome 58, > 0.25%, not dead",
              },
            ],
          },
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [require("tailwindcss"), require("postcss-nested")],
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader: "file-loader",
          options: {
            name: "img/[name].[ext]",
          },
        },
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
      ],
    },
    resolve: { extensions: ["*", ".js", ".jsx", ".ts", ".tsx"] },
    devtool: false,
    output: {
      filename: "[name].bundle.js",
      path: bundlePath,
    },
    plugins,
  };

  if (!argv || argv.mode === "development" || process.env.NODE_ENV === "test") {
    config.devServer = {
      contentBase: path.join(__dirname, "public"),
      host:
        argv && argv.devrig
          ? "localhost.rig.twitch.tv"
          : process.env.NODE_ENV !== "test"
          ? "localhost"
          : "0.0.0.0",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      port: 8080,
      disableHostCheck: true,
      https: true,
    };
    config.devtool = "source-map";
  } else if (argv.mode === "production") {
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          chunks: "all",
          test: /node_modules/,
          name: false,
        },
      },
      name: false,
    };
    config.devtool = false;
  }
  return config;
};
