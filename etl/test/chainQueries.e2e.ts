import { Api } from '@cennznet/api';
import { genAllQueries } from './utils/utils';

describe('Queries exist', () => {
    let api: Api;
    let chainQuries: string[];
    beforeAll(async () => {
        const endPoint = 'ws://18.136.19.89:9922';
        api = await Api.create({ provider: endPoint });
        chainQuries = genAllQueries(api);
    });

    describe('Api service', () => {
        it('getEvents', () => {
            const getEvents = ['system.events'];
            expect(chainQuries).toEqual(expect.arrayContaining(getEvents));
        });
        it('getBlockFee', () => {
            const getBlockFee = ['fees.feeRegistry'];
            expect(chainQuries).toEqual(expect.arrayContaining(getBlockFee));
        });
        it('getValidators', () => {
            const getValidators = ['session.validators'];
            expect(chainQuries).toEqual(expect.arrayContaining(getValidators));
        });
        it('getSessionInfo', () => {
            const getSessionInfo = [
                'session.sessionLength',
                'session.lastLengthChange',
                'session.currentIndex',
                'staking.lastEraLengthChange',
                'staking.sessionsPerEra',
            ];
            expect(chainQuries).toEqual(expect.arrayContaining(getSessionInfo));
        });
        it('getByteCode', () => {
            const getByteCode = ['contract.contractInfoOf', 'contract.codeStorage'];
            expect(chainQuries).toEqual(expect.arrayContaining(getByteCode));
        });
        it('getSpendingAssetId', () => {
            const getSpendingAssetId = ['genericAsset.spendingAssetId'];
            expect(chainQuries).toEqual(expect.arrayContaining(getSpendingAssetId));
        });
        it('getStakingAssetId', () => {
            const getStakingAssetId = ['genericAsset.stakingAssetId'];
            expect(chainQuries).toEqual(expect.arrayContaining(getStakingAssetId));
        });
    });
});
