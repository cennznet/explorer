import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { config } from '../common/config';
import { isObjectEmpty } from '../common/helper';
import { DataService } from '../services/data.service';
import { tokenList as data, transactions as txn } from './mock/token.mock';


interface ITokenQuery {
	asset?: string;
	assetType?: string;
	page?: number;
}

@Controller('assets')
export class TokenController {
	constructor(private readonly dataService: DataService) {
	}

	@Get()
	public async list(@Query() query: ITokenQuery, @Res() res) {
		const page = Number(query.page) || 1;
		const pageSize = 20;
		const baseUrl = config.get('app.baseUrl', '');
		const opts = {
			asset_id: query.asset,
			asset_type: query.assetType,
		};
		let queryStr = `${baseUrl}/assets`;
		if(!isObjectEmpty(query)) {
			queryStr = queryStr + '?' + Object.keys(query)
				.filter(key => key !== 'page')
				.map(key => key + '=' + query[key])
				.join('&');
		}
		const [wholeAssets, assets] = await Promise.all([
			this.dataService.getAssets(false),
			this.dataService.getTokenList(page, pageSize, opts),
		]);
		const asset = query.asset ? query.asset.split(',') : '';
		res.render('pages/token-list', {
			wholeAssets: wholeAssets.tokenList.map(item => {
				return {
					name: item.symbol,
					value: item.assetId.toString()
				}
			}),
			wholeAssetTypes: wholeAssets.tokenList.map(item => {
				return item.assetType;
			}).filter((e, index, self) =>
				index === self.findIndex((t) => (
					t === e
				))
			),
			total: wholeAssets.total,
			filteredTotal: assets.total,
			filteredResult: assets.tokenList.length,
			tokens: assets.tokenList,
			page,
			pageCount: Math.ceil(assets.total / pageSize),
			opts: { asset, assetType: query.assetType },
			queryStr
		});
	}

	@Get(':assetId')
	public async detail(@Param('assetId') assetId: number, @Query('page') page: number, @Res() res) {
		page = Number(page) || 1;
		const pageSize = 20;

		const [token, txns] = await Promise.all([
			// this.dataService.getTokenByAssetId(assetId),
			Promise.resolve(data[0]),
			// this.dataService.getTxByAssetId(assetId, page, pageSize),
			Promise.resolve(txn),
		]);
		const pageCount = 1;
		res.render('pages/token-detail', { token, txns, page, pageCount });
	}
}
