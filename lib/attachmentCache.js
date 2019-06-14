/**
 * @author wingbot.ai
 */
'use strict';

const { AttachmentCache } = require('wingbot-mongodb');
const mongodb = require('./mongodb');

module.exports = new AttachmentCache(mongodb, 'attachments');
