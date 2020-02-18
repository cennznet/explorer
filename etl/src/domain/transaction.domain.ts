import { DataModel } from './data-model.domain';

export enum TransactionType {
    Normal = 'Standard',
    Contract = 'Contract',
}
export class Transaction extends DataModel {
    public hash: string;
    public blockNumber: number;
    public blockHash: string;
    public fromAddress: string;
    public toAddress: string;
    public value: string;
    public fee: string;
    public nonce: number;
    public size: number;
    public status: boolean;
    public timestamp: number;
    public assetId: number;
    public gasLimit: string;
    public index: number;
    public type: TransactionType;
    public data: string;
}
