var request = require('request')
  , cheerio = require('cheerio')
  , async = require('async')
  , _ = require('underscore')
  , execTime = require('exec-time')
  ;



function getProfile (callback) {
  var profiler = execTime('Twitter get profile');

  profiler('Begin');

  request.get({ url: 'https://twitter.com/louischatriot' }, function (err, res, body) {
    var $
      , tweets
      ;

    if (err) { return callback(err); }

    profiler('Requested content', true);
    $ = cheerio.load(body);
    profiler('Loaded HTML with cheerio');

    tweets = $('a[data-element-term="tweet_stats"]').find('strong').html();
    console.log(tweets + " tweets");

    profiler('Extracted number of tweets');

    return callback(null);
  })
}


getProfile(function () {

});
