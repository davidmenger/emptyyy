/*
 * @author wingbot.ai
 */
'use strict';

const { MongoClient } = require('mongodb');
const config = require('../config');

let connection;

async function getDatabase (needConnection = false) {
    if (!connection) {
        connection = MongoClient.connect(config.db.url, config.db.options);
    }

    const c = await connection;

    if (needConnection) {
        return c;
    }

    return c.db(config.db.db);
}

module.exports = getDatabase;
