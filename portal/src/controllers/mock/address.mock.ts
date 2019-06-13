import { plainToClass } from 'class-transformer';
import { AddressEntity } from '../../entities/address.entity';
import { TxnEntity } from '../../entities/txn.entity';

export const address = plainToClass(AddressEntity, {
	address: '5HoSYe9iMNvjyEs283RgucMPZH8iDoRuEz9SmWixNiRVnxxP',
	alias: '',
	balances: [{
		balance: '23242342',
		blockNumber: 245332,
		assetId: 10,
		assetSymbol: 'SPEND-10',
	},
		{
			balance: '23242342',
			blockNumber: 245332,
			assetId: 11,
			assetSymbol: 'SPEND-11',
		},
		{
			balance: '23242342',
			blockNumber: 245332,
			assetId: 12,
			assetSymbol: 'SPEND-12',
		},
		{
			balance: '23242342',
			blockNumber: 245332,
			assetId: 13,
			assetSymbol: 'SPEND-13',
		},
		{
			balance: '23242342',
			blockNumber: 245332,
			assetId: 14,
			assetSymbol: 'SPEND-14',
		},
		{
			balance: '23242342',
			blockNumber: 245332,
			assetId: 15,
			assetSymbol: 'SPEND-15',
		}],
});


export const txofAddress = plainToClass(TxnEntity, [
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
	},
]);
