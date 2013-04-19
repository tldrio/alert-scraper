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


request.get({ url: 'https://news.ycombinator.com/' }, function (err, res, body) {
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
      items.push({ number: i
                 , link: $link.attr('href')
                 , comments: getNumberOfComment($comment.html())
                 });
    }
  }


  console.log(items);


})
