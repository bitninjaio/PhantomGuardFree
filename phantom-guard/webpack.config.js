const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    'phguard-admin': './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'js/[name].js',
    // Remove iife: true - this breaks Webpack runtime when minifiers re-wrap
    clean: true,
    // Add library to expose __webpack_require__ globally for minify compatibility
    library: {
      type: 'window',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer')
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    fullySpecified: false,
    mainFields: ['browser', 'module', 'main']
  },
  externals: {
    // React and ReactDOM are bundled since WordPress doesn't provide them globally
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,  // Minden kommentet töröl
          },
        },
        extractComments: false,  // Nem generál külön LICENSE.txt-et
      }),
    ],
  },
  target: 'web'
};