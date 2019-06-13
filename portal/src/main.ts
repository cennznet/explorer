import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './common/config';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { getServer } from './server';

(async () => {
	const isLocal = process.env.NODE_ENV === 'local';
	const app = await NestFactory.create(AppModule, getServer(isLocal));
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(new ValidationPipe());

	if (process.env.NODE_ENV !== 'production') {
		const options = new DocumentBuilder().setTitle('CENNZnet Block Explorer').build();
		const doc = SwaggerModule.createDocument(app, options);
		SwaggerModule.setup('doc', app, doc);
	}

	app.listen(config.get('app.port', 3000));
})();
