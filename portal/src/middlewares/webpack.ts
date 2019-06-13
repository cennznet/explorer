export function webpack() {
	const webpack = require('webpack');
	const webpackMiddleware = require('webpack-dev-middleware');
	const config = require('../../webpack.config');
	const compiler = webpack(config);
	return webpackMiddleware(compiler, {});
}
