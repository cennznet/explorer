import { DataModel } from './data-model.domain';

export enum StakingType {
    Start = 'Start',
    Reward = 'Reward',
    Warning = 'Warning',
    Slash = 'Slash',
}

export class Staking extends DataModel {
    public address: string;
    public blockNumber: number;
    public event: StakingType;
    public value: string;
}
