/*
 * @author wingbot.ai
 */
'use strict';

const analytics = require('universal-analytics');
const { replaceDiacritics } = require('webalize');
const { ai } = require('wingbot');
const config = require('../config');

const PHONE_REGEX = /((00|\+)[\s-]?[0-9]{1,4})?[\s-]?([0-9]{3,4}[\s-]?([0-9]{2,3}[\s-]?[0-9]{2}[\s-]?[0-9]{2,3}|[0-9]{3,4}[\s-]?[0-9]{3,4}))/g;
const EMAIL_REGEX = /[^@\s]+@[^.@\s]+\.[^@\s]+/g;
const NUMERIC_CODE = /^[a-z0-9]*[0-9][a-z0-9]*$/ig;


/**
 * Trigged, when messaging event arrives to be able to record it
 *
 * @param {string} senderId
 * @param {string} action
 * @param {string} text
 * @param {Request} req
 * @param {string} prevAction
 */
function onEvent (senderId, action, text, req, prevAction) { // eslint-disable-line no-unused-vars
    if (!config.isProduction || !config.gaCode) {
        return;
    }

    const isJustAText = req.isText();
    const useSenderId = req.state._mergedFromSenderId || senderId;

    const tracker = analytics(config.gaCode, useSenderId, { strictCidFormat: false });

    if (action) {
        tracker.set('dp', action);
    }

    let word = text;

    if (word) {
        word = replaceDiacritics(text).replace(/\s+/g, ' ').toLowerCase().trim();

        if (word.match(PHONE_REGEX)) {
            word = word.replace(PHONE_REGEX, '@PHONE');
        }

        if (word.match(EMAIL_REGEX)) {
            word = word.replace(EMAIL_REGEX, '@EMAIL');
        }

        if (word.match(NUMERIC_CODE)) {
            word = word.replace(NUMERIC_CODE, '@CODE');
        }
    }

    if (isJustAText) {
        const notHandled = action === '/*' || action === '*';
        tracker.event('Text', action || '(not set)', word, notHandled ? 1 : 0, {
            p: prevAction
        });

        const { intent = '(not set)', score = 0 } = req.intent(true) || {};

        tracker.event('Intent', intent, word, score >= ai.confidence ? 0 : 1, {
            p: prevAction
        });
    }

    let actionType = '(other)';

    if (req.campaign) {
        actionType = 'notification';
    } else if (req.isSticker()) {
        actionType = 'sticker';
    } else if (req.isImage()) {
        actionType = 'image';
    } else if (req.isAttachment()) {
        actionType = 'attachment';
    } else if (req.isText()) {
        actionType = 'text';
    } else if (req.isQuickReply()) {
        actionType = 'quick-reply';
    } else if (req.isReferral() || req.isOptin()) {
        actionType = 'referral';
    } else if (req.isPostBack()) {
        actionType = 'button';
    }

    tracker.event('UserAction', action || '(not set)', actionType, 1, {
        p: prevAction
    });

    tracker.send();
}


/**
 * Trigged, when action is executed to be able to record it
 *
 * @param {string} senderId
 * @param {string} action
 * @param {string} text
 * @param {Request} req
 * @param {string} prevAction

 */
function onAction (senderId, action, text, req, prevAction) { // eslint-disable-line no-unused-vars
    if (config.isProduction && config.gaCode) {
        // attach google analytics
        if (req.state._doNotTrack) {
            return;
        }

        const useSenderId = req.state._mergedFromSenderId || senderId;

        const tracker = analytics(config.gaCode, useSenderId, { strictCidFormat: false });

        if (action) {
            tracker.set('dp', action);
        }

        const { cn, cs, cm } = req.action(true);

        if (cs) {
            tracker.set('cs', cs);

            if (cn) tracker.set('cn', cn);
            if (cm) tracker.set('cm', cm);

            tracker.event('Campaign', cn || 'no name', cs, 1);
        }

        if (action) {
            tracker.pageview(action);
        }

        tracker.send();
    }
}

module.exports = { onAction, onEvent };
