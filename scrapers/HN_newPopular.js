var request = require('request')
  , cheerio = require('cheerio')
  ;

request.get({ url: 'https://news.ycombinator.com/' }, function (err, res, body) {
  var $ = cheerio.load(body)
    , $links = $('td.title a')
    , i
    ;

  console.log('---------------');
  console.log('---------------');
  console.log('---------------');

  for (i = 0; i < $links.length; i += 1) {
    console.log($($links[i]).attr('href'));
    console.log("===============");
  }


})
