/* eslint-disable */

const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

const redashBackend = process.env.REDASH_BACKEND || "http://localhost:5000";

const basePath = fs.realpathSync(path.join(__dirname, "client"));
const appPath = fs.realpathSync(path.join(__dirname, "client", "app"));

const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 主题路径
const THEME_PATH = './client/app/assets/less/themes';
const resolveToThemeStaticPath = fileName => path.resolve(THEME_PATH, fileName);
const themeFileNameSet = fs.readdirSync(path.resolve(THEME_PATH));
const themePaths = themeFileNameSet.map(resolveToThemeStaticPath);
const getThemeName = fileName => `theme-${path.basename(fileName, path.extname(fileName))}`;

// 全部 ExtractLessS 的集合
const themesExtractLessSet = themeFileNameSet.map(fileName => new ExtractTextPlugin(`${getThemeName(fileName)}.css`))
// 主题 Loader 的集合
const themeLoaderSet = themeFileNameSet.map((fileName, index) => {
  return {
    test: /\.(less|css)$/,
    include: resolveToThemeStaticPath(fileName),
    loader: themesExtractLessSet[index].extract({
      use: [
        {
          loader: 'css-loader',
        },
        {
          loader: 'less-loader',
        },
      ]
    })
  }
});

const config = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: [
      "./client/app/index.js",
      "./client/app/assets/less/main.less",
      "./client/app/assets/less/ant.less"
    ],
    server: ["./client/app/assets/less/server.less"],
    themes: [
      "./client/app/assets/less/themes/green.less",
      "./client/app/assets/less/themes/dark.less",
      "./client/app/assets/less/themes/red.less"
    ]
  },
  output: {
    path: path.join(basePath, "./dist"),
    filename: isProduction ? "[name].[chunkhash].js" : "[name].js",
    publicPath: "/static/"
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      "@": appPath
    }
  },
  plugins: [
    new WebpackBuildNotifierPlugin({ title: "Redash" }),
    // Enforce angular to use jQuery instead of jqLite
    new webpack.ProvidePlugin({ "window.jQuery": "jquery" }),
    // bundle only default `moment` locale (`en`)
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new HtmlWebpackPlugin({
      template: "./client/app/index.html",
      filename: "index.html",
      excludeChunks: ["server", "themes"]
    }),
    new HtmlWebpackPlugin({
      template: "./client/app/multi_org.html",
      filename: "multi_org.html",
      excludeChunks: ["server", "themes"]
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css"
    }),
    ...themesExtractLessSet,
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: "",
    }),
    new CopyWebpackPlugin([
      { from: "client/app/assets/robots.txt" },
      { from: "client/app/assets/css/*.css", to: "styles/", flatten: true },
      { from: "node_modules/jquery/dist/jquery.min.js", to: "js/jquery.min.js" }
    ])
  ],
  optimization: {
    splitChunks: {
      chunks: (chunk) => {
        return chunk.name != "server";
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/, /index\.html/],
        use: [
          {
            loader: "raw-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: themePaths,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              minimize: process.env.NODE_ENV === "production"
            }
          }
        ]
      },
      {
        test: /\.less$/,
        exclude: themePaths,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              minimize: process.env.NODE_ENV === "production"
            }
          },
          {
            loader: "less-loader",
            options: {
              plugins: [
                new LessPluginAutoPrefix({ browsers: ["last 3 versions"] })
              ]
            }
          }
        ]
      },
      ...themeLoaderSet,
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              context: path.resolve(appPath, "./assets/images/"),
              outputPath: "images/",
              name: "[path][name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.geo\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "data/",
              name: "[hash:7].[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "fonts/[name].[hash:7].[ext]"
            }
          }
        ]
      }
    ]
  },
  devtool: isProduction ? "source-map" : "cheap-eval-module-source-map",
  stats: {
    modules: false,
    chunkModules: false
  },
  watchOptions: {
    ignored: /\.sw.$/
  },
  devServer: {
    inline: true,
    index: "/static/index.html",
    historyApiFallback: {
      index: "/static/index.html",
      rewrites: [{ from: /./, to: "/static/index.html" }]
    },
    contentBase: false,
    publicPath: "/static/",
    proxy: [
      {
        context: [
          "/login",
          "/logout",
          "/invite",
          "/setup",
          "/status.json",
          "/api",
          "/oauth"
        ],
        target: redashBackend + "/",
        changeOrigin: false,
        secure: false
      },
      {
        context: path => {
          // CSS/JS for server-rendered pages should be served from backend
          return /^\/static\/[a-z]+\.[0-9a-fA-F]+\.(css|js)$/.test(path);
        },
        target: redashBackend + "/",
        changeOrigin: true,
        secure: false
      }
    ],
    stats: {
      modules: false,
      chunkModules: false
    }
  }
};

if (process.env.DEV_SERVER_HOST) {
  config.devServer.host = process.env.DEV_SERVER_HOST;
}

if (process.env.BUNDLE_ANALYZER) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
