import { DataModel } from './data-model.domain';

export class Extrinsic extends DataModel {
    public hash: string;
    public blockNumber: number;
    public blockHash: number;
    public args: string;
    public section: string;
    public method: string;
    public index: number;
    public signer: string;
    public meta: string;
    public status: boolean;
    public fee: string;
}
