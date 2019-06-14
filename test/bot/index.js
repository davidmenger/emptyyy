/*
 * @author wingbot.ai
 */
'use strict';

const { Tester } = require('wingbot');
// const assert = require('assert');
const { botFactory } = require('../../bot');
const mongodb = require('../../lib/mongodb');

after(async () => {
    const db = await mongodb(true);
    await db.close(true);
});

describe('Bot', function () {

    this.timeout(10000);

    let bot;

    before(() => {
        bot = botFactory(true);
    });

    it('should be able to run', async () => {
        const t = new Tester(bot);

        await t.postBack('start');
    });

});
