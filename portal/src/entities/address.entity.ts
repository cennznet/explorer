
export class BalanceEntity {
	public balance: string;
	public blockNumber: number;
	public assetId: number;
	public assetSymbol: string;
}

export class AddressEntity {
	public address: string;
	public alias: string;
	public balances: BalanceEntity[];
	public txnCount: number;
}
