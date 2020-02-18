import { DataModel } from './data-model.domain';

export class Event extends DataModel {
    public blockNumber: number;
    public blockHash: number;
    public data: string;
    public section: string;
    public method: string;
    public extrinsicIndex: number;
    public meta: string;
}
