const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isLocal = process.env['NODE_ENV'] === 'local';

module.exports = {
	mode: isLocal ? 'development' : 'production',

	devtool: 'source-map',

	entry: {
		main: path.join(__dirname, 'src/assets/js/main'),
	},

	output: {
		path: path.resolve(__dirname, 'public'),
		filename: isLocal ? '[name].js' : '[name].[contenthash:8].js',
		publicPath: isLocal ? '/' : '/',
	},

	module: {
		rules: [
			{ parser: { amd: false } },
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			},
			{
				test: /\.s(c|a)ss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{ loader: 'css-loader', options: { minimize: !isLocal } }, 'sass-loader'],
				}),
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{ loader: 'css-loader', options: { minimize: !isLocal } }],
				}),
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: isLocal ? 'images/[name].[ext]' : 'images/[name].[hash:8].[ext]',
					},
				},
			},
			{
				test:/\.njk$/,
				loader: 'raw-loader',
			}
		],
	},

	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		alias: {
			// vue$: 'vue/dist/vue.common.js',
			jquery$: path.join(__dirname, '/node_modules/jquery/dist/jquery.js'),
		},
		modules: [
			'node_modules',
			path.join(__dirname, 'views'),
		]
	},

	optimization: {
		splitChunks: {
			chunks: 'initial',
			name: 'vendor',
		},
	},

	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new ManifestPlugin(),
		new ExtractTextPlugin(isLocal ? '[name].css' : '[name].[chunkhash:8].css'),
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, 'src/assets/favicon.ico'),
				to: path.join(__dirname, 'public/favicon.ico'),
			},
		]),
	],
};
