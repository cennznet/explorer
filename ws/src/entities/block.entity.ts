export class BlockEntity {
	public number: number;
	public hash: string;
	public parentHash: string;
	public stateRoot: string;
	public extrinsicsRoot: string;
	public baseFee: number;
	public byteFee: number;
	public transferFee: number;
	public timestamp: number;
	public transactionCount: number;
	public extrinsicsCount: number;
	public author: string;
	public validators: string[];
}
