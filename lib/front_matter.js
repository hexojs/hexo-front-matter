var yaml = require('js-yaml');
var util = require('util');
var isDate = util.isDate;
var rYFM = /^(?:-{3,}\s*\n+)?([\s\S]+?)(?:\n+-{3,})(?:\s*\n+([\s\S]*))?/;

function split(str){
  if (!rYFM.test(str)) return {content: str};

  var match = str.match(rYFM);
  var data = match[1];
  var content = match[2] || '';

  return {data: data, content: content};
}

function parse(str, options){
  var splitData = split(str);
  var raw = splitData.data;
  var content = splitData.content;

  if (!raw) return {_content: str};

  var data = yaml.load(escapeYAML(raw), options);

  if (typeof data !== 'object') return {_content: str};

  var keys = Object.keys(data);
  var key = '';
  var item;

  // Convert timezone
  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    item = data[key];

    if (isDate(item)){
      data[key] = new Date(item.getTime() + item.getTimezoneOffset() * 60 * 1000);
    }
  }

  data._content = content;
  return data;
}

function escapeYAML(str){
  return str.replace(/\n(\t+)/g, function(match, tabs){
    var result = '\n';

    for (var i = 0, len = tabs.length; i < len; i++){
      result += '  ';
    }

    return result;
  });
}

function stringify(obj, options){
  var content = obj._content || '';

  delete obj._content;

  var keys = Object.keys(obj);
  if (!keys.length) return content;

  var data = {};
  var nullKeys = [];
  var dateKeys = [];
  var i, len, key, value;

  for (i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    value = obj[key];

    if (value == null){
      nullKeys.push(key);
    } else if (isDate(value)){
      dateKeys.push(key);
    } else {
      data[key] = value;
    }
  }

  var result = yaml.dump(data, options);

  if (dateKeys.length){
    for (i = 0, len = dateKeys.length; i < len; i++){
      key = dateKeys[i];
      result += key + ': ' + formatDate(obj[key]) + '\n';
    }
  }

  if (nullKeys.length){
    for (i = 0, len = nullKeys.length; i < len; i++){
      result += nullKeys[i] + ':\n';
    }
  }

  result += '---\n' + content;

  return result;
}

function doubleDigit(num){
  return num < 10 ? '0' + num : num;
}

function formatDate(date){
  return date.getFullYear() + '-' +
    doubleDigit(date.getMonth() + 1) + '-' +
    doubleDigit(date.getDate()) + ' ' +
    doubleDigit(date.getHours()) + ':' +
    doubleDigit(date.getMinutes()) + ':' +
    doubleDigit(date.getSeconds());
}

exports = module.exports = parse;
exports.parse = parse;
exports.split = split;
exports.escape = escapeYAML;
exports.stringify = stringify;