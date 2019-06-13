import { Body, Controller, Get, Post } from '@nestjs/common';
import { IMessage, NotifyGateway } from '../ws/notify.gateway';

@Controller('notify')
export class NotifyController {

	constructor(private readonly notify: NotifyGateway) {}

	@Post('message')
	public async message(@Body() msg: IMessage) {
		await this.notify.updateLatestBlock(msg);
		return { success: true };
	}
}
