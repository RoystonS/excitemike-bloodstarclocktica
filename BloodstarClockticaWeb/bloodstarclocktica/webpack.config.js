const HtmlWebpackPlugin = require('html-webpack-plugin');
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
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[contenthash].[ext]',
                    outputPath: 'fonts/'
                }
            }],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Bloodstar Clocktica',
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({filename:'bloodstar.css',chunkFilename:'[id].css'}),
        /*new CopyPlugin({
            patterns: [{
                from: './src/index.html',
                to: path.resolve(__dirname, 'dist')
            }]
        })*/
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization:{
        runtimeChunk: 'single',
        minimizer: [
            '...',
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: 'all',
        }
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'eval-source-map';
    }

    return config;
};
