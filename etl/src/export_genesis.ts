// import { Block } from './domain/block.domain';
// import { Session } from './domain/session.domain';

// import * as apiService from './service/api.service';
// import { DbService } from './service/db.service';

// export default async function export_genesis(
//     connectionString: string,
//     uri: string,
//     schema: string,
// ) {
//     const bn: number = 0;

//     await apiService.connect({ provider: uri });

//     const client = new DbService(schema);
//     await client.connect({ connectionString: connectionString });

//     const b = await apiService.getBlockByNum(bn);
//     console.log('Got block ' + b.block.header.blockNumber.toString());

//     const [events, baseFee, byteFee, transferFee] = await Promise.all([
//         apiService.getEvents(b.block.header.hash),
//         apiService.getBaseFee(b.block.header.hash),
//         apiService.getByteFee(b.block.header.hash),
//         apiService.getTransferFee(b.block.header.hash),
//     ]);
//     console.log('Got events');

//     const flattenedBlock = new Block({
//         blockNumber: b.block.header.blockNumber.toString(),
//         hash: b.block.header.hash.toString(),
//         parentHash: b.block.header.parentHash.toString(),
//         stateRoot: b.block.header.stateRoot.toString(),
//         extrinsicsRoot: b.block.header.extrinsicsRoot.toString(),
//         timestamp: 0,
//         txnCount: 0,
//         baseFee: baseFee.toNumber(),
//         byteFee: byteFee.toNumber(),
//         transferFee: transferFee.toNumber(),
//         author: '',
//         extrinsicCount: 0,
//     });

//     const [sessionProgress, sessionLength, eraProgress, eraLength] = await Promise.all([
//         apiService.getSessionProgress(b.block.header.hash),
//         apiService.getSessionLength(b.block.header.hash),
//         apiService.getEraProgress(b.block.header.hash),
//         apiService.getEraLength(b.block.header.hash),
//     ]);
//     const sessionInfo = new Session({
//         blockNumber: flattenedBlock.blockNumber,
//         sessionProgress: sessionProgress,
//         sessionLength: sessionLength,
//         eraProgress: eraProgress,
//         eraLength: eraLength,
//         validators: [],
//     });
//     flattenedBlock.sessionInfo = sessionInfo;

//     console.log('Start inserting');
//     await client.insertIntoDb(flattenedBlock);
//     await client.close();
// }
