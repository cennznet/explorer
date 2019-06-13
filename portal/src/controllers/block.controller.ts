import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { config } from '../common/config';
import { DataService } from '../services/data.service';

interface IBlockTxQuery {
	asset?: string;
	txType?: string;
	page?: number;
}

@Controller('blocks')
export class BlockController {
	constructor(private readonly dataService: DataService) {
	}

	@Get()
	public async list(@Query('page') page: number, @Res() res) {
		page = Number(page) || 1;
		const pageSize = 20;
		const [blocks, height] = await Promise.all([
			this.dataService.getBlockList(page, pageSize),
			this.dataService.getBlockHeight(),
		]);
		const pageCount = Math.ceil(height / pageSize);
		res.render('pages/block-list', { blocks, page, pageCount, filteredResult: blocks.length, filteredTotal: height? height : 0 });
	}

	@Get(':height')
	public async detail(@Param('height') height: number, @Query() query: IBlockTxQuery, @Res() res) {
		const page = Number(query.page) || 1;
		const pageSize = 50;
		const baseUrl = config.get('app.baseUrl', '');
		const opts = {
			asset_id: query.asset,
			txn_type: query.txType,
		};
		const queryStr =
			`${baseUrl}/blocks/${height}?` +
			Object.keys(query)
				.filter(key => key !== 'page')
				.map(key => key + '=' + query[key])
				.join('&');

		const [block, txnsRes, assetsInBlock] = await Promise.all([
			this.dataService.getBlock(height),
			this.dataService.getTxListByBlockNumber(height, page, pageSize, opts),
			this.dataService.getAssetsByBlockNumber(height),
		]);
		const total = block.transactionCount;
		const pageCount = Math.ceil(block.transactionCount / pageSize);
		res.render('pages/block-detail', {
			block,
			total,
			filteredTotal: txnsRes.total,
			filteredResult: txnsRes.txns.length,
			txns: txnsRes.txns,
			page,
			pageCount,
			opts: { token: query.asset ? query.asset.split(','): [], txType: query.txType },
			queryStr,
			assets: assetsInBlock
		});
	}
}
