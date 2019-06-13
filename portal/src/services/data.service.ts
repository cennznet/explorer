import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { config } from '../common/config';
import { AddressEntity, BalanceEntity } from '../entities/address.entity';
import { BlockEntity } from '../entities/block.entity';
import { ChainEntity } from '../entities/chain.entity';
import { TokenEntity } from '../entities/token.entity';
import { TxnEntity } from '../entities/txn.entity';
import { CacheService } from './cache.service';


export enum TxStatPeriod {
	Last24H = 'last24h',
	Last7D = 'last7d',
	Last30D = 'last30d',
	Last12M = 'last365d',
}

export interface ITxOptions {
	asset_id?: string;
	txn_type?: string;
	txn_flow?: string;
	start_time?: number;
	end_time?: number;
}

export interface ITxList {
	total: number;
	txns: TxnEntity[];
}

export interface ITokenList {
	total: number;
	tokenList: TokenEntity[];
}

export interface IBlockTxOptions {
	asset_id?: string;
	txn_type?: string;
}

export interface ITokenOptions {
	asset_id?: string;
	asset_type?: string;
}

export interface IAssets {
	assetId: string;
	symbol: string
}

export interface IInternalOptions {
	asset_id?: string;
}

export interface IAssetsAndTotal {
	total: number;
	assets: IAssets[];
}

@Injectable()
export class DataService implements OnModuleInit, OnModuleDestroy {
	private api: AxiosInstance;
	private timer: NodeJS.Timer;

	constructor(private readonly cacheService: CacheService) {
		this.api = axios.create({
			baseURL: config.get('api.endpoint'),
		});
	}

	public onModuleInit() {
		this.timer = setInterval(async () => {
			Promise.all([
				this.getTxStat(TxStatPeriod.Last24H, false),
				this.getTxStat(TxStatPeriod.Last7D, false),
				this.getTxStat(TxStatPeriod.Last30D, false),
			]);
		}, 30 * 60 * 1000);
	}

	public onModuleDestroy() {
		clearInterval(this.timer);
	}

	public getBlockHeight(): Promise<number> {
		return this.api.get('/blocks/latest/number').then(r => r.data.latestBlockNumber);
	}

	public getBlockList(page = 1, pageSize = 10): Promise<BlockEntity[]> {
		const params = { page, limit: pageSize };
		return this.api
			.get('/blocks', { params })
			.then(r => plainToClass(BlockEntity, r.data.result));
	}

	public getBlock(n: number | string): Promise<BlockEntity> {
		return this.api
			.get(`/blocks/${n}`)
			.then(r => plainToClass(BlockEntity, r.data.result))
			.catch(err => null);
	}

	public getTxList(page, pageSize, opts: ITxOptions): Promise<ITxList> {
		Object.keys(opts).forEach(key => {
			if (!opts[key]) {
				delete opts[key];
			}
		});
		if (!page) {
			return this.api
				.get('/transactions')
				.then(r => ({
					total: r.data.params.total,
					txns: plainToClass(TxnEntity, r.data.result),
				}));
		}
		const params = { page, limit: pageSize, ...opts };
		return this.api
			.get('/transactions', { params })
			.then(r => ({
				total: r.data.params.total,
				txns: plainToClass(TxnEntity, r.data.result),
			}));
	}

	public getTxListByAddress(
		address: string,
		page,
		pageSize,
		opts: ITxOptions,
	): Promise<ITxList> {
		Object.keys(opts).forEach(key => {
			if (!opts[key]) {
				delete opts[key];
			}
		});
		const params = { page, limit: pageSize, startTimestamp: 0, ...opts };
		return this.api
			.get(`/addresses/${address}/transactions`, { params })
			.then(r => ({
				total: r.data.params.total,
				txns: plainToClass(TxnEntity, r.data.result),
			}));

	}

	public async getAssetsByBlockNumber(n: number): Promise<IAssets[]> {
		const txns = await this.api
			.get(`/blocks/${n}/transactions`)
			.then(r => plainToClass(TxnEntity, r.data.result));
		return txns.map(m => {
			return {
				assetId: m.assetId.toString(),
				symbol: m.assetSymbol,
			};
		}).filter((e, index, self) =>
			index === self.findIndex((t) => (
				t.assetId === e.assetId
			))
		);
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

	public getTx(hash: string): Promise<TxnEntity> {
		return this.api
			.get(`/transactions/${hash}`)
			.then(r => plainToClass(TxnEntity, r.data.result))
			.catch(err => null);
	}

	public getBalance(address: string, assetId: number): Promise<BalanceEntity> {
		return this.getBalances(address, assetId).then(data => data[0]);
	}

	public async getAddress(hash: string): Promise<AddressEntity> {
		const balances = await this.getBalances(hash);
		return plainToClass(AddressEntity, {
			address: hash,
			balances,
			txnCount: null,
		});
	}

	public async getTxStat(
		period: TxStatPeriod = TxStatPeriod.Last24H,
		cacheable = true,
	): Promise<{ datetime: string[]; timestamp: number[]; transactionCount: number[] }> {
		if (cacheable && this.cacheService.has(period)) {
			return this.cacheService.get(period);
		}
		const params = { period };
		const data = await this.api.get('/stats/transactions', { params }).then(r => r.data.result);
		this.cacheService.set(period, data);
		return data;
	}

	public getChainInfo(): Promise<ChainEntity> {
		return this.api.get('/stats').then(r => plainToClass(ChainEntity, r.data as object));
	}

	public getAssets(cacheable = true): Promise<ITokenList> {
		const cacheKey = 'wholeAssets';
		if (cacheable && this.cacheService.has(cacheKey)) {
			return this.cacheService.get(cacheKey);
		}
		const data = this.api
			.get('/assets')
			.then(r => ({
				total: r.data.params.total,
				tokenList: plainToClass(TokenEntity, r.data.result),
			}));
		this.cacheService.set(cacheKey, data);
		return data;
	}

	public getTokenList(page = 1, pageSize = 20, opts: ITokenOptions = {}): Promise<ITokenList> {
		Object.keys(opts).forEach(key => {
			if (!opts[key]) {
				delete opts[key];
			}
		});

		const params = { page, limit: pageSize, ...opts };
		return this.api
			.get('/assets', { params })
			.then(r => ({
				total: r.data.params.total,
				tokenList: plainToClass(TokenEntity, r.data.result),
			}));
	}

	public getTokenByAssetId(assetId: number): Promise<TokenEntity> {
		return this.api
			.get(`/tokens/${assetId}`)
			.then(r => plainToClass(TokenEntity, r.data.result))
			.catch(err => null);
	}

	public getTxByAssetId(assetId: number, page = 1, pageSize = 10): Promise<TxnEntity[]> {
		const params = { pageNumber: page, limit: pageSize };
		return this.api
			.get(`/tokens/${assetId}/transactions`, { params })
			.then(r => plainToClass(TxnEntity, r.data.result));
	}

	public getInternalTxsByHash(hash: string, page=1, pageSize=20, opts: IInternalOptions): Promise<ITxList> {
		Object.keys(opts).forEach(key => {
			if (!opts[key]) {
				delete opts[key];
			}
		});
		const params = { pageNumber: page, limit: pageSize, ...opts };
		return this.api
			.get(`/transactions/${hash}/internal`, { params })
			.then(r => ({
				total: r.data.params.total,
				txns: plainToClass(TxnEntity, r.data.result),
			}));
	}

	public async getAssetsAndTotalByHash(hash: string): Promise<IAssetsAndTotal> {
		const txns = await this.api
			.get(`/transactions/${hash}/internal`)
			.then(r => plainToClass(TxnEntity, r.data.result));
		const assets =  txns.map(m => {
			return {
				assetId: m.assetId.toString(),
				symbol: m.assetSymbol,
			};
		}).filter((e, index, self) =>
			index === self.findIndex((t) => (
				t.assetId === e.assetId
			))
		);

		return {
			total: txns.length,
			assets
		}
	}


	private getBalances(address: string, assetId = -1): Promise<BalanceEntity[]> {
		let balancesUrl = `/balances/${address}/latest`;
		if (assetId >= 0) {
			balancesUrl = balancesUrl + `?asset_id=${assetId}`;
		}
		return this.api
			.get(balancesUrl)
			.then(r => plainToClass(BalanceEntity, r.data.result));
	}


}
