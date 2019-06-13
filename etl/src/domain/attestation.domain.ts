import { DataModel } from './data-model.domain';

export enum AttestationType {
    SetClaim = 'Set',
    RemoveClaim = 'Remove',
}

export class Attestation extends DataModel {
    public hash: string;
    public holder: string;
    public issuer: string;
    public topic: string;
    public value: string;
    public blockNumber: number;
    public timestamp: number;
    public fee: string;
    public type: AttestationType;
}
