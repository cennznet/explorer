import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from './logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	public catch(ex: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const req = ctx.getRequest<Request>();
		const res = ctx.getResponse<Response>();
		const status = ex.getStatus ? ex.getStatus() : 500;

		const data = { error: ex };

		if (status >= 500 && process.env.NODE_ENV !== 'local') {
			logger.error('http request error', { error: ex });
		}

		if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
			const result = ex.getResponse
				? ex.getResponse()
				: {
					status,
					message: ex.message,
				};
			res.status(status).json(result);
		} else if (status === 403) {
			res.redirect('/');
		} else if (status === 404) {
			res.render('errors/not-found', data, (err, html) => res.send(html));
		} else {
			res.render('errors/error', data, (err, html) => res.send(html));
		}
	}
}
