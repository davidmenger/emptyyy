/*
 * @author wingbot.ai
 */
'use strict';

const { StateStorage } = require('wingbot-mongodb');
const mongodb = require('./mongodb');

module.exports = new StateStorage(mongodb, 'states');
