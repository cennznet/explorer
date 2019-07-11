import { Hash } from '@cennznet/types/polkadot';
import { plainToClass } from 'class-transformer';
import { Asset } from '../domain/asset.domain';
import { Attestation } from '../domain/attestation.domain';
import { Balance } from '../domain/balance.domain';
import { Block } from '../domain/block.domain';
import { Contract } from '../domain/contract.domain';
import { Session } from '../domain/session.domain';
import { Staking, StakingType } from '../domain/staking.domain';
import { Trace } from '../domain/trace.domain';
import { Transaction } from '../domain/transaction.domain';

import * as apiService from '../service/api.service';

export class BlockTask {
    public block: Block;

    public readonly transactions: Transaction[] = [];
    public readonly newAssets: Asset[] = [];
    public readonly session: Session[] = [];
    public readonly balances: Balance[] = [];
    public readonly stakings: Staking[] = [];
    public readonly contracts: Contract[] = [];
    public readonly attestations: Attestation[] = [];
    public readonly traces: Trace[] = [];

    public stakingAssetId: number;
    public spendingAssetId: number;

    private changes = {};

    public addTransaction(tx: Transaction) {
        this.block.transactionCount++;
        this.transactions.push(tx);

        for (const acc of [tx.fromAddress, tx.toAddress]) {
            this.addChange(acc, tx.assetId);
            // always check spend token for sender
            if (acc === tx.fromAddress && tx.assetId !== this.spendingAssetId) {
                this.addChange(acc, this.spendingAssetId);
            }
        }
    }

    public addTrace(trace: Trace) {
        this.traces.push(trace);
        for (const acc of [trace.fromAddress, trace.toAddress]) {
            this.addChange(acc, trace.assetId);
            // always check spend token for sender
            if (acc === trace.fromAddress && trace.assetId !== this.spendingAssetId) {
                this.addChange(acc, this.spendingAssetId);
            }
        }
    }

    public addContract(contract: Contract) {
        this.contracts.push(contract);
        this.addChange(contract.creator, this.spendingAssetId);
        this.addChange(contract.address, this.spendingAssetId);
    }

    public addAttestation(attestation: Attestation) {
        this.attestations.push(attestation);
        this.addChange(attestation.issuer, this.spendingAssetId);
    }

    public addNewAsset(asset: Asset) {
        this.newAssets.push(asset);
        if (asset.creator) {
            this.addChange(asset.creator, this.spendingAssetId);
        }
    }

    public setSession(session: Session) {
        this.session.push(session);
    }

    public addStaking(staking: Staking, assetId?: number) {
        this.stakings.push(staking);
        if (staking.event === StakingType.Reward) {
            assetId !== undefined
                ? this.addChange(staking.address, assetId)
                : this.addChange(staking.address, this.spendingAssetId);
        } else if (staking.event === StakingType.Slash) {
            assetId !== undefined
                ? this.addChange(staking.address, assetId)
                : this.addChange(staking.address, this.stakingAssetId);
        }
    }

    public get<T>(key: string): T[] {
        return this[key];
    }

    public async generateBalances() {
        const blockHash = new Hash(this.block.hash);
        const balanceSearch = [];
        for (const acc of Object.keys(this.changes)) {
            for (const assetId of this.changes[acc]) {
                balanceSearch.push({ address: acc, assetId });
            }
        }

        const data = await Promise.all(
            balanceSearch.map(bal => apiService.getBalance(bal.assetId, bal.address, blockHash)),
        );

        for (const [idx, value] of data.entries()) {
            const { address, assetId } = balanceSearch[idx];
            const b = plainToClass(Balance, {
                address,
                balance: value.free,
                blockNumber: this.block.number,
                assetId,
                reservedBalance: value.reserved,
            });
            this.balances.push(b);
        }
    }

    private addChange(addr: string, assetId: number) {
        if (this.changes[addr]) {
            if (!this.changes[addr].includes(assetId)) {
                this.changes[addr].push(assetId);
            }
        } else {
            this.changes[addr] = [assetId];
        }
    }
}
