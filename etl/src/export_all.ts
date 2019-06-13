import { range } from 'lodash';
import { logger } from './common/logger';
import * as apiService from './service/api.service';
import * as dbService from './service/db.service';
import { BlockFactory } from './task/block-factory';
import { BlockTask } from './task/block-task';
import { assetHandler } from './task/handler/asset-handler';
import { attestationHandler } from './task/handler/attestation-handler';
import { blockHandler } from './task/handler/block-handler';
import { contractHandler } from './task/handler/contract-handler';
import { sessionHandler } from './task/handler/session-handler';
import { stakingHandler } from './task/handler/staking-handler';
import { txHandler } from './task/handler/tx-handler';
import { TaskCollection } from './task/task-collection';

const args = require('yargs')
    .option('block_number', {
        alias: 'b',
        demand: true,
    })
    .option('output', {
        alias: 'o',
        demand: true,
    })
    .option('provider_uri', {
        alias: 'p',
        demand: true,
    })
    .option('schema', {
        alias: 's',
        demand: false,
        default: 'dev',
    })
    .option('target_number', {
        alias: 't',
        demand: false,
    })
    .option('workers', {
        alias: 'w',
        demand: false,
        default: 50,
    })
    .boolean('latest')
    .alias('latest', ['l']).argv;

let targetBlockNumber: number;
let currentBlockNumber: number;
let maxConcurrency: number;

const factory = new BlockFactory(
    blockHandler,
    txHandler,
    sessionHandler,
    stakingHandler,
    contractHandler,
    assetHandler,
    attestationHandler,
);

main(
    args.block_number,
    args.output,
    args.provider_uri,
    args.schema,
    args.workers,
    args.target_number,
    args.latest,
)
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

async function main(
    bn: number,
    connectionString: string,
    uri: string,
    schema: string,
    workers: number,
    tn?: number,
    latest?: boolean,
) {
    logger.debug('Connecting to the node...');
    await apiService.connect({ provider: uri });
    logger.debug('Connected to the node');
    await dbService.init({ connectionString, schema });

    targetBlockNumber = tn ? tn + 1 : bn + 1;
    targetBlockNumber = latest
        ? await apiService.getBlock().then(b => Number(b.header.blockNumber.toNumber()))
        : targetBlockNumber;
    currentBlockNumber = bn;
    maxConcurrency = workers;
    logger.info(`start: ${currentBlockNumber}, tartget: ${targetBlockNumber}`);
    await sync(targetBlockNumber);
}

async function sync(targetNumber: number) {
    if (currentBlockNumber >= targetNumber) {
        return;
    }
    if (targetNumber > currentBlockNumber) {
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
                }. `,
            );
            currentBlockNumber = targetNumber;
        } catch (err) {
            process.exitCode = 1;
            logger.error('sync error', { err });
            return;
        }
    }
    await sync(targetBlockNumber);
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
