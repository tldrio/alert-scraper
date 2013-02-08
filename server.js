#! /usr/local/bin/node

var nodemailer = require('nodemailer')
  , h4e = require('h4e')
  , exec = require('child_process').exec
  , redis = require('redis')
  , _ = require('underscore')
  , client = redis.createClient()
  , fs = require("fs")
  , jquery = fs.readFileSync("./jquery.js").toString()
  , smtpTransport
  , matches;


smtpTransport = nodemailer.createTransport('SMTP',{
    host : 'smtp.mandrillapp.com',
    port : '587',
    auth: { user: process.env.MAILER_USERNAME
          , pass: process.env.MAILER_PWD
          }
});

h4e.setup({ extension: 'mustache'
          , baseDir: './emails'
          , toCompile: ['*'] });


function sendEmail (options, cb) {
  var to = 'hello+test@tldr.io'
    , from = 'tldr.io <hello@tldr.io>'
    , type = options.type
    , values = options.values || {}
    , mailOptions
    , cb = cb || function () {};

  mailOptions = { from: from
                , to: to
                , subject: 'Test'
                , html: h4e.render(type, { values: values })
                };

  // Send mail with defined transport object. Log only if there is an error
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if(error) {
      console.log('Error sending email with type' + type, error);
      return;
    }
    console.log('Mail sent correctly');
    cb();
  });
};



exec('phantomjs HNFrontpageScraper.js', function (err, stdout, stderr) {

  var res = JSON.parse(stdout)
    , options
    , valuesToSend = []
    , toSend
    , matches = res.matches;

  client.hkeys('scraper matches', function (err, replies) {
    toSend = _.difference(_.pluck(matches, 'title'), replies);
    toSend.forEach( function (element, i) {
      client.hset('scraper matches', element, JSON.stringify(matches[i]), redis.print);
      valuesToSend.push(matches[i]);
    });

    if (valuesToSend.length) {
      options = { values: { matches: valuesToSend }
                , type: 'alertScraper' }

      sendEmail(options, function () {process.exit(0);})
    } else {
      console.log('Nothing to be noticed');
      process.exit(0);
    }
  });
});

