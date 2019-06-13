import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { config } from '../common/config';
import { BlockEntity } from '../entities/block.entity';
import { TxnEntity } from '../entities/txn.entity';
import { logger } from '../common/logger';


export interface ITxList {
	total: number;
	txns: TxnEntity[];
}

export interface IBlockTxOptions {
	asset_id?: string;
	txn_type?: string;
}


@Injectable()
export class DataService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: config.get('api.endpoint'),
		});
	}

	public getBlockHeight(): Promise<number> {
		return this.api.get('/blocks/latest/number').then(r => r.data.latestBlockNumber);
	}


	public getBlock(n: number | string): Promise<BlockEntity> {
		return this.api
			.get(`/blocks/${n}`)
			.then(r => plainToClass(BlockEntity, r.data.result))
			.catch(err => null);
	}

	public getTxListByBlockNumber(n: number, page=1, pageSize=20, opts: IBlockTxOptions): Promise<ITxList> {
		Object.keys(opts).forEach(key => {
			if (!opts[key]) {
				delete opts[key];
			}
		});
		const params = { pageNumber: page, limit: pageSize, ...opts };
		return this.api
			.get(`/blocks/${n}/transactions`, { params })
			.then(r => ({
				total: r.data.params.total,
				txns: plainToClass(TxnEntity, r.data.result),
			}));
	}
}
