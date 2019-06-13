import { plainToClass } from 'class-transformer';
import { getEventType, getExtrinsicType } from '../../common/util';
import { Transaction, TransactionType } from '../../domain/transaction.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function txHandler(task: BlockTask, raw: IRawData) {
    // function buildTransactions(task: BlockTask, raw: RawBlock, events: EventRecord[]) {
    const { events, block } = raw;

    for (const [idx, ex] of block.extrinsics.entries()) {
        const exType = getExtrinsicType(ex);
        if (exType !== 'genericAsset.transfer') {
            continue;
        }

        const size = ex.toU8a().byteLength;
        const gaStatus = events.find(
            e =>
                getEventType(e) === 'system.ExtrinsicSuccess' &&
                Number(e.phase.value.toString()) === idx,
        );
        const txn = plainToClass(Transaction, {
            hash: ex.hash.toString(),
            blockNumber: task.block.number,
            blockHash: task.block.hash,
            fromAddress: ex.signature.signer.toString(),
            toAddress: ex.args[1].toString(),
            value: ex.args[2].toString(),
            fee: events
                .find(
                    e =>
                        getEventType(e) === 'fees.Charged' &&
                        Number(e.event.data[0].toString()) === idx,
                )
                .event.data[1].toString(),
            nonce: ex.signature.nonce.toNumber(),
            size,
            status: !!gaStatus,
            timestamp: task.block.timestamp,
            assetId: Number(ex.args[0].toString()),
            gasLimit: null,
            index: idx,
            type: TransactionType.Normal,
            data: null,
        });
        task.addTransaction(txn);
    }
}
