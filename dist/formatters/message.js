"use strict";
/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Since rollup cannot deal with namespace being a function,
// this is to interop with TypeScript since `invariant`
// does not export a default
// https://github.com/rollup/rollup/issues/1267
var invariant_ = require("invariant");
var invariant = invariant_.default || invariant_;
var utils_1 = require("../utils");
var intl_messageformat_parser_1 = require("intl-messageformat-parser");
function isCyclic(obj) {
    var seenObjects = [];
    function detect(obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) {
                return true;
            }
            seenObjects.push(obj);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && detect(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    }
    return detect(obj);
}
/**
 * Escape a raw msg when we run in prod mode
 * https://github.com/formatjs/formatjs/blob/master/packages/intl-messageformat-parser/src/parser.pegjs#L155
 */
function escapeUnformattedMessage(msg) {
    return msg.replace(/'\{(.*?)\}'/g, "{$1}");
}
function formatMessage(_a, state, messageDescriptor, values) {
    var locale = _a.locale, formats = _a.formats, messages = _a.messages, defaultLocale = _a.defaultLocale, defaultFormats = _a.defaultFormats, onError = _a.onError;
    if (messageDescriptor === void 0) { messageDescriptor = { id: '' }; }
    if (values === void 0) { values = {}; }
    var id = messageDescriptor.id, defaultMessage = messageDescriptor.defaultMessage;
    // `id` is a required field of a Message Descriptor.
    invariant(id, '[React Intl] An `id` must be provided to format a message.');
    var message = messages && messages[id];
    var hasValues = Object.keys(values).length > 0;
    // Avoid expensive message formatting for simple messages without values. In
    // development messages will always be formatted in case of missing values.
    if (!hasValues && process.env.NODE_ENV === 'production') {
        var val = message || defaultMessage || id;
        if (typeof val === 'string') {
            return escapeUnformattedMessage(val);
        }
        invariant(val.length === 1 && val[0].type === intl_messageformat_parser_1.TYPE.literal, 'Message has placeholders but no values was provided');
        return val[0].value;
    }
    var formattedMessageParts = [];
    if (message) {
        try {
            var formatter = state.getMessageFormat(message, locale, formats, {
                formatters: state,
            });
            formattedMessageParts = formatter.formatHTMLMessage(values);
        }
        catch (e) {
            onError(utils_1.createError("Error formatting message: \"" + id + "\" for locale: \"" + locale + "\"" +
                (defaultMessage ? ', using default message as fallback.' : ''), e));
        }
    }
    else {
        // This prevents warnings from littering the console in development
        // when no `messages` are passed into the <IntlProvider> for the
        // default locale, and a default message is in the source.
        if (!defaultMessage ||
            (locale && locale.toLowerCase() !== defaultLocale.toLowerCase())) {
            onError(utils_1.createError("Missing message: \"" + id + "\" for locale: \"" + locale + "\"" +
                (defaultMessage ? ', using default message as fallback.' : '')));
        }
    }
    if (!formattedMessageParts.length && defaultMessage) {
        try {
            var formatter = state.getMessageFormat(defaultMessage, defaultLocale, defaultFormats);
            formattedMessageParts = formatter.formatHTMLMessage(values);
        }
        catch (e) {
            onError(utils_1.createError("Error formatting the default message for: \"" + id + "\"", e));
        }
    }
    if (!formattedMessageParts.length) {
        onError(utils_1.createError("Cannot format message: \"" + id + "\", " +
            ("using message " + (message || defaultMessage ? 'source' : 'id') + " as fallback.")));
        if (typeof message === 'string') {
            return (message ||
                defaultMessage ||
                (hasValues ? id + " " + JSON.stringify(values) : id));
        }
        if (isCyclic(values)) {
            return defaultMessage || id;
        }
        return (defaultMessage || (hasValues ? id + " " + JSON.stringify(values) : id));
    }
    if (formattedMessageParts.length === 1 &&
        typeof formattedMessageParts[0] === 'string') {
        return (formattedMessageParts[0] ||
            defaultMessage ||
            (hasValues ? id + " " + JSON.stringify(values) : id));
    }
    return formattedMessageParts;
}
exports.formatMessage = formatMessage;
function formatHTMLMessage(config, state, messageDescriptor, rawValues) {
    if (messageDescriptor === void 0) { messageDescriptor = { id: '' }; }
    if (rawValues === void 0) { rawValues = {}; }
    // Process all the values before they are used when formatting the ICU
    // Message string. Since the formatted message might be injected via
    // `innerHTML`, all String-based values need to be HTML-escaped.
    var escapedValues = Object.keys(rawValues).reduce(function (escaped, name) {
        var value = rawValues[name];
        escaped[name] = typeof value === 'string' ? utils_1.escape(value) : value;
        return escaped;
    }, {});
    return formatMessage(config, state, messageDescriptor, escapedValues);
}
exports.formatHTMLMessage = formatHTMLMessage;
