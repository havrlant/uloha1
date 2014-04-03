var express = require('express');
var path = require('path');
var util = require('util');
var getTrackRoute = require('../../routes/track');
var fsutil = require('../../utils/fsutil');
var assert = require('assert');
var fs = require('fs');

var getMockIo = function(path, readContent, writeContent) {
  return {
    writeFile: function(filepath, content, callback) {
      filepath.should.eql(path);
      content.should.eql(writeContent);
      callback();
    }, 

    readFile: function(filepath, callback) {
      filepath.should.eql(path);
      callback(undefined, readContent);
    }
  };
};

var getMockRedis = function(keyname, value) {
  return {
    incrby: function(key, intval, callback) {
      key.should.eql('count');
      intval.should.eql(10);
      callback();
    },
    save: function() {}
  };
};

describe('app', function() {
  describe('.get("/track", fn)', function() {
    it('should add query parameters to JSON', function(done) {
      var path = 'path';
      var mockIo = getMockIo(path, '[{"a":"1"}]', '[{"a":"1"},{"b":"2"}]');
      var request = {query: {"b": "2"}};
      var respond = {render: function() { done(); }};
      var next = function(err) {
        if (err) throw err;
      };
      var route = getTrackRoute(path, undefined, mockIo);
      route(request, respond, next);
    });

    it('should add query parameters to JSON and update Redis DB', function(done) {
      var path = 'path';
      var countValue = 10;
      var updatedJSON = util.format('[{"a":"1"},{"count":"%s"}]', countValue);
      var mockIo = getMockIo(path, '[{"a":"1"}]', updatedJSON);
      var mockRedis = getMockRedis('count', countValue);
      var request = {query: {"count": countValue.toString()}};
      var respond = {render: function() { done(); }};
      var next = function(err) {
        if (err) throw err;
      };
      var route = getTrackRoute(path, mockRedis, mockIo);
      route(request, respond, next);
    });

    it('should add query parameters to JSON and fail to update Redis DB because count is not a number', function(done) {
      var path = 'path';
      var countValue = "string";
      var updatedJSON = util.format('[{"a":"1"},{"count":"%s"}]', countValue);
      var mockIo = getMockIo(path, '[{"a":"1"}]', updatedJSON);
      var mockRedis = getMockRedis('count', countValue);
      var request = {query: {"count": countValue.toString()}};
      var respond = {render: function() { }};
      var next = function(err) {
        err.should.be.an.Error;
        done();
      };
      var route = getTrackRoute(path, mockRedis, mockIo);
      route(request, respond, next);
    });

    it('should fail because the readFile function returned non valid JSON', function(done) {
      var path = 'path';
      var countValue = "string";
      var mockIo = getMockIo(path, '[{"a":"1"}', undefined);
      var mockRedis = getMockRedis('count', countValue);
      var request = {query: {}};
      var respond = {render: function() { }};
      var next = function(err) {
        err.should.be.an.Error;
        done();
      };
      var route = getTrackRoute(path, undefined, mockIo);
      route(request, respond, next);
    });
  });
});