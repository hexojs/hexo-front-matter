'use strict';

const should = require('chai').should(); // eslint-disable-line
const moment = require('moment');

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
      const now = moment();

      const str = [
        `date: ${now.format('YYYY-MM-DD HH:mm:ss')}`,
        '---'
      ].join('\n');

      const data = yfm.parse(str);
      parseInt(data.date.getTime() / 1000, 10).should.eql(parseInt(now.valueOf() / 1000, 10));
    });
  });

  describe('stringify', () => {
    it('yaml', () => {
      const now = new Date();

      const data = {
        layout: 'post',
        created: now,
        blank: null,
        _content: '123'
      };

      yfm.stringify(data).should.eql([
        'layout: post',
        `created: ${moment(now).format('YYYY-MM-DD HH:mm:ss')}`,
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
