import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AddressController } from './controllers/address.controller';
import { BlockController } from './controllers/block.controller';
import { ContractController } from './controllers/contract.controller';
import { HomeController } from './controllers/home.controller';
import { TokenController } from './controllers/token.controller';
import { TxController } from './controllers/tx.controller';
import { CacheService } from './services/cache.service';
import { DataService } from './services/data.service';
import { SqsService } from './services/sqs.service';

@Module({
	// imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([])],
	controllers: [HomeController, BlockController, ContractController, TxController, AddressController, TokenController, AccountController],
	providers: [DataService, CacheService, SqsService],


})
export class AppModule {}
