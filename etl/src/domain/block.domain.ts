import { DataModel } from './data-model.domain';

export class Block extends DataModel {
    public number: number;
    public hash: string;
    public parentHash: string;
    public stateRoot: string;
    public extrinsicsRoot: string;
    public timestamp: number;
    public transactionCount: number;
    public baseFee: number;
    public byteFee: number;
    public transferFee: number;
    public author: string;
    public extrinsicCount: number;

    public getFee(byte: number): string {
        return (this.baseFee + byte * this.byteFee + this.transferFee).toString();
    }
}
