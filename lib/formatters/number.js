import { getNamedFormat, filterProps, createError } from '../utils';
const NUMBER_FORMAT_OPTIONS = [
    'localeMatcher',
    'style',
    'currency',
    'currencyDisplay',
    'unit',
    'unitDisplay',
    'useGrouping',
    'minimumIntegerDigits',
    'minimumFractionDigits',
    'maximumFractionDigits',
    'minimumSignificantDigits',
    'maximumSignificantDigits',
];
export function getFormatter({ locale, formats, onError, }, getNumberFormat, options = {}) {
    const { format } = options;
    let defaults = (format && getNamedFormat(formats, 'number', format, onError)) || {};
    const filteredOptions = filterProps(options, NUMBER_FORMAT_OPTIONS, defaults);
    return getNumberFormat(locale, filteredOptions);
}
export function formatNumber(config, getNumberFormat, value, options = {}) {
    try {
        return getFormatter(config, getNumberFormat, options).format(value);
    }
    catch (e) {
        config.onError(createError('Error formatting number.', e));
    }
    return String(value);
}
export function formatNumberToParts(config, getNumberFormat, value, options = {}) {
    try {
        return getFormatter(config, getNumberFormat, options).formatToParts(value);
    }
    catch (e) {
        config.onError(createError('Error formatting number.', e));
    }
    return [];
}
