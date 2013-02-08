#! /usr/local/bin/node

var exec = require('child_process').exec
  , _ = require('underscore')
  , async = require('async')
  , mailer = require('./lib/mailer')
  , storage = require('./lib/storage.js')
  , patterns = ['summary', 'tldr', 'tl.dr'] // patterns should be escaped for Regex usage
  , MAX_PHANTOM_PROCESS = 5;

exec('phantomjs lib/HNFrontpageScraper.js ' + patterns.join(' '), function (err, stdout, stderr) {

  var output = JSON.parse(stdout)
    , options
    , valuesToSend = [] // data needed for the email templating
    , toSend // array of the items which matches the pattern but which havent been sent yet
    //, matches = output.matches 
    , matches
    , HNCommentPages = output.HNCommentPages;

    async.mapLimit(
        HNCommentPages
      , MAX_PHANTOM_PROCESS
      , function(HNCommentLink, callback) {

        exec('phantomjs lib/HNCommentPageScraper.js ' + HNCommentLink + ' ' + patterns.join(' '), function (err, stdout, stderr) {
          if (err) {
            console.log('STDOUT', stdout, 'stderr', stderr, err);
            callback(err);
          } else {
            var output = JSON.parse(stdout);
            console.log('Done', output.title);
            callback(null, output);
          }
        });
      }
      , function callback(err, results) {

        if (err) {
          console.log('Err', err);
          process.exit(0);
        }
        // Filter results that triggered the alert
        matches = _.filter(results, function (result) { return result.alert; });
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
              valuesToSend.push(matches[i]);
            });

            // Check if there is something to send
            if (toSend.length) {
              options = { values: { elements: valuesToSend
                                  , patterns: patterns }
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

