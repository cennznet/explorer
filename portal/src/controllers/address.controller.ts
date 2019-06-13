import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { config } from '../common/config';
import { DataService } from '../services/data.service';

interface IAddressDetailQuery {
	asset?: string;
	txType?: string;
	txFlow?: string;
	startDate?: number;
	endDate?: number;
	page?: number;
}

@Controller('addresses')
export class AddressController {
	constructor(private readonly dataService: DataService) {}

	@Get(':hash')
	public async detail(
		@Param('hash') hash: string,
		@Query() query: IAddressDetailQuery,
		@Res() res,
	) {
		const pageSize = 20;
		const page = Number(query.page) || 1;
		const baseUrl = config.get('app.baseUrl', '');
		const address = await this.dataService.getAddress(hash);
		if(query.asset !== '0' && query.asset === undefined && address.balances.length > 0) {
			query.asset = address.balances[0].assetId.toString();
		}
		const opts = {
			asset_id: query.asset,
			txn_type: query.txType,
			txn_flow: query.txFlow,
			start_time: query.startDate,
			end_time: query.endDate,
		};

		const queryStr =
			`${baseUrl}/addresses/${hash}?` +
			Object.keys(query)
				.filter(key => key !== 'page')
				.map(key => key + '=' + query[key])
				.join('&');

		const [result, totalRes] = await Promise.all([
			this.dataService.getTxListByAddress(hash, page, pageSize, opts),
			this.dataService.getTxListByAddress(hash,1,1, { asset_id: query.asset })
		]);
		

		res.render('pages/address-detail', {
			address,
			txns: result.txns,
			filteredTotal: result.total,
			filteredResult: result.txns.length,
			total: totalRes.total,
			page,
			pageCount: Math.ceil(result.total/pageSize),
			opts: { token: Number(query.asset), txType: query.txType, txFlow: query.txFlow, startDate: query.startDate, endDate: query.endDate },
			queryStr,
		});
	}
}
