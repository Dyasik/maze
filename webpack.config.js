module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          },
          {
            test:/\.less$/,
            exclude: /node_modules/,
            loader: 'style-loader!css-loader!less-loader'
          }
        ]
    },
    devtool: "source-map"
};