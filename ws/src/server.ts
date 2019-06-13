import * as express from 'express';

export function getServer(isLocal: boolean) {
	const server = express();
	server.disable('x-powered-by');

	return server;
}
