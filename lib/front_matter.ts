import { Document, isMap, isScalar, parse as ymlParse } from 'yaml';
import { DateTime } from 'luxon';
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
  separator?: string,
  timeZone?: string
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
    result += stringifyYAML(obj, options.timeZone ?? 'UTC', {
      defaultStringType: 'PLAIN',
      singleQuote: true
    });
  }

  result += `${separator}\n${content}`;

  return result;
}

function stringifyYAML(obj, timeZone: string, options) {
  if (!DateTime.fromMillis(0, { zone: timeZone }).isValid) {
    throw new RangeError(`Invalid time zone: ${timeZone}`);
  }

  const keys = Object.keys(obj);
  const data = new Map();
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
      data.set(key, value);
    }
  }

  for (key of dateKeys) {
    data.set(key, obj[key]);
  }

  for (key of nullKeys) {
    data.set(key, null);
  }

  // Match the parser's timestamp schema so date-like strings and keys are
  // quoted, while Date values retain an explicit timezone for round trips.
  const timestamp = {
    ...timestampFactory(undefined),
    stringify: ({ value }) => {
      const dateTime = DateTime.fromJSDate(value as Date, { zone: timeZone });
      if (!dateTime.isValid) throw new RangeError('Invalid Date');
      // ISO offsets have minute precision; historical IANA offsets may not.
      if (!Number.isInteger(dateTime.offset)) {
        throw new RangeError(`Time zone offset has sub-minute precision: ${timeZone}`);
      }
      return dateTime.toISO();
    }
  };
  const doc = new Document(data, { customTags: [timestamp] });

  // Preserve the existing empty representation for top-level null values
  // without changing how nested nulls are serialized.
  if (isMap(doc.contents)) {
    for (const pair of doc.contents.items) {
      if (isScalar(pair.value) && pair.value.value === null) {
        pair.value.source = '';
      }
    }
  }

  return doc.toString(options);
}

function stringifyJSON(obj) {
  return JSON.stringify(obj, null, '  ')
    // Remove indention
    .replace(/\r?\n {2}/g, () => '\n')
    // Remove prefixing and trailing braces
    .replace(/^{\r?\n|}$/g, '');
}

export {
  parse,
  split,
  escapeYAML as escape,
  stringify
};
