import { AccountId, Block as RawBlock, EventRecord } from '@cennznet/types/polkadot';
import { IBlockFee, ISessionInfo } from '../service/api.service';
import { BlockTask } from '../task/block-task';

export interface IRawData {
    block: RawBlock;
    events: EventRecord[];
    blockFee: IBlockFee;
    validators: AccountId[];
    sessionInfo: ISessionInfo;
    spendingAssetId: number;
    stakingAssetId: number;
}

export type TaskHandler = (task: BlockTask, raw: IRawData) => void;

export class BlockFactory {
    private readonly handlers: TaskHandler[] = [];

    constructor(...handlers: TaskHandler[]) {
        this.handlers = this.handlers.concat(handlers);
    }

    public async build(rawData: IRawData): Promise<BlockTask> {
        const task = new BlockTask();
        task.stakingAssetId = rawData.stakingAssetId;
        task.spendingAssetId = rawData.spendingAssetId;

        for (const fn of this.handlers) {
            await fn(task, rawData);
        }
        await task.generateBalances();
        return task;
    }
}
