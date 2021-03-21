const path = require('path');
const webpack = require('webpack');
const HtmlWebPlugin = require('html-webpack-plugin');
const fileName = 'bundle.js';

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
}

module.exports = {
  mode: 'development',

  devtool: 'inline-source-map',

  entry: {
    app: [path.join(__dirname, './src/App.jsx')]
  },

  output: {
    path: PATHS.dist,
    filename: fileName,
    publicPath: '/'
  },

  watch: true,
  watchOptions: {
    ignored: '/node_modules/',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            sourceMap: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: []
          }
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.csss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader'
          },
        ],
      }
    ]
  },

  devServer: {
    contentBase: PATHS.dist,

    compress: false,

    historyApiFallback: true,

    hot: true,

    port: 3000
  },

  plugins: [
    new HtmlWebPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    })
  ]

}