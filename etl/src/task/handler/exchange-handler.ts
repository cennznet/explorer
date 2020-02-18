import { plainToClass } from 'class-transformer';
import { getEventType, getExtrinsicType } from '../../common/util';
import { Exchange, ExchangeType } from '../../domain/exchange.domain';
import { Statement, StatementType } from '../../domain/statement.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export async function exchangeHandler(task: BlockTask, raw: IRawData) {
    const { block, events } = raw;

    for (const e of events) {
        const evType = getEventType(e);
        if (evType !== 'cennzxSpot.AssetPurchase') {
            continue;
        }
        const idx = Number(e.phase.value.toString());
        const ex = block.extrinsics[idx];
        const type =
            getExtrinsicType(ex) === 'cennzxSpot.assetSwapOutput'
                ? ExchangeType.ExactOutput
                : ExchangeType.ExactInput;
        task.addExchange(
            plainToClass(Exchange, {
                hash: ex.hash.toString(),
                blockNumber: task.block.number,
                blockHash: task.block.hash,
                timestamp: task.block.timestamp,
                soldAssetId: e.event.data[0].toString(),
                boughtAssetId: e.event.data[1].toString(),
                signer: ex.signature.signer.toString(),
                recipient: e.event.data[2].toString(),
                soldAmount: e.event.data[3].toString(),
                boughtAmount: e.event.data[4].toString(),
                type,
            }),
        );

        task.addStatement(
            plainToClass(Statement, {
                address: e.event.data[2].toString(),
                blockNumber: task.block.number,
                timestamp: task.block.timestamp,
                type: StatementType.Exchange,
                assetId: e.event.data[0].toString(),
                value: e.event.data[3].toString(),
                isOut: true,
            }),
        );

        task.addStatement(
            plainToClass(Statement, {
                address: e.event.data[2].toString(),
                blockNumber: task.block.number,
                timestamp: task.block.timestamp,
                type: StatementType.Exchange,
                assetId: e.event.data[1].toString(),
                value: e.event.data[4].toString(),
                isOut: false,
            }),
        );
    }
}
