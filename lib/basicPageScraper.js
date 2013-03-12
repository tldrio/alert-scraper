var page = require('webpage').create()
  , system = require('system')
  // deep copy of args
  , args = system.args.slice(0)
  , url;

// Removes the script name from args to get only the patterns
args.shift();
url = args.shift();

// Add listener on the console.log event when evaluating code in the page
page.onConsoleMessage = function (msg) {
  try {
    var obj = JSON.parse(msg);
    if (obj.articleLink) {
      console.log(msg);
    }
  } catch(e) {
    // Do nothing. Log is not JSON so we discard it
  }
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    //console.error(msgStack.join('\n'));
    //console.log(JSON.stringify({ alertArticle: false, articleLink: url, error: msg }));
};


page.open(url, function () {
  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
    page.includeJs('http://ajax.cdnjs.com/ajax/libs/underscore.js/1.4.2/underscore-min.js', function() {

      page.evaluate(function (patterns, url) {

        patterns.join('|');
        var r = new RegExp('(' + patterns.join('|') + ')','i')
          , alertArticle = false;

        if ($('body').html().match(r)) {
          alertArticle = true;
        }

        console.log(JSON.stringify({ alertArticle: alertArticle, articleLink: url }));

      }, args, url); // pass the patterns array in the sandboxed environment

      phantom.exit(0);
    });
  });
});
