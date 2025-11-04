// https://github.com/eemeli/yaml/blob/9cf06d2a62c6f591516f74bdbb8b0965e1961ebd/src/schema/yaml-1.1/timestamp.ts
// License: https://github.com/eemeli/yaml/blob/main/LICENSE
import type { ScalarTag } from 'yaml';
import { DateTime } from 'luxon';

/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal<B extends boolean>(str: string, asBigInt?: B) {
  const sign = str[0];
  const parts = sign === '-' || sign === '+' ? str.substring(1) : str;
  const num = (n: number | string) => {
    return asBigInt ? BigInt(n) as unknown as number : Number(n);
  };
  const res = parts
    .replace(/_/g, '')
    .split(':')
    .reduce((res, p) => (res * num(60)) + num(p), num(0));
  return (sign === '-' ? num(-1) * res : res) as B extends true
    ? number | bigint
    : number;
}

export function timestampFactory(defaultTimeZone: string) {
  const timestamp: ScalarTag & { test: RegExp } = {
    identify: value => value instanceof Date,
    default: true,
    tag: 'tag:yaml.org,2002:timestamp',

    // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
    // may be omitted altogether, resulting in a date format. In such a case, the time part is
    // assumed to be 00:00:00Z (start of day, UTC).
    test: RegExp(
      '^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' // YYYY-Mm-Dd
      + '(?:' // time is optional
      + '(?:t|T|[ \\t]+)' // t | T | whitespace
      + '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' // Hh:Mm:Ss(.ss)?
      + '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' // Z | +5 | -03:30
      + ')?$'
    ),

    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match) { throw new Error('!!timestamp expects a date, starting with yyyy-mm-dd'); }
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + '00').substring(1, 4)) : 0;

      let date = Date.UTC(
        year,
        month - 1,
        day,
        hour || 0,
        minute || 0,
        second || 0,
        millisec
      );
      const tz = match[8];
      if (tz) {
        // If a timezone is specified in the timestamp, use the timezone
        if (tz !== 'Z') {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30) d *= 60;
          date -= 60000 * d;
        }
      } else if (defaultTimeZone) {
        // Otherwise, use the timezone from Hexo settings
        // DO NOT read timezone from the machine, as this can lead to issues in CI environments
        // or when people from different countries collaborate on writing the blog
        date = DateTime.fromObject(
          {
            year,
            month,
            day,
            hour: hour || 0,
            minute: minute || 0,
            second: second || 0,
            millisecond: millisec || 0
          },
          { zone: defaultTimeZone }
        ).toMillis();
      }
      // If no timezone given, treat as UTC by default and do nothing

      return new Date(date);
    },

    stringify: ({ value }) => {
      // eslint-disable-next-line no-extra-parens
      return (value as Date)?.toISOString().replace(/(T00:00:00)?\.000Z$/, '') ?? '';
    }
  };
  return timestamp;
}
