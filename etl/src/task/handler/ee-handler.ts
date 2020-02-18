import { plainToClass } from 'class-transformer';
import { getEventType, getExtrinsicType } from '../../common/util';
import { Event } from '../../domain/event.domain';
import { Extrinsic } from '../../domain/extrinsic.domain';
import { Statement, StatementType } from '../../domain/statement.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function eeHandler(task: BlockTask, raw: IRawData) {
    const { events, block } = raw;
    for (const [idx, ex] of block.extrinsics.entries()) {
        const exType = getExtrinsicType(ex).split('.');
        const status = !!events.find(
            e =>
                getEventType(e) === 'system.ExtrinsicSuccess' &&
                Number(e.phase.value.toString()) === idx,
        );
        const feeEv = events.find(
            e => getEventType(e) === 'fees.Charged' && Number(e.event.data[0].toString()) === idx,
        );
        const fee = !!feeEv ? feeEv.event.data[1].toString() : null;

        task.addExtrinsic(
            plainToClass(Extrinsic, {
                hash: ex.hash.toString(),
                blockNumber: task.block.number,
                blockHash: task.block.hash,
                args: ex.args.toString(),
                section: exType[0],
                method: exType[1],
                index: idx,
                signer: ex.signature.signer.toString(),
                meta: ex.meta.toString(),
                status,
                fee,
            }),
        );

        if (!!feeEv) {
            task.addStatement(
                plainToClass(Statement, {
                    address: ex.signature.signer.toString(),
                    blockNumber: task.block.number,
                    timestamp: task.block.timestamp,
                    type: StatementType.Fee,
                    assetId: task.spendingAssetId,
                    value: fee,
                    isOut: true,
                }),
            );
        }
    }

    for (const ev of events) {
        const evType = getEventType(ev).split('.');
        let idx = ev.phase.value.toString() ? ev.phase.value.toString() : null;
        if (getEventType(ev) === 'fees.Charged') {
            idx = ev.event.data[0].toString();
        }
        task.addEvent(
            plainToClass(Event, {
                blockNumber: task.block.number,
                blockHash: task.block.hash,
                data: ev.event.data.toString(),
                section: evType[0],
                method: evType[1],
                extrinsicIndex: idx,
                meta: ev.event.meta.toString(),
            }),
        );
    }
}
