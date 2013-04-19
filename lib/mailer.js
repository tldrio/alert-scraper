var nodemailer = require('nodemailer')
  , h4e = require('h4e')
  , smtpTransport
  , subjects
  ;

smtpTransport = nodemailer.createTransport('SMTP',{
    host : 'smtp.mandrillapp.com',
    port : '587',
    auth: { user: process.env.MAILER_USERNAME
          , pass: process.env.MAILER_PWD
          }
});

h4e.setup({ extension: 'mustache'
          , baseDir: 'templates/emails' // this is relative to where you execute the script
          , toCompile: ['*'] });

subjects = { hnNewPopular: '[HN New Popular] A new potential has appeared!'
};

function sendMail (options, cb) {
  var to = 'meta+emergency@tldr.io'
    , from = 'tldr.io <hello@tldr.io>'
    , type = options.type
    , values = options.values || {}
    , mailOptions
    , callback = cb || function () {};

  mailOptions = { from: from
                , to: to
                , subject: h4e.render(subjects[type] || 'No title defined for this email ...', { values: values })
                , html: h4e.render(type, { values: values })
                };

  // Send mail with defined transport object. Log only if there is an error
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      console.log('Error sending email with type' + type, error);
      return callback(error);
    } else {
      return callback();
    }
  });
};

module.exports.sendMail = sendMail;
