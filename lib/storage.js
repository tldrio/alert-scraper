var redis = require('redis')
  , _ = require('underscore')
  , client
  , prefix = 'tldr-scraper'
  , url = require('url')
  , redisToGo;

if (process.env.REDISTOGO_URL) {
  redisToGo = url.parse(process.env.REDISTOGO_URL);
  client = redis.createClient(redisToGo.port, redisToGo.hostname);
  client.auth(redisToGo.auth.split(":")[1]);
} else {
  client = require("redis").createClient();
}

function hset (key, value) {
  client.hset(prefix, key, JSON.stringify(value), redis.print);
}

function hkeys (callback) {
  client.hkeys(prefix, callback);
}

module.exports.setKV = hset;
module.exports.getKeys = hkeys;
