import { getNamedFormat, filterProps, createError } from '../utils';
const RELATIVE_TIME_FORMAT_OPTIONS = ['numeric', 'style'];
function getFormatter({ locale, formats, onError, }, getRelativeTimeFormat, options = {}) {
    const { format } = options;
    const defaults = (!!format && getNamedFormat(formats, 'relative', format, onError)) || {};
    const filteredOptions = filterProps(options, RELATIVE_TIME_FORMAT_OPTIONS, defaults);
    return getRelativeTimeFormat(locale, filteredOptions);
}
export function formatRelativeTime(config, getRelativeTimeFormat, value, unit, options = {}) {
    if (!unit) {
        unit = 'second';
    }
    try {
        return getFormatter(config, getRelativeTimeFormat, options).format(value, unit);
    }
    catch (e) {
        config.onError(createError('Error formatting relative time.', e));
    }
    return String(value);
}
