var should = require('chai').should(),
  moment = require('moment');

describe('yfm', function(){
  var yfm = require('../index');

  describe('split', function(){
    it('with data', function(){
      yfm.split([
        'foo',
        '---',
        'bar'
      ].join('\n')).should.eql({data: 'foo', content: 'bar'});
    });

    it('without data', function(){
      yfm.split([
        'foo',
        'bar'
      ].join('\n')).should.eql({content: 'foo\nbar'});
    });
  });

  describe('escape', function(){
    it('escape', function(){
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

  describe('parse', function(){
    it('only content', function(){
      var str = [
        'foo',
        'bar'
      ].join('\n');

      var data = yfm.parse(str);
      data._content.should.eql(str);
    });

    it('only content (with ---)', function(){
      var str = [
        'foo',
        '---',
        'str'
      ].join('\n');

      var data = yfm.parse(str);
      data._content.should.eql(str);
    });

    it('new style', function(){
      var str = [
        'layout: post',
        '---',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('new style (without content)', function(){
      var str = [
        'layout: post',
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('');
    });

    it('new style (trim)', function(){
      var str = [
        '',
        'layout: post',
        '',
        '---',
        '',
        '',
        '',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('new style (more than 3 dashes)', function(){
      var str = [
        'layout: post',
        '------',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style', function(){
      var str = [
        '---',
        'layout: post',
        '---',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style (without content)', function(){
      var str = [
        '---',
        'layout: post',
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('');
    });

    it('old style (trim)', function(){
      var str = [
        '---',
        '',
        'layout: post',
        '',
        '---',
        '',
        '',
        '',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('old style (more than 3 dashes)', function(){
      var str = [
        '----',
        'layout: post',
        '------',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data._content.should.eql('123');
    });

    it('with inline separator', function(){
      var str = [
        'layout: post',
        'title: This title including --------',
        '---',
        '123'
      ].join('\n');

      var data = yfm.parse(str);
      data.layout.should.eql('post');
      data.title.should.eql('This title including --------');
      data._content.should.eql('123');
    });

    it('with another separator', function(){
      var str = [
        'title: Hello World',
        '---',
        '',
        'Hello',
        '-----------------------------------'
      ].join('\n');

      var data = yfm.parse(str);
      data.title.should.eql('Hello World');
      data._content.should.eql('Hello\n-----------------------------------');
    });

    // Date parsing bug (issue #1)
    it('date', function(){
      var now = moment();

      var str = [
        'date: ' + now.format('YYYY-MM-DD HH:mm:ss'),
        '---'
      ].join('\n');

      var data = yfm.parse(str);
      parseInt(data.date.getTime() / 1000).should.eql(parseInt(now.valueOf() / 1000));
    });
  });

  describe('stringify', function(){
    it('with data', function(){
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

    it('without data', function(){
      var data = {
        _content: '123'
      };

      yfm.stringify(data).should.eql('123');
    });
  });
});