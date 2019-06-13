import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import dayjs = require('dayjs');
import { config } from '../common/config';
import { logger } from '../common/logger';
import { DataService } from '../services/data.service';


interface ITransactionQuery {
	asset?: string;
	txType?: string;
	startDate?: number;
	endDate?: number;
	page?: number;
}

interface IInternalTxQuery {
	asset?: string;
	page?: number;
}

@Controller('tx')
export class TxController {
	constructor(private readonly dataService: DataService) {
	}

	@Get()
	public async list(@Query() query: ITransactionQuery, @Res() res) {
		const page = Number(query.page) || 1;
		const pageSize = 20;
		const baseUrl = config.get('app.baseUrl', '');
		const opts = {
			asset_id: query.asset,
			txn_type: query.txType,
			start_time: query.startDate,
			end_time: query.endDate
		};

		const queryStr =
			`${baseUrl}/tx?` +
			Object.keys(query)
				.filter(key => key !== 'page')
				.map(key => key + '=' + query[key])
				.join('&');
		const [chain, txResult, assetRes] = await Promise.all([
			this.dataService.getChainInfo(),
			this.dataService.getTxList(page, pageSize, opts),
			this.dataService.getAssets(false)
		]);
		const asset = query.asset ? query.asset.split(',') : [];
		res.render('pages/tx-list', {
			txns: txResult.txns,
			page,
			pageCount: Math.ceil(txResult.total / pageSize),
			total: chain.transactionCount,
			filteredResult: txResult.txns.length,
			filteredTotal: txResult.total,
			opts: { asset, txType: query.txType, startDate: query.startDate, endDate: query.endDate },
			queryStr,
			tokens: assetRes.tokenList.map(m => {
				return {
					value: m.assetId.toString(),
					name: m.symbol
				}
			})
		});
	}

	@Get(':hash')
	public async detail(@Param('hash') hash: string, @Query() query: IInternalTxQuery, @Res() res) {
		const page = Number(query.page) || 1;
		const pageSize = 20;
		const baseUrl = config.get('app.baseUrl', '');
		const opts = {
			asset_id: query.asset
		};
		const queryStr =
			`${baseUrl}/tx/${hash}?` +
			Object.keys(query)
				.filter(key => key !== 'page')
				.map(key => key + '=' + query[key])
				.join('&');
		const [tx, latestBlockNumber, txnsRes, assetsAndTotal] = await Promise.all([
			this.dataService.getTx(hash),
			this.dataService.getBlockHeight(),
			this.dataService.getInternalTxsByHash(hash, page, pageSize, opts),
			this.dataService.getAssetsAndTotalByHash(hash)
		]);
		if (!tx) {
			throw new NotFoundException(`No transaction hash ${hash} found, please try again later`);
		}
		res.render('pages/tx-detail', {
			tx,
			txns: txnsRes.txns,
			confirmations: latestBlockNumber - tx.blockNumber + 1,
			total: assetsAndTotal.total,
			filteredResult: txnsRes.txns.length,
			filteredTotal: txnsRes.total,
			opts: { token: query.asset ? query.asset.split(',') : [] },
			queryStr,
			assets: assetsAndTotal.assets
		});
	}
}
