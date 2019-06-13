import * as express from 'express';
import * as morgan from 'morgan';
import { join } from 'path';
import { LogStream } from './common/logger';
import { locale } from './middlewares/locale';
import { template } from './middlewares/template';
import { webpack } from './middlewares/webpack';

export function getServer(isLocal: boolean) {
	const server = express();

	server.disable('x-powered-by');
	server.set('views', join(__dirname, '../views'));
	server.set('view engine', 'njk');

	server.use(morgan('common', { stream: new LogStream() }));
	server.use(express.static(join(__dirname, '../public')));
	server.use(locale());

	if (isLocal) {
		server.use(express.static(join(__dirname, 'assets/img')));
		server.use(webpack());
	}

	template(server, isLocal);

	return server;
}
