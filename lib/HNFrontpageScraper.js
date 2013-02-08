var page = require('webpage').create()
  , system = require('system')
  // deep copy of args
  , patterns = system.args.slice(0);

// Removes the script name from args to get only the patterns
patterns.shift();

// Add listener on the console.log event when evaluating code in the page
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.open('http://news.ycombinator.com', function () {
  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
    page.includeJs('http://ajax.cdnjs.com/ajax/libs/underscore.js/1.4.2/underscore-min.js', function() {

      page.evaluate(function (patterns) {

        var $titles = $('.title > a') // select the titles tags
          , $HNCommentPages= $('.subtext > a[href*="item"]')
          , titles = _.pluck($titles, 'innerHTML') // get the title
          , HNCommentPages = _.pluck($HNCommentPages, 'href')
          , r = new RegExp('(' + patterns.join('|') + ')','i')
          , matches = [] // array of object containing titles + link of the matched patterns
          , title; // store the title at each iteration

        _.each($titles, function (element) {
          title = element.innerHTML;
          //if matches add to the result object
          if (title.match(r)) {
            matches.push({ title: title, link: element.href });
          }
        });

        console.log(JSON.stringify({ matches: matches, HNCommentPages: HNCommentPages }));

      }, patterns); // pass the patterns array in the sandboxed environment

      phantom.exit(0);
    });
  });
});

