const path = require('path');
const fs = require('fs-extra');

fs.copySync('./src/js/main/index.html', './dist/index.html');
fs.copySync('./src/js/video/video.html', './dist/video.html');

module.exports = {
  entry: {
    main: './src/js/main/app.js',
    video: './src/js/video/app.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },{
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },{
         test: /\.(woff|woff2|eot|ttf|otf)$/,
         use: [
           'file-loader'
         ]
      }
    ]
  }
};