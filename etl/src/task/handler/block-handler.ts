import { HeaderExtended } from '@cennznet/types/polkadot';
import { plainToClass } from 'class-transformer';
import { Block } from '../../domain/block.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function blockHandler(task: BlockTask, raw: IRawData) {
    const { header, extrinsics } = raw.block;
    const extHeader = new HeaderExtended(header, raw.validators);
    task.block = plainToClass(Block, {
        number: header.blockNumber.toNumber(),
        hash: header.hash.toString(),
        parentHash: header.parentHash.toString(),
        stateRoot: header.stateRoot.toString(),
        extrinsicsRoot: header.extrinsicsRoot.toString(),
        timestamp: (extrinsics[0].args[0] as any).toNumber(),
        transactionCount: 0,
        baseFee: raw.blockFee.baseFee.toNumber(),
        byteFee: raw.blockFee.byteFee.toNumber(),
        transferFee: raw.blockFee.transferFee.toNumber(),
        author: extHeader.author.toString(),
        extrinsicCount: extrinsics.length,
    });
}
