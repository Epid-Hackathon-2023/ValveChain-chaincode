'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class ValveMaintenanceContract extends Contract {


    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }


    async createVanne(ctx, vanne_id, name, description, position_c, position_a, temp_relevee_amont, temp_relevee_aval, temp_attendue, name_groupe, groupe_localisation) {
        const vanne = {
            vanne_id: vanne_id,
            name: name,
            description: description,
            position_c: position_c,
            position_a: position_a,
            temp_relevee_amont: temp_relevee_amont,
            temp_relevee_aval: temp_relevee_aval,
            temp_attendue: temp_attendue,
            name_groupe: name_groupe,
            groupe_localisation: groupe_localisation
        };

        const vanneBuffer = Buffer.from(JSON.stringify(vanne));
        await ctx.stub.putState(vanne_id, vanneBuffer);
    }


    async updateVanne(ctx, vanne_id, updates) {
        const currentVanneBuffer = await ctx.stub.getState(vanne_id);
        if (!currentVanneBuffer || currentVanneBuffer.length === 0) {
            throw new Error("La vanne d'identifiant " + vanne_id + " n'existe pas");
        }

        const currentVanne = JSON.parse(currentVanneBuffer.toString());
        const updatedVanne = Object.assign({}, currentVanne);

        Object.keys(updates).forEach((key) => {
            updatedVanne[key] = updates[key];
        });

        const updatedVanneBuffer = Buffer.from(JSON.stringify(updatedVanne));
        await ctx.stub.putState(vanne_id, updatedVanneBuffer);
    }


    async getVanneById(ctx, vanne_id) {
        const vanneBuffer = await ctx.stub.getState(vanne_id);
        if (!vanneBuffer || vanneBuffer.length === 0) {
            throw new Error("La vanne d'identifiant " + vanne_id + " n'existe pas");
        }

        const vanne = JSON.parse(vanneBuffer.toString());
        return vanne;
    }


    async getVanneByName(ctx, name) {
        const startKey = '';
        const endKey = '';
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }

            if (record.name === name) {
                return record;
            }
        }

        throw new Error("La vanne de nom " + name + " n'existe pas");
    }


    async getVannesByGroupName(ctx, groupName) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.name_groupe === groupName) {
                allResults.push({ Key: key, Record: record });
            }
        }
        if (allResults.length == 0) {
            throw new Error("No valve found with group name " + groupName);
        }
        return allResults;
    }


    async getAllVannes(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return allResults;
    }

    async getVanneHistory(ctx, vanne_id) {
        const historyIterator = await ctx.stub.getHistoryForKey(vanne_id);

        const history = [];
        let result = await historyIterator.next();
        while (!result.done) {
            const res = {
                timestamp: new Date(result.value.timestamp),
                value: JSON.parse(result.value.value.toString('utf8')),
                txId: result.value.tx_id
            };
            history.push(res);
            result = await historyIterator.next();
        }

        return history;
    }
}

module.exports = ValveMaintenanceContract;