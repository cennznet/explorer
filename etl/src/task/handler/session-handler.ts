import { plainToClass } from 'class-transformer';
import { Session } from '../../domain/session.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function sessionHandler(task: BlockTask, raw: IRawData) {
    task.setSession(
        plainToClass(Session, {
            blockNumber: task.block.number,
            sessionProgress: raw.sessionInfo.sessionProgress,
            sessionLength: raw.sessionInfo.sessionLength,
            eraProgress: raw.sessionInfo.eraProgress,
            eraLength: raw.sessionInfo.eraLength,
            validators: raw.validators.map(v => v.toString()),
        }),
    );
}
