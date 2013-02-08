var redis = require('redis')
  , _ = require('underscore')
  , client = redis.createClient()
  , prefix = 'tldr-scraper';

function hset (key, value) {
  client.hset(prefix, key, JSON.stringify(value), redis.print);
}

function hkeys (callback) {
  client.hkeys(prefix, callback);
}

module.exports.setKV = hset;
module.exports.getKeys = hkeys;
