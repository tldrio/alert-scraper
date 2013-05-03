var request = require('request')
  , cheerio = require('cheerio')
  , async = require('async')
  , _ = require('underscore')
  , execTime = require('exec-time')
  , profiler = new execTime('Twitter get profile')
  ;



function getProfile (callback) {
  profiler.beginProfiling();

  request.get({ url: 'https://twitter.com/louischatriot' }, function (err, res, body) {
    var $
      , tweets
      ;

    if (err) { return callback(err); }

    profiler.step('Requested content');
    profiler.resetTimers();
    $ = cheerio.load(body);
    profiler.step('Loaded HTML with cheerio');

    tweets = $('a[data-element-term="tweet_stats"]').find('strong').html();
    console.log(tweets + " tweets");

    profiler.step('Extracted number of tweets');

    return callback(null);
  })
}


getProfile(function () {

});
