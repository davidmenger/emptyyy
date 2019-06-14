/*
 * @author wingbot.ai
 */
'use strict';

const { Router, BuildRouter, ai } = require('wingbot');
const { PASS_THREAD_ACTION, TAKE_THEAD_ACTION, REQUEST_THREAD_ACTION } = require('./actions');
const config = require('../config'); // eslint-disable-line no-unused-vars
const plugins = require('./plugins');

ai.register(config.wingbot.ai);

ai.confidence = 0.85;

function botFactory (forTest = false) { // eslint-disable-line no-unused-vars
    const routerOptions = {
        linksTranslator (senderId, linkText, linkUrl, isExtUrl, state = {}) {
            if (`${linkUrl}`.startsWith(config.apiUrl)
                || `${linkUrl}`.startsWith(config.appUrl)) {
                return linkUrl;
            }

            const url = encodeURIComponent(linkUrl);
            const text = encodeURIComponent(linkText);
            const sender = encodeURIComponent(state._mergedFromSenderId || senderId);
            return `${config.apiUrl}/tracker?url=${url}&text=${text}&sender=${sender}`;
        }
    };

    const bot = new BuildRouter(config.wingbot, plugins, routerOptions);

    // implements primary receivers process thread action
    bot.use(REQUEST_THREAD_ACTION, (req, res) => {
        const { requested_owner_app_id: toAppId } = req.action(true);
        res.setState({ _threadPassed: true });
        res.passThread(toAppId);
    });

    // listen for threads takeover
    bot.use(TAKE_THEAD_ACTION, (req, res) => {
        res.setState({ _threadPassed: true });
    });

    // listen for pass thread action
    bot.use(PASS_THREAD_ACTION, (req, res) => {
        if (req.expected()) {
            // keep the expected action
            const { action, data } = req.expected();
            res.expected(action, data);
        }
        res.setState({ _threadPassed: false, _actionReceived: true });
        res.takeThead(config.facebook.appId);
        return Router.END;
    });

    // action cancles the handover
    bot.use((req, res) => {
        const action = req.action();
        const isAction = action || req.isReferral();

        if (isAction
            && req.state._threadPassed
            && action !== PASS_THREAD_ACTION) {

            res.takeThead(config.facebook.appId);
        }

        if (isAction) {
            res.setState({ _threadPassed: false });
        }
        return Router.CONTINUE;
    });

    // allow only access with an action - there's a start button but we dont want to risk anything
    bot.use((req, res) => {
        const action = req.action();

        // initial text interactions will be
        if (!req.state._actionReceived && !action) {

            // let's respond intents
            if (req.intent(ai.confidence)) {
                res.setState({ _actionReceived: true });
                return Router.CONTINUE;
            }

            // redirected existing users to the inbox
            if (!req.isReferral()) {
                res.setState({ _threadPassed: true })
                    .passThread(263902037430900);
            } else {
                // this was probably an action from the Ad.
                res.setState({ _actionReceived: true });
            }

            // IGNORED
            return Router.END;
        }

        // IGNORE referrals without an action - probably from an Ad
        if (!action && req.isReferral()) {
            // IGNORED TOO
            return Router.END;
        }

        if (!req.state._actionReceived && action) {
            res.setState({ _actionReceived: true });
        }

        return Router.CONTINUE;
    });

    // store previous action for analytics purposes
    bot.use((req, res) => {
        const action = req.action();
        if (action) {
            res.setState({ previousAction: action });
        }
        return Router.CONTINUE;
    });

    // attach router middlewares here

    return bot;
}

module.exports = botFactory;
