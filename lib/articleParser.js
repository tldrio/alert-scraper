var config = require('./config')
  , request = require('request')
  ;


/**
 * Callback signature: err, wordCount
 */
function getArticleWordCount (url, callback) {
  var uri = 'http://readability.com/api/content/v1/parser?url=' + tldr.originalUrl + '&token=' + config.readability.token;

  request.get({ uri: uri }, function (error, response, body) {
    var resJSON, articleWordCount;

    if (error) {
      console.log({ level: 40, message: 'Error with the Readability API', error: error });
      return callback(error);
    }

    try {
      resJSON = JSON.parse(body);
      articleWordCount = resJSON.word_count;
    } catch (e) {
      articleWordCount = 863;   // Couldn't process it, use default value
    }

    articleWordCount = Math.max(articleWordCount, 275);   // No article can be smaller than this, must be a bug

    if (!articleWordCount || isNaN(articleWordCount)) {
      console.log({ level: 40, message: 'Response from the Readability API strange', body: body });
      return callback(error);
    }

    return callback(null, articleWordCount);
  });
}


// Interface
module.exports.getArticleWordCount = getArticleWordCount;
