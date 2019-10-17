import {Controller, Get, NotFoundException, Query, Req, Res} from '@nestjs/common';
import { config } from '../common/config';
import { AddressEntity } from '../entities/address.entity';
import { BlockEntity } from '../entities/block.entity';
import { TxnEntity } from '../entities/txn.entity';
import { DataService, TxStatPeriod } from '../services/data.service';
import {Request, Response} from "express";


@Controller()
export class HomeController {
	constructor(private readonly dataService: DataService) {}

	@Get()
	public async home(@Req() req: Request, @Res() res: Response) {
		const [chain, blocks, txns, last24H, last7D, last30D] = await Promise.all([
			this.dataService.getChainInfo(),
			this.dataService.getBlockList(1, 5),
			this.dataService.getTxList(1, 10, {}),

			this.dataService.getTxStat(TxStatPeriod.Last24H),
			this.dataService.getTxStat(TxStatPeriod.Last7D),
			this.dataService.getTxStat(TxStatPeriod.Last30D),
		]);
		res.render('pages/home', {
			isMobile: res.locals.isMobile,
			chain,
			blocks,
			txns: txns.txns,
			statData: JSON.stringify({ last24H, last7D, last30D }),
		});
	}

	@Get('search')
	public async search(@Query('q') query: string, @Res() res) {
		let block: BlockEntity;
		let tx: TxnEntity;
		let addr: AddressEntity;

		if (/^[0-9a-zA-Z]{48}$/.test(query)) {
			addr = await this.dataService.getAddress(query);
		} else if (/^0x[0-9a-fA-F]{64}$/.test(query)) {
			[block, tx] = await Promise.all([
				this.dataService.getBlock(query),
				this.dataService.getTx(query),
			]);
		} else if (/^[0-9]*$/.test(query)) {
			block = await this.dataService.getBlock(query);
		}

		const baseURL = config.get('app.baseUrl', '');
		if (addr) {
			res.redirect(`${baseURL}/addresses/${addr.address}`);
		} else if (block) {
			res.redirect(`${baseURL}/blocks/${block.number}`);
		} else if (tx) {
			res.redirect(`${baseURL}/tx/${tx.hash}`);
		} else {
			throw new NotFoundException('NotFound');
		}
	}

	@Get('health')
	public health() {
		return { status: 'OK' };
	}
}
