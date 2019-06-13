import { Api } from '@cennznet/api';
import { genAllExtrinsics } from './utils/utils';

describe('Extrinsics exist', () => {
    let api: Api;
    let chainExtrinsics: string[];
    beforeAll(async () => {
        const endPoint = 'ws://18.136.19.89:9922';
        api = await Api.create({ provider: endPoint });
        chainExtrinsics = genAllExtrinsics(api);
    });

    it('Transaction Extrinsics', () => {
        const txExtrinsics = ['genericAsset.transfer', 'contract.call'];
        expect(chainExtrinsics).toEqual(expect.arrayContaining(txExtrinsics));
    });
});
