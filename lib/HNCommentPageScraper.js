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
    console.log(msg);
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
    console.error(msgStack.join('\n'));
};


page.open(url, function () {
  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
    page.includeJs('http://ajax.cdnjs.com/ajax/libs/underscore.js/1.4.2/underscore-min.js', function() {

      page.evaluate(function (patterns, url) {

        var $comments = $('.comment font') // select the titles tags
          , title = $('.title > a').html()
          , r = new RegExp('(' + patterns.join('|') + ')','i')
          , matches = [] // array of object containing titles + link of the matched patterns
          , alert = false
          , comment;

        _.each($comments, function (element) {
          comment = element.innerHTML;
          //if matches set flag to true
          if (comment.match(r)) {
            alert = true;
            matches.push({ comment: comment });
          }
        });

        console.log(JSON.stringify({ alert: alert, url: url , title: title, matches: matches}));

      }, args, url); // pass the patterns array in the sandboxed environment

      phantom.exit(0);
    });
  });
});

