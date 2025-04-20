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
        `created: ${now}`,
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
        'created: 1995-12-17 03:24:00',
        'blank:',
        '---',
        '123'
      ].join('\n'));
    });
  });
});
