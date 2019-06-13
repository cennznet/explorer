import { DataModel } from './data-model.domain';

export enum AssetType {
    Reserved = 'Reserved',
    Test = 'Test',
    UserGenerated = 'User-generated',
}

export class Asset extends DataModel {
    public hash: string;
    public id: number;
    public initialIssuance: string;
    public blockNumber: number;
    public timestamp: number;
    public symbol: string;
    public creator: string;
    public fee: string;
    public type: string;
}
