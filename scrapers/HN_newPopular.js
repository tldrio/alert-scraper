var request = require('request')
  , cheerio = require('cheerio')
  ;

/**
 * From a "xxx comments/discuss" string, get the number of comments
 */
function getNumberOfComment (s) {
  var res = parseInt(s, 10);

  if (isNaN(res)) {
    return 0;
  } else {
    return res;
  }
}


/**
 * Get all links on the frontpage with their rank and number of comments
 */
function getFrontpageLinks (callback) {
  request.get({ url: 'https://news.ycombinator.com/' }, function (err, res, body) {
    if (err) { return callback(err); }

    var $ = cheerio.load(body)
      , $links = $('td.title a')
      , $link, $comment
      , items = []
      , i
      ;

    for (i = 0; i < 30; i += 1) {
      $link = $($links[i]);
      $comment = $link.parent().parent().next().find('a:nth-child(3)');

      if ($comment.html()) {
        items.push({ rank: i
                   , link: $link.attr('href')
                   , comments: getNumberOfComment($comment.html())
                   });
      }
    }

    return callback(null, items);
  })
}







