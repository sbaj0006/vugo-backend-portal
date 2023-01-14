const path = require('path');
const slsw = require('serverless-webpack');

const entries = {};

Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = ['./source-map-install.js', slsw.lib.entries[key]]),
);

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      '@lib': path.resolve(__dirname, 'lib/'), // eslint-disable-line
      '@interfaces': path.resolve(__dirname, 'interfaces/'), // eslint-disable-line
      '@helpers': path.resolve(__dirname, 'helpers/'), // eslint-disable-line
      '@dbTransactions': path.resolve(__dirname, 'dbTransactions/'), // eslint-disable-line
      '@': path.resolve(__dirname), // eslint-disable-line
    },
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  // Turn off minification: https://stackoverflow.com/questions/53524510/mysql2-typeerror-f-clienthandshake-is-not-a-constructor
  optimization: {
    minimize: false,
  },
  // Add externals to disable warnings in typeorm about requiring the following libraries if we are using those drivers
  externals: ['sqlite3', 'tedious', 'pg-hstore', 'redis', 'mongodb', 'mssql', 'pg-query-stream', 'pg-native', 'oracledb', 'mysql', 'sql.js', 'react-native-sqlite-storage'],
};
