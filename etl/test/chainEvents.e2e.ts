import { Api } from '@cennznet/api';
import { genAllEvents } from './utils/utils';

describe('Events exist', () => {
    let api: Api;
    let chainEvents: string[];
    beforeAll(async () => {
        const endPoint = 'ws://18.136.19.89:9922';
        api = await Api.create({ provider: endPoint });
        chainEvents = genAllEvents(api);
    });

    it('General Events', () => {
        const generalEvents = ['fees.Charged', 'system.ExtrinsicSuccess'];
        expect(chainEvents).toEqual(expect.arrayContaining(generalEvents));
    });

    it('Asset Events', () => {
        const assetEvents = ['genericAsset.Created'];
        expect(chainEvents).toEqual(expect.arrayContaining(assetEvents));
    });

    it('Attestation Events', () => {
        const attestationEvents = ['attestation.ClaimSet', 'attestation.ClaimRemoved'];
        expect(chainEvents).toEqual(expect.arrayContaining(attestationEvents));
    });

    it('Contract Events', () => {
        const contractEvents = ['contract.Instantiated, contract.Transfer'];
        expect(chainEvents).toEqual(expect.arrayContaining(contractEvents));
    });

    it('Staking Events', () => {
        const stakingEvents = ['staking.Reward', 'staking.OfflineSlash', 'staking.OfflineWarning'];
        expect(chainEvents).toEqual(expect.arrayContaining(stakingEvents));
    });
});
