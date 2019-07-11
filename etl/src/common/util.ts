import {
    EventRecord,
    Extrinsic,
    Method,
} from '@cennznet/types/polkadot';
import { numberToU8a, u8aToString } from '@cennznet/util';

export function getEventType(e: EventRecord): string {
    return e.event.section + '.' + e.event.method;
}

export function getExtrinsicType(ex: Extrinsic): string {
    const { method, section } = Method.findFunction(ex.method.callIndex);
    return section + '.' + method;
}

function stripTrailingZero(value: Uint8Array): Uint8Array {
    let endPos = value.length - 1;
    for (let i = endPos; i > -1; i--) {
        if (value[i] !== 0) {
            endPos = i;
            break;
        }
    }
    return value.slice(0, endPos + 1);
}

export function u256ToString(data: Uint8Array): string {
    const u8a: Uint8Array = stripTrailingZero(data);
    let str: string = u8aToString(u8a);
    if (!isAscii(str)) {
        str = null;
    }
    return str;
}

function isAscii(s: string): boolean {
    return /^[\x20-\x7F]*$/.test(s);
}
