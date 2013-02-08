var page = require('webpage').create();

// Add listener on the console.log event when evaluating code in the page
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.open('http://news.ycombinator.com', function () {

  page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
    page.includeJs('http://ajax.cdnjs.com/ajax/libs/underscore.js/1.4.2/underscore-min.js', function() {

      page.evaluate(function () {

        var selection = $('.title > a')
          , titles = _.pluck(selection, 'innerHTML')
          , r = /hipchat/i
          , matches = []
          , res
          , title;

        _.each(selection, function (element) {
          title = element.innerHTML;
          res = title.match(r);
          if (res) {
            matches.push({ title: title, link: element.href });
          }
        });

        console.log(JSON.stringify({matches: matches}));

      });
      phantom.exit(0);

    });
  });
});

