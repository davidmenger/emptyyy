/*
 * @author wingbot.ai
 */
'use strict';
const log = require('./log');


function wrapRoute (fn) {

    return async (event, context) => {
        // eslint-disable-next-line no-param-reassign
        context.callbackWaitsForEmptyEventLoop = false;
        try {
            const res = await Promise.resolve(fn(event, context));
            return res;
        } catch (e) {
            log.error(e, event);
            return {
                statusCode: e.status || 500,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: e.message
            };
        }
    };
}

module.exports = wrapRoute;
