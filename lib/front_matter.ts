import { parse as ymlParse, stringify as ymlStringify } from 'yaml';
import { timestampFactory } from './timestamp';
const rPrefixSep = /^(-{3,}|;{3,})/;
const rFrontMatter = /^(-{3,}|;{3,})\r?\n([\s\S]+?)\r?\n\1\r?\n?([\s\S]*)/;
const rFrontMatterNew = /^([\s\S]+?)\r?\n(-{3,}|;{3,})\r?\n?([\s\S]*)/;

function split(str: string) {
  if (typeof str !== 'string') throw new TypeError('str is required!');

  const matchOld = str.match(rFrontMatter);
  if (matchOld) {
    return {
      data: matchOld[2],
      content: matchOld[3] || '',
      separator: matchOld[1],
      prefixSeparator: true
    };
  }

  if (rPrefixSep.test(str)) return { content: str };

  const matchNew = str.match(rFrontMatterNew);

  if (matchNew) {
    return {
      data: matchNew[1],
      content: matchNew[3] || '',
      separator: matchNew[2],
      prefixSeparator: false
    };
  }

  return { content: str };
}

interface ParseOptions {
  defaultTimeZone?: string;
}

function parse(str: string, options: ParseOptions = {}) {
  if (typeof str !== 'string') throw new TypeError('str is required!');

  const splitData = split(str);
  const raw = splitData.data;

  if (!raw) return { _content: str };

  let data;

  if (splitData.separator.startsWith(';')) {
    data = parseJSON(raw);
  } else {
    data = parseYAML(raw, options);
  }

  if (!data) return { _content: str };

  data._content = splitData.content;
  return data;
}

function parseYAML(str, options: ParseOptions) {
  const result = ymlParse(escapeYAML(str), {
    customTags: [timestampFactory(options.defaultTimeZone)]
  });
  if (typeof result !== 'object') return;

  return result;
}

function parseJSON(str) {
  try {
    return JSON.parse(`{${str}}`);
  } catch {
    return; // eslint-disable-line
  }
}

function escapeYAML(str: string) {
  if (typeof str !== 'string') throw new TypeError('str is required!');

  return str.replace(/\r?\n(\t+)/g, (match, tabs) => {
    let result = '\n';

    for (let i = 0, len = tabs.length; i < len; i++) {
      result += '  ';
    }

    return result;
  });
}

interface StringifyOptions {
  mode?: 'json' | '',
  prefixSeparator?: boolean,
  separator?: string
}

function stringify(obj, options: StringifyOptions = {}) {
  if (!obj) throw new TypeError('obj is required!');

  const { _content: content = '' } = obj;
  delete obj._content;

  if (!Object.keys(obj).length) return content;

  const { mode, prefixSeparator } = options;
  const separator = options.separator || (mode === 'json' ? ';;;' : '---');
  let result = '';

  if (prefixSeparator) result += `${separator}\n`;

  if (mode === 'json') {
    result += stringifyJSON(obj);
  } else {
    result += stringifyYAML(obj, {
      defaultStringType: 'PLAIN',
      singleQuote: true
    });
  }

  result += `${separator}\n${content}`;

  return result;
}

function stringifyYAML(obj, options) {
  const keys = Object.keys(obj);
  const data = {};
  const nullKeys = [];
  const dateKeys = [];
  let key, value, i, len;

  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    value = obj[key];

    if (value == null) {
      nullKeys.push(key);
    } else if (value instanceof Date) {
      dateKeys.push(key);
    } else {
      data[key] = value;
    }
  }

  let result = ymlStringify(data, options);

  if (dateKeys.length) {
    for (i = 0, len = dateKeys.length; i < len; i++) {
      key = dateKeys[i];
      result += `${key}: ${formatDate(obj[key])}\n`;
    }
  }

  if (nullKeys.length) {
    for (i = 0, len = nullKeys.length; i < len; i++) {
      result += `${nullKeys[i]}:\n`;
    }
  }

  return result;
}

function stringifyJSON(obj) {
  return JSON.stringify(obj, null, '  ')
    // Remove indention
    .replace(/\r?\n {2}/g, () => '\n')
    // Remove prefixing and trailing braces
    .replace(/^{\r?\n|}$/g, '');
}

function doubleDigit(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())} ${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}:${doubleDigit(date.getSeconds())}`;
}

export {
  parse,
  split,
  escapeYAML as escape,
  stringify
};
