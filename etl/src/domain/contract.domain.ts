import { DataModel } from './data-model.domain';

export class Contract extends DataModel {
    public address: string;
    public blockNumber: number;
    public timestamp: number;
    public endowment: string;
    public gasLimit: string;
    public codeHash: string;
    public data: string;
    public creator: string;
    public byteCode: string;
    public fee: string;
    public name: string;
}
