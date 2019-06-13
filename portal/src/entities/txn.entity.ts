export class TxnEntity {
	public hash: string;
	public value: string;
	public fee: number;
	public fromAddress: string;
	public fromAddressBalance: string;
	public toAddress: string;
	public toAddressBalance: string;
	public blockNumber: number;
	public nonce: number;
	public blockHash: string;
	public size: number;
	public status: number;
	public asset: string;
	public timestamp: number;
	public assetId: number;
	public transactionType: string;
	public assetSymbol: string;
	public index: number;
	public type: string;
}
