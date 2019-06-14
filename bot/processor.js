/*
 * @author wingbot.ai
 */
'use strict';

const { Processor } = require('wingbot');
const config = require('../config');
const log = require('../lib/log');
const notifications = require('../lib/notifications');
const stateStorage = require('../lib/stateStorage');
const botFactory = require('./bot');
const { onAction, onEvent } = require('./onAction');

const bot = botFactory();

bot.on('action', onAction);

const processor = new Processor(bot, {
    appUrl: config.appUrl,
    stateStorage,
    log,
    autoTyping: true,
    autoSeen: true
});

processor.on('event', onEvent);

processor.plugin(notifications);


module.exports = processor;
