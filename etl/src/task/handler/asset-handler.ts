import { plainToClass } from 'class-transformer';
import { getEventType } from '../../common/util';
import { Asset, AssetType } from '../../domain/asset.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export async function assetHandler(task: BlockTask, raw: IRawData) {
    const { block, events } = raw;

    for (const e of events) {
        if (getEventType(e) !== 'genericAsset.Created') {
            continue;
        }
        const idx = e.phase.value.toString();
        const ex = block.extrinsics[idx];

        const assetId = Number(e.event.data[0].toString());
        let type: AssetType;
        if (assetId >= 0 && assetId < 16000) {
            type = AssetType.Reserved;
        } else if (assetId >= 16000 && assetId < 17000) {
            type = AssetType.Test;
        } else if (assetId >= 17000) {
            type = AssetType.UserGenerated;
        } else {
            type = null;
        }
        task.addNewAsset(
            plainToClass(Asset, {
                hash: ex.hash.toString(),
                id: assetId,
                initialIssuance: parseInt(e.event.data[2].toJSON().initialIssuance, 16),
                blockNumber: task.block.number,
                timestamp: task.block.timestamp,
                symbol: type === AssetType.UserGenerated ? 'ASSET-' + String(assetId) : null,
                creator: ex.signature.signer.toString(),
                fee: events
                    .find(
                        E =>
                            getEventType(E) === 'fees.Charged' &&
                            E.event.data[0].toString() === idx,
                    )
                    .event.data[1].toString(),
                type,
            }),
        );
    }
}
