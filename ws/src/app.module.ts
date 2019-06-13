import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { NotifyController } from './controllers/notify.controller';
import { DataService } from './services/data.service';
import { NotifyGateway } from './ws/notify.gateway';

@Module({
	controllers: [HealthController, NotifyController],
	providers: [DataService, NotifyGateway],
})
export class AppModule {}
