var path = require('path');

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    entry: './src/app.ts',

    output: {
        path: path.join(__dirname, "./output"),
        filename: "bloomPlayer.js"
    },

    resolve: {
        root: ['.'],
        modulesDirectories: [path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js', '.ts', '.tsx']
    },

    module: {
        preLoaders: [ { test: /\.ts$/, loader: "tslint" } ],
        loaders: [
           { test: /\.ts(x?)$/, loader: 'ts-loader' },
           { test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader'] },
           //{ test: /\.(svg|png)$/, loader: 'file',  include: path.join(__dirname, "./assets")}
            { test: /\.(svg|png)$/, loader: 'url-loader',  include: path.join(__dirname, "./assets")}
        ],
    }
};
