/*
 * @author wingbot.ai
 */
'use strict';

const { Notifications } = require('wingbot');
const { NotificationsStorage } = require('wingbot-mongodb');
const analytics = require('universal-analytics');
const config = require('../config');
const mongodb = require('./mongodb');
const log = require('./log');

const storage = new NotificationsStorage(mongodb);

const notifications = new Notifications(storage, {
    log,
    sendMoreMessagesOver24: false
});

notifications.on('report', (event, campaignNameOrTag, { senderId }) => {
    if (config.gaCode) {
        const tracker = analytics(config.gaCode, senderId, { strictCidFormat: false });

        tracker.event('Notification', event, campaignNameOrTag, 1);
        tracker.send();
    }
});

module.exports = notifications;
