import { DataModel } from './data-model.domain';

export class Session extends DataModel {
    public blockNumber: number;
    public sessionProgress: number;
    public sessionLength: number;
    public eraProgress: number;
    public eraLength: number;
    public validators: string[];
}
