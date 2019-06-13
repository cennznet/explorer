import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './common/config';
import { getServer } from './server';

(async () => {
	const isLocal = process.env.NODE_ENV === 'local';
	const app = await NestFactory.create(AppModule, getServer(isLocal));
	app.useGlobalPipes(new ValidationPipe());

	app.listen(config.get('app.port', 3000));
})();
