/*
 * @author wingbot.ai
 */
'use strict';
const { Settings } = require('wingbot-facebook');
const { START_ACTION } = require('./actions');
const config = require('../config');

async function botSettings () {
    if (config.isProduction) {
        // runs, when bot is updated
        const settings = new Settings(config.facebook.pageToken);

        await settings.getStartedButton(START_ACTION);

        // await settings.whitelistDomain([config.appUrl, config.apiUrl]);

        /* eslint-disable indent */
        await settings.menu()
            .addPostBack('Back to start', START_ACTION)
            .done();
    }
}

module.exports = botSettings;
