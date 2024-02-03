const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

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
        index: './src/index.ts',
    },
    plugins: [new HtmlWebpackPlugin({ title: 'Webby' }), new ESLintPlugin()],
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
        loaders: [
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'ts-shader-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    types: ['@webgpu/types'],
}
