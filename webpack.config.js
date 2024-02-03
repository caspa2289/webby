const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    optimization: {
        runtimeChunk: 'single',
    },
    entry: {
        index: './src/index.ts'
    },
    plugins: [
        new HtmlWebpackPlugin({ title: 'Webby' }),
    ],
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
}
