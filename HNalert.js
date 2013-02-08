#! /usr/local/bin/node

var exec = require('child_process').exec
  , _ = require('underscore')
  , mailer = require('./lib/mailer')
  , storage = require('./lib/storage.js')
  , patterns = ['jquery', 'bootstrap'];


exec('phantomjs lib/HNFrontpageScraper.js ' + patterns.join(' '), function (err, stdout, stderr) {

  var res = JSON.parse(stdout)
    , options
    , valuesToSend = [] // data needed for the email templating
    , toSend // array of the items which matches the pattern but which havent been sent yet
    , matches = res.matches;

  storage.getKeys(function (err, replies) {
    if (err) {
      console.error('Error while getting the keys');
    } else {
      // Compute the difference between the matches that triggered the alert and
      // and the ones that have already been sent
      toSend = _.difference(_.pluck(matches, 'title'), replies);
      toSend.forEach( function (element, i) {
        valuesToSend.push(matches[i]);
      });

      // Check if there is something to send
      if (toSend.length) {
        options = { values: { matches: valuesToSend
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

