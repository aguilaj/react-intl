/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
import * as React from 'react';
import { Provider } from './injectIntl';
import { createError, DEFAULT_INTL_CONFIG, createFormatters, invariantIntlContext, createIntlCache, } from '../utils';
import areIntlLocalesSupported from 'intl-locales-supported';
import { formatNumber, formatNumberToParts } from '../formatters/number';
import { formatRelativeTime } from '../formatters/relativeTime';
import { formatDate, formatTime, formatDateToParts, formatTimeToParts, } from '../formatters/dateTime';
import { formatPlural } from '../formatters/plural';
import { formatMessage, formatHTMLMessage } from '../formatters/message';
import * as shallowEquals_ from 'shallow-equal/objects';
const shallowEquals = shallowEquals_.default || shallowEquals_;
function filterIntlConfig(config) {
    return {
        locale: config.locale,
        timeZone: config.timeZone,
        formats: config.formats,
        textComponent: config.textComponent,
        messages: config.messages,
        defaultLocale: config.defaultLocale,
        defaultFormats: config.defaultFormats,
        onError: config.onError,
    };
}
export default class IntlProvider extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.cache = createIntlCache();
        this.state = {
            cache: this.cache,
            intl: createIntl(filterIntlConfig(this.props), this.cache),
            prevConfig: filterIntlConfig(this.props),
        };
    }
    static getDerivedStateFromProps(props, { prevConfig, cache }) {
        const config = filterIntlConfig(props);
        if (!shallowEquals(prevConfig, config)) {
            return {
                intl: createIntl(config, cache),
                prevConfig: config,
            };
        }
        return null;
    }
    render() {
        invariantIntlContext(this.state.intl);
        return React.createElement(Provider, { value: this.state.intl }, this.props.children);
    }
}
IntlProvider.displayName = 'IntlProvider';
IntlProvider.defaultProps = DEFAULT_INTL_CONFIG;
/**
 * Create intl object
 * @param config intl config
 * @param cache cache for formatter instances to prevent memory leak
 */
export function createIntl(config, cache) {
    const formatters = createFormatters(cache);
    const resolvedConfig = Object.assign({}, DEFAULT_INTL_CONFIG, config);
    if (!resolvedConfig.locale ||
        !areIntlLocalesSupported(resolvedConfig.locale)) {
        const { locale, defaultLocale, onError } = resolvedConfig;
        if (typeof onError === 'function') {
            onError(createError(`Missing locale data for locale: "${locale}". ` +
                `Using default locale: "${defaultLocale}" as fallback.`));
        }
        // Since there's no registered locale data for `locale`, this will
        // fallback to the `defaultLocale` to make sure things can render.
        // The `messages` are overridden to the `defaultProps` empty object
        // to maintain referential equality across re-renders. It's assumed
        // each <FormattedMessage> contains a `defaultMessage` prop.
        resolvedConfig.locale = resolvedConfig.defaultLocale || 'en';
    }
    return Object.assign({}, resolvedConfig, { formatters, formatNumber: formatNumber.bind(null, resolvedConfig, formatters.getNumberFormat), formatNumberToParts: formatNumberToParts.bind(null, resolvedConfig, formatters.getNumberFormat), formatRelativeTime: formatRelativeTime.bind(null, resolvedConfig, formatters.getRelativeTimeFormat), formatDate: formatDate.bind(null, resolvedConfig, formatters.getDateTimeFormat), formatDateToParts: formatDateToParts.bind(null, resolvedConfig, formatters.getDateTimeFormat), formatTime: formatTime.bind(null, resolvedConfig, formatters.getDateTimeFormat), formatTimeToParts: formatTimeToParts.bind(null, resolvedConfig, formatters.getDateTimeFormat), formatPlural: formatPlural.bind(null, resolvedConfig, formatters.getPluralRules), formatMessage: formatMessage.bind(null, resolvedConfig, formatters), formatHTMLMessage: formatHTMLMessage.bind(null, resolvedConfig, formatters) });
}
