/**
 * Global static object to be shared with any module
 * Contains all global methods
 */

var redis = require('redis')
  , redisClient = redis.createClient()
  , config = require('./config')
  , prefix = "scraper:"
  ;


/**
 * Get from redis a global value
 * Callback signature: err, value
 */
function getGlobalValue (key, cb) {
  var keyInRedis = prefix + key
    , callback = cb || function () {}
    ;

  redisClient.select(config.redisDb, function () {
    redisClient.exists(keyInRedis, function (err, exists) {
      if (err) { return callback(err); }
      if (!exists) { return callback(null, undefined); }

      redisClient.get(keyInRedis, function (err, value) {
        if (err) { return callback(err); }
        return callback(null, value);
      });
    });
  });
}


/**
 * Set a global value in redis
 * Callback signature: err, value
 */
function setGlobalValue (key, value, ttl, cb) {
  var keyInRedis = prefix + key
    , callback;

  if (typeof ttl === 'function') {
    cb = ttl;
    ttl = null;
  }

  callback = cb || function () {};
  console.log('---- REDIS SET ----');

  redisClient.select(config.redisDb, function () {
    redisClient.set(keyInRedis, value, function (err) {
      console.log('---', err);
      if (err) { return callback(err); }

      if (!ttl) { return callback(null); }

      redisClient.expire(keyInRedis, ttl, function (err) {
        return callback(err);
      });
    });
  });
}


// Interface
module.exports.getGlobalValue = getGlobalValue;
module.exports.setGlobalValue = setGlobalValue;
