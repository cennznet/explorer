import { DataModel } from './data-model.domain';

export class Balance extends DataModel {
    public address: string;
    public balance: string;
    public blockNumber: number;
    public assetId: number;
    public reservedBalance: string;
}
