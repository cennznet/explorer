import { plainToClass } from 'class-transformer';
import { TokenEntity } from '../../entities/token.entity';
import { TxnEntity } from '../../entities/txn.entity';
import { IAssetsAndTotal } from '../../services/data.service';


export const tokenList = plainToClass(TokenEntity, [
	{
		assetId: 0,
		name: 'Centrality Token',
		symbol: 'CENNZ',
		logo: '',
		description: '',
		totalSupply: '1451000000000000000'
	},
	{
		assetId: 10,
		name: 'Spend Token',
		symbol: 'CPAY',
		logo: '',
		description: '',
		totalSupply: '1411000000000000000'
	},
]);

export const transactions = plainToClass(TxnEntity, [
	{
		hash: '0x2a09709fdead6de63056eb0d6008bb59465898cff76556e66b9365c1f8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		toAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Standard',
		index: 1
	},
	{
		hash: '0x2a09709fdead6de63056eb0d6008bb59465898cff765eseeesf8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		toAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Contract',
		index: 1
	},
	{
		hash: '0x2a09709fdead6de63056eb0ddreafeef9465898cff765eseeesf8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		toAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Contract',
		index: 1
	},
]);

export const internalTransactions = plainToClass(TxnEntity, [
	{
		hash: '0x2a09709fdead6de63056eb0d6008bb59465898cff76556e66b9365c1f8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		toAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Internal',
		index: 1
	},
	{
		hash: '0x2a09709fdead6de63056eb0d6008bb59465898cff765eseeesf8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		toAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Internal',
		index: 2
	},
	{
		hash: '0x2a09709fdead6de63056eb0ddreafeef9465898cff765eseeesf8b04918',
		value: '1455223333',
		fee: 100,
		fromAddress: '0xe85430a51bd131905219bb2460fb893f48236cef',
		toAddress: '5GMcxzWSxsSCAxsaRb8XhB58uueyqsLc6RETUo383h9cWvQj',
		blockNumber: 124526,
		nonce: 12546,
		blockHash: '0x49aef7481eb1430c848d9d3bb4fefe27483f830880285a83c83c70dec038b076',
		size: 45122,
		status: 1,
		asset: 'CENNZ',
		timestamp: new Date().getTime(),
		assetId: 0,
		assetSymbol: 'CENNZ',
		type: 'Internal',
		index: 3
	},
]);


