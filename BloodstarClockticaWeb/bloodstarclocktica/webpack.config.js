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
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({filename:'bloodstar.css',chunkFilename:'[id].css'})
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    output: {
        filename: 'bloodstar.js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization:{
        minimizer: ['...', new CssMinimizerPlugin()]
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'eval-source-map';
    }

    return config;
};
