import { DataModel } from './data-model.domain';

export enum StatementType {
    Transfer = 'Transfer',
    Exchange = 'Exchange',
    Staking = 'Staking',
    Contract = 'Contract',
    Fee = 'Fee', // assume only paying extrinsic fee for Other type
}

export class Statement extends DataModel {
    public address: string;
    public blockNumber: number;
    public timestamp: number;
    public type: StatementType;
    public assetId: number;
    public value: string;
    public isOut: boolean;
}
