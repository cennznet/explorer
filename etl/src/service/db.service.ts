import * as knex from 'knex';
import { TaskCollection } from '../task/task-collection';

let db: knex;
let _SCHEMA: string;

export function init({ connectionString, schema }) {
    if (db || _SCHEMA) {
        return;
    }
    _SCHEMA = schema + '.';
    db = knex({
        client: 'pg',
        connection: connectionString,
    });
}

export async function saveBlockTasks(collect: TaskCollection) {
    const blocks = collect.getData('block');
    const transactions = collect.getData('transactions');
    const assets = collect.getData('newAssets');
    const sessions = collect.getData('session');
    const balances = collect.getData('balances');
    const stakings = collect.getData('stakings');
    const attestations = collect.getData('attestations');
    const traces = collect.getData('traces');

    const contracts = collect.getData('contracts');

    return db.transaction(async t => {
        try {
            const bIds = blocks.map(b => b.number);
            await t(_SCHEMA + 'block')
                .whereIn('number', bIds)
                .del();
            await t(_SCHEMA + 'transaction')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'asset')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'session')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'balance')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'validator')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'contract')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'attestation')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'trace')
                .whereIn('block_number', bIds)
                .del();

            await t.insert(blocks).into(_SCHEMA + 'block');
            await t.insert(transactions).into(_SCHEMA + 'transaction');
            await t.insert(assets).into(_SCHEMA + 'asset');
            await t.insert(sessions).into(_SCHEMA + 'session');
            await t.insert(balances).into(_SCHEMA + 'balance');
            await t.insert(stakings).into(_SCHEMA + 'validator');
            await t.insert(contracts).into(_SCHEMA + 'contract');
            await t.insert(attestations).into(_SCHEMA + 'attestation');
            await t.insert(traces).into(_SCHEMA + 'trace');

            return t.commit();
        } catch (err) {
            return t.rollback(err);
        }
    });
}
