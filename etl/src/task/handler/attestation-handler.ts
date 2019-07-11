import { plainToClass } from 'class-transformer';
import {getEventType, u256ToString} from '../../common/util'
import { Attestation, AttestationType } from '../../domain/attestation.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';
export function attestationHandler(task: BlockTask, raw: IRawData) {
    const { block, events } = raw;

    for (const e of events) {
        const evType = getEventType(e);
        if (!['attestation.ClaimSet', 'attestation.ClaimRemoved'].includes(evType)) {
            continue;
        }
        const isClaimSet = evType === 'attestation.ClaimSet';
        const idx = e.phase.value.toString();
        const ex = block.extrinsics[idx];
        task.addAttestation(
            plainToClass(Attestation, {
                hash: ex.hash.toString(),
                holder: e.event.data[0].toString(),
                issuer: e.event.data[1].toString(),
                topic: u256ToString(e.event.data[2].toU8a()),
                value: isClaimSet ? e.event.data[3].toString() : null,
                blockNumber: task.block.number,
                timestamp: task.block.timestamp,
                fee: events
                    .find(
                        E =>
                            getEventType(E) === 'fees.Charged' &&
                            E.event.data[0].toString() === idx,
                    )
                    .event.data[1].toString(),
                type: isClaimSet ? AttestationType.SetClaim : AttestationType.RemoveClaim,
            }),
        );
    }
}
