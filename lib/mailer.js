var nodemailer = require('nodemailer')
  , h4e = require('h4e')
  , smtpTransport
  , matches;


smtpTransport = nodemailer.createTransport('SMTP',{
    host : 'smtp.mandrillapp.com',
    port : '587',
    auth: { user: process.env.MAILER_USERNAME
          , pass: process.env.MAILER_PWD
          }
});

console.log(process.env);

h4e.setup({ extension: 'mustache'
          , baseDir: 'emails' // this is relative to where you execute the script
          , toCompile: ['*'] });

function sendMail (options, successCb) {
  var to = 'meta+emergency@tldr.io'
    , from = 'tldr.io <hello@tldr.io>'
    , type = options.type
    , values = options.values || {}
    , mailOptions
    , successCb = successCb || function () {};

  mailOptions = { from: from
                , to: to
                , subject: '[Scraper Emergency] The following articles might contain summaries'
                , html: h4e.render(type, { values: values })
                };

  // Send mail with defined transport object. Log only if there is an error
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if(error) {
      console.log('Error sending email with type' + type, error);
      return;
    } else {
      console.log('Mail sent correctly');
      successCb();
    }
  });
};

module.exports.sendMail = sendMail;
