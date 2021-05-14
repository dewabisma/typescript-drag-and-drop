import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

export default {
  mode: 'production',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.join(path.resolve(), '/dist'),
  },
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugin: [CleanWebpackPlugin],
};
