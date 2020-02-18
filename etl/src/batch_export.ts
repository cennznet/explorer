import { range } from 'lodash';
import * as prettyMs from 'pretty-ms';
import { config } from './common/config';
import { logger } from './common/logger';
import * as apiService from './service/api.service';
import * as dbService from './service/db.service';
import { BlockFactory } from './task/block-factory';
import { BlockTask } from './task/block-task';
import { assetHandler } from './task/handler/asset-handler';
import { attestationHandler } from './task/handler/attestation-handler';
import { blockHandler } from './task/handler/block-handler';
import { contractHandler } from './task/handler/contract-handler';
import { eeHandler } from './task/handler/ee-handler';
import { exchangeHandler } from './task/handler/exchange-handler';
import { sessionHandler } from './task/handler/session-handler';
import { stakingHandler } from './task/handler/staking-handler';
import { txHandler } from './task/handler/tx-handler';
import { TaskCollection } from './task/task-collection';

const args = require('yargs')
    .option('block_number', {
        alias: 'b',
        demand: true,
    })
    .option('target_number', {
        alias: 't',
        demand: false,
    })
    .boolean('latest')
    .alias('latest', ['l']).argv;

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

main(args.block_number, args.target_number, args.latest)
    .catch(e => {
        process.exitCode = 1;
        logger.error(e.stack);
        logger.error(args.block_number);
        throw new Error('Something wrong');
    })
    .finally(() => {
        logger.info(`${process.exitCode}`);
        process.exit();
    });

async function main(bn: number, tn?: number, latest?: boolean) {
    logger.debug('Connecting to the node...');
    await apiService.connect();
    logger.debug('Connected to the node');
    await dbService.init();

    targetBlockNumber = tn ? tn + 1 : bn + 1;
    targetBlockNumber = latest
        ? await apiService.getBlock().then(b => Number(b.header.blockNumber.toNumber()))
        : targetBlockNumber;
    currentBlockNumber = bn;
    logger.info(`start: ${currentBlockNumber}, tartget: ${targetBlockNumber}`);
    await sync(targetBlockNumber);
}

async function sync(targetNumber: number) {
    while (true) {
        if (targetNumber > currentBlockNumber) {
            const start = Date.now();
            if (targetNumber - currentBlockNumber > maxConcurrency) {
                targetNumber = currentBlockNumber + maxConcurrency;
            }
            logger.info(`Start to process blocks: ${currentBlockNumber} - ${targetNumber}`);

            try {
                const collection = await Promise.all(
                    range(currentBlockNumber, targetNumber).map(n => buildTask(n)),
                ).then(tasks => new TaskCollection(tasks));
                logger.debug(`blocks extracted.`);
                logger.debug('Saving to db...');
                await dbService.saveBlockTasks(collection);
                logger.debug('Saved to db');
                logger.info(
                    `${collection.length} blocks saved. range: ${collection.first.block.number} - ${
                        collection.last.block.number
                    }. \t time spent: ${prettyMs(Date.now() - start)} `,
                );
                currentBlockNumber = targetNumber;
                targetNumber = targetBlockNumber;
            } catch (err) {
                process.exitCode = 1;
                logger.error('sync error', { err });
                return;
            }
        } else {
            return;
        }
    }
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
