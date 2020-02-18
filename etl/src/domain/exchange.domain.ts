import { DataModel } from './data-model.domain';

export enum ExchangeType {
    ExactInput = 'ExactInput',
    ExactOutput = 'ExactOutput',
}

export class Exchange extends DataModel {
    public hash: string;
    public blockNumber: number;
    public blockHash: number;
    public timestamp: number;
    public soldAssetId: number;
    public boughtAssetId: number;
    public signer: string;
    public recipient: string;
    public soldAmount: string;
    public boughtAmount: string;
    public type: ExchangeType;
}
