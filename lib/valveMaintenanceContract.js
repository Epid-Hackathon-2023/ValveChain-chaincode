'use strict';

const { Contract } = require('fabric-contract-api');

class ValveMaintenanceContract extends Contract {
    constructor() {
        super('valveMaintenanceContract');
    }


    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }


    async createVanne(ctx, vanne) {
        vanne = JSON.parse(vanne);

        const vanneKey = ctx.stub.createCompositeKey('org.vanne', [vanne.id]);
        vanne.dateReleve = new Date().toISOString();
        await ctx.stub.putState(vanneKey, Buffer.from(JSON.stringify(vanne)));
    }

    async getVanne(ctx, id) {
        const vanneKey = ctx.stub.createCompositeKey('org.vanne', [id]);
        const vanne = await ctx.stub.getState(vanneKey);

        return vanne.toString();
    }
}