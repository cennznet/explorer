import { inspect } from 'util';
import { createLogger, format, transports } from 'winston';
import { config } from './config';

const style = format.printf(info => {
	const splat = Symbol.for('splat');
	const data = info[splat as any] || [];
	let msg = `[App] ${process.pid}\t- ${info.timestamp}\t${info.level}: ${info.message}`;
	if (data.length) {
		const extra = data
			.map(d => inspect(d, { colors: process.env.NODE_ENV === 'local' }))
			.join(' ');
		msg += `\n${extra}`;
	}
	return msg;
});

const transportConfig = [
	new transports.Console({
		format: format.combine(format.colorize(), format.align(), style),
	}),
];

export const logger = createLogger({
	level: config.get('logger.logLevel') || 'debug',
	format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.json()),
	transports: transportConfig,
});

export class LogStream {
	public write(msg: string) {
		const formatted = msg.replace('\n', '').replace(/\[([^\]]+)\]/, '');
		logger.info(formatted);
	}
}
