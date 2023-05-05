'use strict';

const should = require('chai').should(); // eslint-disable-line

describe('Front-matter', () => {
  const yfm = require('..');

  describe('split', () => {
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
    it('date', () => {
      const current = new Date();
      const unixTime = current.getTime();
      // js-yaml only accept ISO 8601 format date string as valid date type.
      // Date.prototype.toJSON method automatically applied offset, so we need to revert that.
      const stringifyDateTime = new Date(current.getTime() - (current.getTimezoneOffset() * 60 * 1000)).toJSON();

      const str = [
        `date: ${stringifyDateTime}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str);
      parseInt(data.date.getTime() / 1000, 10).should.eql(parseInt(unixTime / 1000, 10));
    });
  });

  describe('stringify', () => {
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

      yfm.stringify(data, {mode: 'json'}).should.eql([
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

      yfm.stringify(data, {separator: '------'}).should.eql([
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

      yfm.stringify(data, {prefixSeparator: true}).should.eql([
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

      yfm.stringify(data, {separator: '------', prefixSeparator: true}).should.eql([
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
  });
});
