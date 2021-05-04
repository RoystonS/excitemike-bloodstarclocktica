const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');
const config = {
    entry: './src/bloodstar.ts',
    module: {
        rules:[{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader'
            ],
            exclude: /node_modules/
        },
        {
            test: /\.html$/i,
            type: "asset/resource",
            exclude: /node_modules/
        },
        {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            }],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({filename:'bloodstar.css',chunkFilename:'[id].css'}),
        new CopyPlugin({
            patterns: [{
                from: './src/index.html',
                to: path.resolve(__dirname, 'dist')
            }]
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        filename: 'bloodstar.js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization:{
        minimizer: [
            '...',
            new CssMinimizerPlugin(),
            new HtmlMinimizerPlugin()
        ]
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'eval-source-map';
    }

    return config;
};
