import { Header } from '@cennznet/types/polkadot';
import { range } from 'lodash';
import * as prettyMs from 'pretty-ms';
import { config } from '../common/config';
import { logger } from '../common/logger';
import * as apiService from '../service/api.service';
import * as dbService from '../service/db.service';
import { notify } from '../service/message.service';
import { BlockFactory } from '../task/block-factory';
import { BlockTask } from '../task/block-task';
import { assetHandler } from '../task/handler/asset-handler';
import { attestationHandler } from '../task/handler/attestation-handler';
import { blockHandler } from '../task/handler/block-handler';
import { contractHandler } from '../task/handler/contract-handler';
import { eeHandler } from '../task/handler/ee-handler';
import { exchangeHandler } from '../task/handler/exchange-handler';
import { sessionHandler } from '../task/handler/session-handler';
import { stakingHandler } from '../task/handler/staking-handler';
import { txHandler } from '../task/handler/tx-handler';
import { TaskCollection } from '../task/task-collection';

const NOTIFICATION_SIZE = config.get('notifications.size', 10);

let targetBlockNumber: number;
let currentBlockNumber: number;
const maxConcurrency = Number(config.get('taskWorkers.block', 300));

const factory = new BlockFactory(
    blockHandler,
    txHandler,
    sessionHandler,
    stakingHandler,
    contractHandler,
    assetHandler,
    attestationHandler,
    eeHandler,
    exchangeHandler,
);

export async function listen() {
    logger.debug('Connecting to node...');
    await apiService.connect();
    logger.info('Connected to node');
    logger.debug('Connecting to db...');
    await dbService.init();
    logger.info('Connected to db');

    targetBlockNumber = await apiService
        .getBlock()
        .then(b => Number(b.header.blockNumber.toNumber()));
    currentBlockNumber = await dbService.getLatestBlock().then(b => (b ? Number(b.number) : 0));
    logger.info(
        `latest block in storage: ${currentBlockNumber}, chain height: ${targetBlockNumber}`,
    );
    await apiService.subscribe(updateTargetBlock);
    await sync(targetBlockNumber);
}

function updateTargetBlock(header: Header) {
    const n = header.blockNumber.toNumber();
    if (n > targetBlockNumber) {
        logger.info(`detect new block: ${n}`);
        targetBlockNumber = n;
    }
}

function sync(targetNumber: number) {
    setTimeout(async () => {
        if (targetNumber > currentBlockNumber) {
            const start = Date.now();
            if (targetNumber - currentBlockNumber > maxConcurrency) {
                targetNumber = currentBlockNumber + maxConcurrency;
            }
            logger.info(`Start to process blocks: ${currentBlockNumber + 1} - ${targetNumber}`);

            try {
                const collection = await Promise.all(
                    range(currentBlockNumber + 1, targetNumber + 1).map(n => buildTask(n)),
                ).then(tasks => new TaskCollection(tasks));
                logger.debug('Saving to db...');
                await dbService.saveBlockTasks(collection);
                logger.info(
                    `${collection.length} blocks saved. range: ${collection.first.block.number} - ${
                        collection.last.block.number
                    }. \t time spent: ${prettyMs(Date.now() - start)}`,
                );
                if (
                    collection.last.block.number - collection.first.block.number + 1 <=
                    NOTIFICATION_SIZE
                ) {
                    for (
                        let bn = collection.first.block.number;
                        bn <= collection.first.block.number;
                        bn++
                    ) {
                        await notify({ blockNumber: bn });
                    }
                }

                currentBlockNumber = targetNumber;
            } catch (err) {
                logger.error('sync error', { err });
                process.exit(1);
            }
        }
        await sync(targetBlockNumber);
    }, 0);
}

async function buildTask(bn: number): Promise<BlockTask> {
    const rawBlock = await apiService.getBlock(bn);
    const [
        blockFee,
        events,
        validators,
        sessionInfo,
        spendingAssetId,
        stakingAssetId,
    ] = await Promise.all([
        apiService.getBlockFee(rawBlock.header.hash),
        apiService.getEvents(rawBlock.header.hash),
        apiService.getValidators(rawBlock.header.hash),
        apiService.getSessionInfo(rawBlock.header.hash, bn),
        apiService.getSpendingAssetId(rawBlock.header.hash),
        apiService.getStakingAssetId(rawBlock.header.hash),
    ]);

    return factory.build({
        blockFee,
        events,
        validators,
        block: rawBlock,
        sessionInfo,
        spendingAssetId,
        stakingAssetId,
    });
}
