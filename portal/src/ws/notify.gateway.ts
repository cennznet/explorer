import { Injectable } from '@nestjs/common';
import {
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server }  from 'socket.io';
import { DataService } from '../services/data.service';
import { SqsService } from '../services/sqs.service';


@Injectable()
@WebSocketGateway({namespace: 'notify'})
export class NotifyGateway implements OnGatewayInit {

	@WebSocketServer()
	private server: Server;


	constructor(private readonly sqsService: SqsService, private readonly dataService: DataService) {}

	public afterInit() {
		this.sqsService.consume((async messages => {
			const latestBlockHeigh = await this.dataService.getBlockHeight();
			const latestInfo = await Promise.all(messages.filter(msg => msg.blockNumber >= latestBlockHeigh)
				.map(async (msg) => {
				const [block, txns] = await Promise.all([
					this.dataService.getBlock(msg.blockNumber),
					this.dataService.getTxListByBlockNumber(msg.blockNumber, 1, 20, {}),
					// Promise.resolve(txn)
				]);
				return {
					block,
					txns
				}
			}));
			this.server.emit('latestBlock', { messages: latestInfo });
		}));
	}

}
