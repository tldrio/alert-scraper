var request = require('request')
  , cheerio = require('cheerio')
  , async = require('async')
  , _ = require('underscore')
  , globals = require('../lib/globals')
  , mailer = require('../lib/mailer')
  , maxRank = 10
  , maxComments = 6
  , minWords = 500
  ;

/**
 * From a "xxx comments/discuss" string, get the number of comments
 */
function getNumberOfComment (s) {
  var res = parseInt(s, 10);

  if (isNaN(res)) {
    return 0;
  } else {
    return res;
  }
}


/**
 * Mark a url as treated so that we don't send the same alert twice
 * TTL of one day since after one day the whole frontpage is changed
 * and we don't need to use too much RAM
 */
function markAsTreated (url) {
  globals.setGlobalValue('HNNP:' + url, 'true', 24 * 3600);
}


/**
 * Check whether an url was treated
 * Callback signature: true/false
 */
function isTreated (url, callback) {
  //if (typeof url !== 'string') { url = url.url; }   // Its in fact an item object

  globals.getGlobalValue('HNNP:' + url, function (err, value) {
    if (err) { return callback(false); }

    return callback(value === 'true');
  });
}


/**
 * Get all links on the frontpage with their rank and number of comments
 */
function getFrontpageLinks (callback) {
  request.get({ url: 'https://news.ycombinator.com/' }, function (err, res, body) {
    if (err) { return callback(err); }

    var $ = cheerio.load(body)
      , $links = $('td.title a')
      , $link, $comment
      , items = []
      , i
      ;

    for (i = 0; i < 30; i += 1) {
      $link = $($links[i]);
      $comment = $link.parent().parent().next().find('a:nth-child(3)');

      if ($comment.html()) {
        items.push({ rank: i
                   , url: $link.attr('href')
                   , title: $link.html()
                   , comments: getNumberOfComment($comment.html())
                   });
      }
    }

    return callback(null, items);
  })
}

/**
 * Get the promising articles
 */
function getPromisingArticles (callback) {
  getFrontpageLinks(function (err, items) {
    var i;

    items = _.filter(items, function (i) { return i.rank <= maxRank; });
    items = _.filter(items, function (i) { return i.comments <= maxComments; });

    async.waterfall([
      function (cb) {   // Filter out all urls already treated
        var res = [];
        async.each(items
        , function (i, _cb) {
            isTreated(i.url, function (treated) {
              if (! treated) { res.push(i); }
              return _cb();
            })
          }
        , function () { items = res; return cb(); });
      }
      , function (cb) {   // Mark all urls as treated
        items.forEach(function (i) {
          markAsTreated(i.url);
        });
        return cb();
      }
      , function (cb) {   // Only select the articles with a minimum article word count  /* DISABLED FOR NOW */
        var res = [];
        async.each(items
        , function (i, _cb) {
          res.push(i);
          return _cb();
        }
        , function () { items = res; return cb(); });
      }
      ], function () { return callback(null, items); });
  });
}


/**
 * Actually launch a round of analysis
 */
function launchRound() {
  console.log({ level: 20, message: 'Launch the HN new popular scraper' });
  getPromisingArticles(function (err, items) {
    items.forEach(function (i) {
      console.log({ level: 30, message: '[HN new popular] Sent alert for url ' + i.url });
      mailer.sendMail({ type: 'hnNewPopular', values: i });
    });
  });
}


// Interface
module.exports.launchRound = launchRound;
