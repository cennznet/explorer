import { Test } from '@nestjs/testing';
import { CacheService } from '../cache.service';
import { DataService } from '../data.service';


describe('DataService', () => {
	let dataService: DataService;

	beforeEach(async cb => {
		const module = await Test.createTestingModule({
			providers: [DataService, CacheService],
		}).compile();
		dataService = module.get<DataService>(DataService);
		cb();
	});

	it('getBlockHeight', async cb => {
		const height = await dataService.getBlockHeight();
		expect(typeof height).toEqual('number');
		cb();
	});

	it('getBlockList', async cb => {
		const blocks = await dataService.getBlockList();
		expect(blocks.length).toBe(10);
		expect('number' in blocks[0]).toBeTruthy();
		expect('hash' in blocks[0]).toBeTruthy();
		cb();
	});

	describe('getBlock', () => {
		it('by number', async cb => {
			const block = await dataService.getBlock(1000);
			expect(block.number).toBe(1000);
			cb();
		});

		it('by hash', async cb => {
			const block = await dataService.getBlock('0xcfab2a606895509bb1d49d8d7190434bc7bb83710639e0187e86956936dae6e6');
			expect(block.number).toBe(14131);
			cb();
		});

		it('no exist block', async cb => {
			const block = await dataService.getBlock('0xfaker');
			expect(block).toBeNull();
			cb();
		});
	});

	it('getTxList', async cb => {
		const txs = await dataService.getTxList(1, 20, {});
		expect(txs.txns.length).toBe(20);
		expect('hash' in txs[0]).toBeTruthy();
		cb();
	});

	it('getTxListByBlockNumber', async cb => {
		const txs = await dataService.getTxListByBlockNumber(240327, 1, 20, {});
		expect(txs.length).toBe(1);
		cb();
	});

	it('getTxListByAddress', async cb => {
		const opts = {
			asset_id: undefined,
			txn_type: null,
			start_time: null,
			end_time: null
		};
		const txs = await dataService.getTxListByAddress('5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj', 1, 20, opts);
		expect(txs.txns.length >= 1).toBeTruthy();
		expect(txs.txns.length <= 10).toBeTruthy();
		cb();
	});

	describe('getTx', () => {
		it('by hash', async cb => {
			const hash = '0xdef55ab0c33646a0be69de7bbf4cb22551d9cac79bdaaf18fef82218960406e8';
			const tx = await dataService.getTx(hash);
			expect(tx.hash).toEqual(hash);
			cb();
		});

		it('no exist tx', async cb => {
			const hash = '0xfaker';
			const tx = await dataService.getTx(hash);
			expect(tx).toBeNull();
			cb();
		});
	});

	it('getAddress', async cb => {
		const addressInfo = await dataService.getBalance('5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj', 10);
		expect(addressInfo.assetId).toBe(10);
		cb();
	});

	it('getAddress by specific asset', async cb => {
		const addressInfo = await dataService.getBalance('5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj', 0);
		expect(addressInfo.assetId).toBe(0);
		cb();
	});

	/*it.skip('getBalance', async cb => {
		const addr = '5FZ6AUcmjvZXzoEe9kFkHrDYDJssoUvDFcXtxhXQyAxGT8PL';
		const balance = await dataService.getBalance(addr);
		expect(/\d+/.test(balance.toString())).toBeTruthy();
		cb();
	});*/
});
