var path = require('path');
var webpack = require('webpack');
var node_modules = path.resolve(__dirname, 'node_modules');
var globule = require("globule");


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
        modulesDirectories: [node_modules],
        extensions: ['', '.js', '.jsx', '.ts', '.tsx'] //We may need to add .less here... otherwise maybe it will ignore them unless they are require()'d
    },
    module: {
        loaders: [
           { test: /\.ts(x?)$/, loader: 'ts-loader' },
           {test: /\.less$/, loaders: ['style', 'css', 'less'] }
        ],
    }
};
