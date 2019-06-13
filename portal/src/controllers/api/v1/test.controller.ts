import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/test')
export class TestController {
	@Get()
	public test() {
		return { status: 'OK' };
	}
}
