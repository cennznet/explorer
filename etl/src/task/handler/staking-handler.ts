import { plainToClass } from 'class-transformer';
import { getEventType} from '../../common/util';
import { Staking, StakingType } from '../../domain/staking.domain';
import * as apiService from '../../service/api.service';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export async function stakingHandler(task: BlockTask, raw: IRawData) {
    const { events, block } = raw;

    for (const e of events) {
        const evType = getEventType(e);
        switch (evType) {
            case 'staking.Reward':
                const [lastValidators, lastStakingAsset] = await Promise.all([
                    apiService.getValidators(block.header.parentHash),
                    apiService.getStakingAssetId(block.header.parentHash),
                ]);
                lastValidators.forEach(lv => {
                    task.addStaking(
                        plainToClass(Staking, {
                            address: lv.toString(),
                            blockNumber: task.block.number,
                            event: StakingType.Reward,
                            value: e.event.data[0].toString(),
                        }),
                        lastStakingAsset,
                    );
                });
                break;
            case 'staking.OfflineSlash':
                task.addStaking(
                    plainToClass(Staking, {
                        address: e.event.data[0].toString(),
                        blockNumber: task.block.number,
                        event: StakingType.Slash,
                        value: e.event.data[1].toString(),
                    }),
                );
                break;
            case 'staking.OfflineWarning':
                task.addStaking(
                    plainToClass(Staking, {
                        address: e.event.data[0].toString(),
                        blockNumber: task.block.number,
                        event: StakingType.Warning,
                        value: e.event.data[1].toString(),
                    }),
                );
                break;
            default:
                break;
        }
    }
    if (raw.sessionInfo.eraProgress === 0) {
        raw.validators.forEach(v => {
            task.addStaking(
                plainToClass(Staking, {
                    address: v.toString(),
                    blockNumber: task.block.number,
                    event: StakingType.Start,
                    value: null,
                }),
            );
        });
    }
}
