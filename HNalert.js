#! /usr/local/bin/node

var exec = require('child_process').exec
  , _ = require('underscore')
  , async = require('async')
  , mailer = require('./lib/mailer')
  , storage = require('./lib/storage.js')
  , patterns = ['summary', 'tldr', 'tl.dr', 'short.version'] // patterns should be escaped for Regex usage
  , MAX_PHANTOM_PROCESS = 5;

exec('phantomjs lib/HNFrontpageScraper.js ' + patterns.join(' '), function (err, stdout, stderr) {

  var output = JSON.parse(stdout)
    , options
    , valuesToSend = [] // data needed for the email templating
    , toSend // array of the items which matches the pattern but which havent been sent yet
    //, matches = output.matches
    , matches
    , articlePages = output.articles
    , HNCommentPages = output.HNCommentPages
    , i
    , articles = [];

    for (i = 0; i < HNCommentPages.length; i += 1) {
      articles.push({ articleLink: articlePages[i], HNCommentLink: HNCommentPages[i] });
    };


    async.mapLimit(
        articles
      , MAX_PHANTOM_PROCESS
      , function(article, callback) {
        var HNCommentLink = article.HNCommentLink
          , articleLink = article.articleLink;

        console.log('Processing', articleLink, HNCommentLink);

        async.series([
          function(cb){
            exec('phantomjs lib/HNCommentPageScraper.js ' + HNCommentLink + ' ' + patterns.join(' '), function (err, stdout, stderr) {
              if (err) {
                console.log('[CommentPage] STDOUT', stdout, 'stderr', stderr, err);
                cb(err);
              } else {
                var output = JSON.parse(stdout);
                console.log('Done Comments', output.title);
                cb(null, output);
              }
            });
          },
          function(cb){
            exec('phantomjs lib/basicPageScraper.js ' + articleLink + ' ' + patterns.join(' '),{ timeout: 30000}, function (err, stdout, stderr) {
              if (err) {
                console.log('[Article Page] STDOUT', stdout, 'stderr', stderr, err);
                cb(null, { alertArticle: false , articleLink: articleLink});
              } else {
                if (stdout) {
                  var output = JSON.parse(stdout);
                  console.log('Done article', articleLink);
                  cb(null, output);
                } else {
                  cb(null, { alertArticle: false , articleLink: articleLink});
                }
              }
            });
          }
        ],
        function(err, results){
          if (err) {
            callback(err);
          } else {
            callback(null, _.extend({},results[0],results[1]));
          }
        });


      }
      , function callback(err, results) {

        if (err) {
          console.log('Err', err);
          process.exit(0);
        }
        // Filter results that triggered the alert
        matches = _.filter(results, function (result) { return result.alertComment || result.alertArticle; });
        console.log('Matches', matches);
        storage.getKeys(function (err, replies) {
          if (err) {
            console.error('Error while getting the keys');
          } else {

            // Compute the difference between the matches that triggered the alert and
            // and the ones that have already been sent
            toSend = _.difference(_.pluck(matches, 'url'), replies);
            console.log('Tosend', toSend);
            toSend.forEach( function (element, i) {
              valuesToSend.push(_.findWhere(matches, { url: element }));
            });

            // Check if there is something to send
            if (toSend.length) {
              options = { values: { elements: valuesToSend
                                  , patterns: patterns }
                        , to: 'hello+test@tldr.io'
                        , type: 'alertScraper' };

              // Send mail
              mailer.sendMail(options, function () {
                // Update the items that have been sent
                toSend.forEach( function (element, i) {
                  storage.setKV(element, matches[i]);
                });
                process.exit(0);
              })
            } else {
              console.log('Nothing to be noticed');
              process.exit(0);
            }
          }
        });
      });

});

