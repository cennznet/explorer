import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {

	@Get('health')
	public health() {
		return { status: 'OK' };
	}
}
