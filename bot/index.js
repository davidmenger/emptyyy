/*
 * @author wingbot.ai
 */
'use strict';

const { Facebook } = require('wingbot-facebook');
const attachmentCache = require('../lib/attachmentCache');
const { PASS_THREAD_ACTION, TAKE_THEAD_ACTION, REQUEST_THREAD_ACTION } = require('./actions');
const { BotService } = require('wingbot-botservice');
const config = require('../config');
const processor = require('./processor');
const botFactory = require('./bot');
const botSettings = require('./botSettings');

const channel = new Facebook(
    processor,
    Object.assign({
        attachmentStorage: attachmentCache,
        passThreadAction: PASS_THREAD_ACTION,
        takeThreadAction: TAKE_THEAD_ACTION,
        requestThreadAction: REQUEST_THREAD_ACTION
    }, config.facebook)
);
const botservice = new BotService(processor, Object.assign({
    // set to null when using an initAction option in the Wingbot Browser Lib
    welcomeAction: START_ACTION
}, config.botService));

module.exports = {
    botSettings,
    botFactory,
    botservice,
    channel
};
