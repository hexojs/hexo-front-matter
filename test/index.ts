import * as yfm from '../lib/front_matter.ts';
import { DateTime } from 'luxon';

describe('Front-matter', () => {

  describe('split', () => {
    it('not string', () => {
      (() => {
        const str = [];

        yfm.split(str).should.throw(TypeError, 'str is required!');
      }).should.throw();
    });

    it('yaml mode', () => {
      const str = [
        '---',
        'foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: '---',
        prefixSeparator: true
      });
    });

    it('yaml mode - no content', () => {
      const str = [
        '---',
        'foo',
        '---'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: '',
        separator: '---',
        prefixSeparator: true
      });
    });

    it('yaml mode - content conflict', () => {
      const str = [
        '---',
        'foo',
        '---',
        'bar',
        '---',
        'baz'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar\n---\nbaz',
        separator: '---',
        prefixSeparator: true
      });
    });

    it('json mode', () => {
      const str = [
        ';;;',
        'foo',
        ';;;',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: ';;;',
        prefixSeparator: true
      });
    });

    it('json mode - no content', () => {
      const str = [
        ';;;',
        'foo',
        ';;;'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: '',
        separator: ';;;',
        prefixSeparator: true
      });
    });

    it('yaml mode: new', () => {
      const str = [
        'foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: '---',
        prefixSeparator: false
      });
    });

    it('yaml mode: new - no content', () => {
      const str = [
        'foo',
        '---'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: '',
        separator: '---',
        prefixSeparator: false
      });
    });

    it('yaml mode: new - content conflict', () => {
      const str = [
        'foo',
        '---',
        'bar',
        '---',
        'baz'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar\n---\nbaz',
        separator: '---',
        prefixSeparator: false
      });
    });

    it('json mode: new', () => {
      const str = [
        'foo',
        ';;;',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: ';;;',
        prefixSeparator: false
      });
    });

    it('json mode: new - no content', () => {
      const str = [
        'foo',
        ';;;'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: '',
        separator: ';;;',
        prefixSeparator: false
      });
    });

    it('without data', () => {
      const str = [
        'foo',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('unbalanced separator', () => {
      const str = [
        '------',
        'foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('long separator', () => {
      const str = [
        '------',
        'foo',
        '------',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: '------',
        prefixSeparator: true
      });
    });

    it('long separator: new', () => {
      const str = [
        'foo',
        '------',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar',
        separator: '------',
        prefixSeparator: false
      });
    });

    it('extra separator', () => {
      const str = [
        'foo',
        '---',
        'bar',
        '---',
        'baz'
      ].join('\n');

      yfm.split(str).should.eql({
        data: 'foo',
        content: 'bar\n---\nbaz',
        separator: '---',
        prefixSeparator: false
      });
    });

    it('inline separator', () => {
      const str = [
        '---foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('inline separator: new', () => {
      const str = [
        '---bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });
  });

  describe('escape', () => {
    it('not string', () => {
      (() => {
        yfm.escape([]).should.throw(TypeError, 'str is required!');
      }).should.throw();
    });

    it('escape', () => {
      yfm.escape([
        'foo',
        '\tbar',
        '\t\tbaz'
      ].join('\n')).should.eql([
        'foo',
        '  bar',
        '    baz'
      ].join('\n'));
    });
  });

  describe('parse', () => {
    it('not string', () => {
      (() => {
        const str = [];

        yfm.parse(str).should.throw(TypeError, 'str is required!');
      }).should.throw();
    });

    it('only content', () => {
      const str = [
        'foo',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    it('yaml', () => {
      const str = [
        'layout: post',
        '---',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        layout: 'post',
        _content: 'bar'
      });
    });

    it('json', () => {
      const str = [
        '"layout": false,',
        '"my_list": [',
        '  "one",',
        '  "two"',
        ']',
        ';;;',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        layout: false,
        my_list: ['one', 'two'],
        _content: 'bar'
      });
    });

    it('invalid yaml', () => {
      const str = [
        'layout',
        '---',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    it('invalid json', () => {
      const str = [
        'layout',
        ';;;',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    // Date parsing bug (issue #1)
    it('date - specified timezone', () => {
      const stringifyDateTime = '2025-01-01T12:00:00.000+08:00';

      const str = [
        `date: ${stringifyDateTime}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str);
      const dt = DateTime.fromISO(stringifyDateTime);
      data.date.getTime().should.eql(dt.toMillis());
    });

    it('date - default timezone from Hexo config', () => {
      const stringifyDateTime = '2025-01-01T12:00:00.000';
      const zone = 'Europe/Paris';

      const str = [
        `date: ${stringifyDateTime}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str, {
        defaultTimeZone: zone
      });
      const dt = DateTime.fromISO(stringifyDateTime, { zone });
      data.date.getTime().should.eql(dt.toMillis());
    });

    it('date - no timezone, fallback to UTC', () => {
      const stringifyDateTime = '2025-01-01T12:00:00.000';
      const zone = 'UTC';

      const str = [
        `date: ${stringifyDateTime}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str);
      const dt = DateTime.fromISO(stringifyDateTime, { zone });
      data.date.getTime().should.eql(dt.toMillis());
    });

    it('date - date only', () => {
      const stringifyDateTime = '2025-01-01';
      const zone = 'Europe/Paris';

      const str = [
        `date: ${stringifyDateTime}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str, {
        defaultTimeZone: zone
      });
      const dt = DateTime.fromISO(stringifyDateTime, { zone });
      data.date.getTime().should.eql(dt.toMillis());
    });
  });

  describe('stringify', () => {
    it('not string', () => {
      (() => {
        yfm.stringify(null).should.throw(TypeError, 'obj is required!');
      }).should.throw();
    });

    it('yaml', () => {
      const now = new Date().toJSON();

      const data = {
        layout: 'post',
        created: now,
        blank: null,
        _content: '123'
      };

      yfm.stringify(data).should.eql([
        'layout: post',
        `created: '${now}'`,
        'blank:',
        '---',
        '123'
      ].join('\n'));
    });

    it('json', () => {
      const now = new Date();

      const data = {
        layout: 'post',
        created: now,
        blank: null,
        tags: ['foo', 'bar'],
        _content: '123'
      };

      yfm.stringify(data, { mode: 'json' }).should.eql([
        '"layout": "post",',
        `"created": "${now.toISOString()}",`,
        '"blank": null,',
        '"tags": [',
        '  "foo",',
        '  "bar"',
        ']',
        ';;;',
        '123'
      ].join('\n'));
    });

    it('separator', () => {
      const data = {
        layout: 'post',
        _content: 'hello'
      };

      yfm.stringify(data, { separator: '------' }).should.eql([
        'layout: post',
        '------',
        'hello'
      ].join('\n'));
    });

    it('prefixSeparator', () => {
      const data = {
        layout: 'post',
        _content: 'hello'
      };

      yfm.stringify(data, { prefixSeparator: true }).should.eql([
        '---',
        'layout: post',
        '---',
        'hello'
      ].join('\n'));
    });

    it('prefixSeparator + custom separator', () => {
      const data = {
        layout: 'post',
        _content: 'hello'
      };

      yfm.stringify(data, { separator: '------', prefixSeparator: true }).should.eql([
        '------',
        'layout: post',
        '------',
        'hello'
      ].join('\n'));
    });

    it('without data', () => {
      const data = {
        _content: 'foo'
      };

      yfm.stringify(data).should.eql('foo');
    });

    it('with raw date', () => {
      const now = new Date('1995-12-17T03:24:00');

      const data = {
        layout: 'post',
        created: now,
        blank: null,
        _content: '123'
      };

      yfm.stringify(data).should.eql([
        'layout: post',
        `created: ${now.toISOString()}`,
        'blank:',
        '---',
        '123'
      ].join('\n'));
    });

    it('round trips front matter containing only dates or empty values', () => {
      const date = new Date('2026-01-02T03:04:05.123Z');
      const dateOutput = yfm.stringify({ date, _content: 'Hello' });
      dateOutput.should.eql(`date: ${date.toISOString()}\n---\nHello`);
      yfm.parse(dateOutput).should.eql({ date, _content: 'Hello' });

      const nullOutput = yfm.stringify({ title: null, missing: undefined, _content: 'Hello' });
      nullOutput.should.eql('title:\nmissing:\n---\nHello');
      yfm.parse(nullOutput).should.eql({ title: null, missing: null, _content: 'Hello' });
    });

    it('round trips special keys for dates and empty values', () => {
      const date = new Date('2026-01-02T03:04:05.000Z');
      const data = {
        title: 'x',
        '#k': null,
        'a: b': null,
        '2026-01-02': null,
        'date: key': date,
        'line\nbreak': date,
        _content: 'Hello'
      };
      const expected = { ...data };

      for (const options of [{}, { prefixSeparator: true, separator: '------' }]) {
        const output = yfm.stringify({ ...data }, options);
        yfm.parse(output).should.eql(expected);
      }
    });

    it('preserves date instants independently of the parsing timezone', () => {
      const date = new Date('2026-01-02T03:04:05.123Z');
      const output = yfm.stringify({ date, _content: '' });

      for (const defaultTimeZone of ['UTC', 'Asia/Shanghai', 'America/New_York']) {
        yfm.parse(output, { defaultTimeZone }).should.eql({ date, _content: '' });
      }
    });

    it('stringifies dates in the requested timezone, including nested dates', () => {
      const date = new Date('2025-01-01T04:00:00.123Z');
      const output = yfm.stringify({ date, nested: { date: new Date(date) }, _content: 'Hello' }, {
        timeZone: 'Asia/Shanghai'
      });

      output.should.contain('date: 2025-01-01T12:00:00.123+08:00');
      output.should.contain('  date: 2025-01-01T12:00:00.123+08:00');
      yfm.parse(output, { defaultTimeZone: 'America/New_York' })
        .should.eql({ date, nested: { date }, _content: 'Hello' });
    });

    it('uses the timezone offset at each date, including daylight saving time', () => {
      const winter = new Date('2025-01-01T12:00:00.000Z');
      const summer = new Date('2025-07-01T12:00:00.000Z');
      const output = yfm.stringify({ winter, summer, _content: '' }, {
        timeZone: 'America/New_York'
      });

      output.should.contain('winter: 2025-01-01T07:00:00.000-05:00');
      output.should.contain('summer: 2025-07-01T08:00:00.000-04:00');
      yfm.parse(output).should.eql({ winter, summer, _content: '' });
    });

    it('supports timezone offsets with fractional hours', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const output = yfm.stringify({ date, _content: '' }, { timeZone: 'Asia/Kathmandu' });

      output.should.eql('date: 2025-01-01T05:45:00.000+05:45\n---\n');
      yfm.parse(output).should.eql({ date, _content: '' });
    });

    it('serializes offsets below 30 minutes without changing the parser', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const output = yfm.stringify({ date, _content: '' }, { timeZone: 'UTC+0:15' });

      output.should.eql('date: 2025-01-01T00:15:00.000+00:15\n---\n');
    });

    it('rejects historical offsets that include seconds', function() {
      const date = new Date('1900-01-01T00:00:00.000Z');
      const timeZone = 'Europe/Paris';
      if (Number.isInteger(DateTime.fromJSDate(date, { zone: timeZone }).offset)) this.skip();

      (() => yfm.stringify({ date, _content: '' }, { timeZone }))
        .should.throw(RangeError, 'Time zone offset has sub-minute precision');
    });

    it('rejects invalid timezones and invalid dates in YAML mode', () => {
      (() => yfm.stringify({ date: new Date(), _content: '' }, { timeZone: 'Invalid/Zone' }))
        .should.throw(RangeError, 'Invalid time zone');
      (() => yfm.stringify({ date: new Date(NaN), _content: '' }))
        .should.throw(RangeError, 'Invalid Date');
    });

    it('leaves JSON date serialization in UTC regardless of the timezone option', () => {
      const date = new Date('2025-01-01T04:00:00.123Z');
      const output = yfm.stringify({ date, _content: '' }, {
        mode: 'json',
        timeZone: 'Asia/Shanghai'
      });

      output.should.eql('"date": "2025-01-01T04:00:00.123Z"\n;;;\n');
    });

    it('quotes date-like strings and keeps nested null formatting', () => {
      const date = new Date('2026-01-02T03:04:05.123Z');
      const data = {
        dateText: '2026-01-02',
        nested: { date, blank: null },
        blank: null,
        _content: 'Hello'
      };
      const output = yfm.stringify({ ...data });

      output.should.contain('dateText: \'2026-01-02\'');
      output.should.contain('  blank: null');
      output.should.contain('\nblank:\n');
      yfm.parse(output).should.eql(data);
    });
  });
});
