import { DataModel } from './data-model.domain';

export class Trace extends DataModel {
    public transactionHash: string;
    public fromAddress: string;
    public toAddress: string;
    public value: string;
    public assetId: number;
    public blockNumber: number;
    public timestamp: number;
    public index: number;
    public blockHash: string;
}
