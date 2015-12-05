'use strict';

var should = require('chai').should(); // eslint-disable-line
var moment = require('moment');

describe('Front-matter', function() {
  var yfm = require('..');

  describe('split', function() {
    it('yaml mode', function() {
      var str = [
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

    it('json mode', function() {
      var str = [
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

    it('yaml mode: new', function() {
      var str = [
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

    it('json mode: new', function() {
      var str = [
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

    it('without data', function() {
      var str = [
        'foo',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('unbalanced separator', function() {
      var str = [
        '------',
        'foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('long separator', function() {
      var str = [
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

    it('long separator: new', function() {
      var str = [
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

    it('extra separator', function() {
      var str = [
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

    it('inline separator', function() {
      var str = [
        '---foo',
        '---',
        'bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });

    it('inline separator: new', function() {
      var str = [
        '---bar'
      ].join('\n');

      yfm.split(str).should.eql({
        content: str
      });
    });
  });

  describe('escape', function() {
    it('escape', function() {
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

  describe('parse', function() {
    it('only content', function() {
      var str = [
        'foo',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    it('yaml', function() {
      var str = [
        'layout: post',
        '---',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        layout: 'post',
        _content: 'bar'
      });
    });

    it('json', function() {
      var str = [
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

    it('invalid yaml', function() {
      var str = [
        'layout',
        '---',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    it('invalid json', function() {
      var str = [
        'layout',
        ';;;',
        'bar'
      ].join('\n');

      yfm.parse(str).should.eql({
        _content: str
      });
    });

    // Date parsing bug (issue #1)
    it('date', function() {
      var now = moment();

      var str = [
        'date: ' + now.format('YYYY-MM-DD HH:mm:ss'),
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      parseInt(data.date.getTime() / 1000, 10).should.eql(parseInt(now.valueOf() / 1000, 10));
    });
  });

  describe('stringify', function() {
    it('yaml', function() {
      var now = new Date();

      var data = {
        layout: 'post',
        created: now,
        blank: null,
        _content: '123'
      };

      yfm.stringify(data).should.eql([
        'layout: post',
        'created: ' + moment(now).format('YYYY-MM-DD HH:mm:ss'),
        'blank:',
        '---',
        '123'
      ].join('\n'));
    });

    it('json', function() {
      var now = new Date();

      var data = {
        layout: 'post',
        created: now,
        blank: null,
        tags: ['foo', 'bar'],
        _content: '123'
      };

      yfm.stringify(data, {mode: 'json'}).should.eql([
        '"layout": "post",',
        '"created": "' + now.toISOString() + '",',
        '"blank": null,',
        '"tags": [',
        '  "foo",',
        '  "bar"',
        ']',
        ';;;',
        '123'
      ].join('\n'));
    });

    it('separator', function() {
      var data = {
        layout: 'post',
        _content: 'hello'
      };

      yfm.stringify(data, {separator: '------'}).should.eql([
        'layout: post',
        '------',
        'hello'
      ].join('\n'));
    });

    it('prefixSeparator', function() {
      var data = {
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

    it('prefixSeparator + custom separator', function() {
      var data = {
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

    it('without data', function() {
      var data = {
        _content: 'foo'
      };

      yfm.stringify(data).should.eql('foo');
    });
  });
});
