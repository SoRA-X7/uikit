import $ from 'jquery';
import { getCssVar, hasPromise, query } from './index';

export { $ };
export { ajax } from 'jquery';

export function bind(fn, context) {
    return function (a) {
        var l = arguments.length;
        return l ? l > 1 ? fn.apply(context, arguments) : fn.call(context, a) : fn.call(context);
    };
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}

export function promise(executor) {

    if (hasPromise) {
        return new Promise(executor);
    }

    var def = $.Deferred();

    executor(def.resolve, def.reject);

    return def;
}

promise.resolve = function (value) {
    return promise(function (resolve) {
        resolve(value);
    });
};

promise.reject = function (value) {
    return promise(function (_, reject) {
        reject(value);
    });
};

promise.all = function (iterable) {
    return hasPromise
        ? Promise.all(iterable)
        : $.when.apply($, iterable);
};

export function classify(str) {
    return str.replace(/(?:^|[-_\/])(\w)/g, (_, c) => c ? c.toUpperCase() : '');
}

export function hyphenate(str) {
    return str
        .replace(/([a-z\d])([A-Z])/g, '$1-$2')
        .toLowerCase()
}

const camelizeRE = /-(\w)/g;

export function camelize(str) {
    return str.replace(camelizeRE, toUpper)
}

function toUpper(_, c) {
    return c ? c.toUpperCase() : ''
}

export function ucfirst(str) {
    return str.length ? toUpper(null, str.charAt(0)) + str.slice(1) : '';
}

var strPrototype = String.prototype;
var startsWithFn = strPrototype.startsWith || function (search) { return this.lastIndexOf(search, 0) === 0; };

export function startsWith(str, search) {
    return startsWithFn.call(str, search);
}

var endsWithFn = strPrototype.endsWith || function (search) { return this.substr(-1 * search.length) === search; };

export function endsWith(str, search) {
    return endsWithFn.call(str, search);
}

var includesFn = function (search) { return ~this.indexOf(search); };
var includesStr = strPrototype.includes || includesFn;
var includesArray = Array.prototype.includes || includesFn;

export function includes(obj, search) {
    return obj && (isString(obj) ? includesStr : includesArray).call(obj, search);
}

export const isArray = Array.isArray;

export function isFunction(obj) {
    return typeof obj === 'function';
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function isPlainObject(obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;
}

export function isWindow(obj) {
    return isObject(obj) && obj === obj.window;
}

export function isDocument(obj) {
    return isObject(obj) && obj.nodeType === 9;
}

export function isBoolean(value) {
    return typeof value === 'boolean';
}

export function isString(value) {
    return typeof value === 'string';
}

export function isNumber(value) {
    return typeof value === 'number';
}

export function isNumeric(value) {
    return isNumber(value) || isString(value) && !isNaN(value - parseFloat(value));
}

export function isUndefined(value) {
    return value === void 0;
}

export function isJQuery(obj) {
    return obj instanceof $;
}

export function isContextSelector(selector) {
    return isString(selector) && selector.match(/^[!>+-]/);
}

export function getContextSelectors(selector) {
    return isContextSelector(selector) && selector.split(/(?=\s[!>+-])/g).map(value => value.trim());
}

const contextSelectors = {'!': 'closest', '+': 'nextAll', '-': 'prevAll'};

export function toJQuery(element, context) {

    if (element === true) {
        return null;
    }

    try {

        if (context && isContextSelector(element) && element[0] !== '>') {

            var fn = contextSelectors[element[0]], selector = element.substr(1);

            context = $(context);

            if (fn === 'closest') {
                context = context.parent();
                selector = selector || '*';
            }

            element = context[fn](selector);

        } else {
            element = $(element, context);
        }

    } catch (e) {
        return null;
    }

    return element.length ? element : null;
}

export function toNode(element) {
    return element && (isJQuery(element) ? element[0] : element);
}

export function toNodes(element) {
    return isJQuery(element)
        ? element.toArray()
        : isArray(element)
            ? element
            : element
                ? [element]
                : [];
}

export function toBoolean(value) {
    return isBoolean(value)
        ? value
        : value === 'true' || value === '1' || value === ''
            ? true
            : value === 'false' || value === '0'
                ? false
                : value;
}

export function toNumber(value) {
    var number = Number(value);
    return !isNaN(number) ? number : false;
}

export function toFloat(value) {
    return parseFloat(value) || 0;
}

export function toList(value) {
    return isArray(value)
        ? value
        : isString(value)
            ? value.split(',').map(value => isNumeric(value)
                ? toNumber(value)
                : toBoolean(value.trim()))
            : [value];
}

var vars = {};

export function toMedia(value) {

    if (isString(value)) {
        if (value[0] === '@') {
            var name = `media-${value.substr(1)}`;
            value = vars[name] || (vars[name] = toFloat(getCssVar(name)));
        } else if (isNaN(value)) {
            return value;
        }
    }

    return value && !isNaN(value) ? `(min-width: ${value}px)` : false;
}

export function coerce(type, value, context) {

    if (type === Boolean) {
        return toBoolean(value);
    } else if (type === Number) {
        return toNumber(value);
    } else if (type === 'jQuery') {
        return query(value, context);
    } else if (type === 'list') {
        return toList(value);
    } else if (type === 'media') {
        return toMedia(value);
    }

    return type ? type(value) : value;
}

export function toMs(time) {
    return !time
        ? 0
        : endsWith(time, 'ms')
            ? toFloat(time)
            : toFloat(time) * 1000;
}

export function swap(value, a, b) {
    return value.replace(new RegExp(`${a}|${b}`, 'mg'), function (match) {
        return match === a ? b : a
    });
}

export const assign = Object.assign || function (target, ...args) {
    target = Object(target);
    for (var i = 0; i < args.length; i++) {
        var source = args[i];
        if (source !== null) {
            for (var key in source) {
                if (hasOwn(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

export function each(obj, cb) {
    if (isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            if (cb.call(obj[i], obj[i], i) === false) {
                break;
            }
        }
    } else {
        for (var key in obj) {
            if (cb.call(obj[key], obj[key], key) === false) {
                break;
            }
        }
    }
}

export function clamp(number, min = 0, max = 1) {
    return Math.min(Math.max(number, min), max);
}

export function noop() {}
