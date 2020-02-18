import { Api, WsProvider } from '@cennznet/api';
import { GenericAsset } from '@cennznet/crml-generic-asset';
import { AssetId, Fee } from '@cennznet/types';
import {
    AccountId,
    Block,
    BlockNumber,
    EventRecord,
    Hash,
    Header,
    Option,
} from '@cennznet/types/polkadot';
import BN = require('bn.js');
import { config } from '../common/config';
import { logger } from '../common/logger';

export interface IBlockFee {
    baseFee: BN;
    byteFee: BN;
    transferFee: BN;
}

export interface ISessionInfo {
    sessionProgress: number;
    sessionLength: number;
    eraProgress: number;
    eraLength: number;
}

let api: Api;
let ga: GenericAsset;

export async function connect() {
    if (api) {
        return;
    }
    const uri = config.get('node.ws');
    const provider = new WsProvider(uri);
    provider.on('disconnected', () => {
        logger.error('ws disconnected');
        process.exit(1);
    });
    provider.on('error', () => {
        logger.error('ws error');
        process.exit(1);
    });

    api = await Api.create(provider);
    ga = await GenericAsset.create(api);
}

export function subscribe(callback: (header: Header) => void) {
    return api.rpc.chain.subscribeNewHead(callback);
}

export async function getBlock(n?: number): Promise<Block> {
    const hash = n ? await api.rpc.chain.getBlockHash(n) : await api.rpc.chain.getBlockHash();
    return api.rpc.chain.getBlock(hash).then((r: any) => r.block);
}

export async function getEvents(blockHash: Hash): Promise<EventRecord[]> {
    return api.query.system.events.at(blockHash) as any;
}

export async function getBlockFee(blockHash: Hash): Promise<IBlockFee> {
    const [baseFee, byteFee, transferFee] = await Promise.all([
        api.query.fees.feeRegistry.at(blockHash, Fee.FeesFee.BaseFee) as any,
        api.query.fees.feeRegistry.at(blockHash, Fee.FeesFee.BytesFee) as any,
        api.query.fees.feeRegistry.at(blockHash, Fee.GenericAssetFee.TransferFee) as any,
    ]);

    return { baseFee, byteFee, transferFee };
}

export async function getBalance(
    assetId: AssetId,
    address: AccountId,
    blockHash?: Hash,
): Promise<{ free: string; reserved: string }> {
    const [free, reserved] = await Promise.all([
        getFreeBalance(assetId, address, blockHash),
        getReservedBalance(assetId, address, blockHash),
    ]);
    return { free, reserved };
}

export async function getFreeBalance(
    assetId: AssetId,
    address: AccountId,
    blockHash?: Hash,
): Promise<string> {
    return blockHash
        ? ga.getFreeBalance
              .at(blockHash, assetId.toString(), address)
              .then(balance => balance.toString())
        : ga.getFreeBalance(assetId.toString(), address).then(balance => balance.toString());
}

export async function getReservedBalance(
    assetId: AssetId,
    address: AccountId,
    blockHash?: Hash,
): Promise<string> {
    return blockHash
        ? ga.getReservedBalance
              .at(blockHash, assetId.toString(), address)
              .then(balance => balance.toString())
        : ga.getReservedBalance(assetId.toString(), address).then(balance => balance.toString());
}

export async function getValidators(blockHash: Hash): Promise<AccountId[]> {
    return api.query.session.validators.at(blockHash) as any;
}

export async function getSessionInfo(blockHash: Hash, blockNumber: number): Promise<ISessionInfo> {
    const [
        rsessionLength,
        lastLengthChangeOpt,
        CurrentIndex,
        lastEraLengthChange,
        sessionsPerEra,
    ]: any = await Promise.all([
        api.query.session.sessionLength.at(blockHash),
        (api.query.session.lastLengthChange.at(blockHash) as unknown) as Option<BlockNumber>,
        api.query.session.currentIndex.at(blockHash),
        api.query.staking.lastEraLengthChange.at(blockHash),
        api.query.staking.sessionsPerEra.at(blockHash),
    ]);
    const sessionLength = rsessionLength.toNumber();
    const lastLengthChange = lastLengthChangeOpt.unwrapOr(0);
    const sessionProgress: number =
        (blockNumber - lastLengthChange + sessionLength) % sessionLength;
    const eraProgress: number =
        ((CurrentIndex.toNumber() - lastEraLengthChange.toNumber()) % sessionsPerEra.toNumber()) *
            sessionLength +
        sessionProgress;
    const eraLength: number = sessionLength * sessionsPerEra.toNumber();
    return { sessionProgress, sessionLength, eraProgress, eraLength };
}

export async function getByteCode(address: AccountId) {
    const codeHash: any = await api.query.contract.contractInfoOf(address);
    const result = await api.query.contract.codeStorage(codeHash.value.asAlive.codeHash.toString());
    return JSON.parse(result.toString());
}

export async function getSpendingAssetId(blockHash: Hash): Promise<number> {
    return api.query.genericAsset.spendingAssetId.at(blockHash).then(r => Number(r.toString()));
}

export async function getStakingAssetId(blockHash: Hash): Promise<number> {
    return api.query.genericAsset.stakingAssetId.at(blockHash).then(r => Number(r.toString()));
}
