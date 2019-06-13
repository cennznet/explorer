import { Api } from '@cennznet/api';
import { stringCamelCase } from '@cennznet/util';

export function genAllEvents(api: Api): string[] {
    const events = [];
    const metadataV0 = api.runtimeMetadata.asV0;
    const metadataEvent = metadataV0.events.toJSON();
    for (const meta of metadataEvent) {
        const section = stringCamelCase(meta[0]);
        const methods = meta[1];
        for (const method of methods) {
            events.push(String(section + '.' + method.name));
        }
    }
    return events;
}

export function genAllExtrinsics(api: Api): string[] {
    const extrinsics = [];
    const extrinsicList = api.tx;
    // tslint:disable-next-line: forin
    for (const section in extrinsicList) {
        // tslint:disable-next-line: forin
        for (const method in extrinsicList[section]) {
            extrinsics.push(String(section + '.' + method));
        }
    }
    return extrinsics;
}

export function genAllQueries(api: Api): string[] {
    const queries = [];
    const queriesList = api.query;
    // tslint:disable-next-line: forin
    for (const section in queriesList) {
        // tslint:disable-next-line: forin
        for (const method in queriesList[section]) {
            queries.push(String(section + '.' + method));
        }
    }
    return queries;
}
