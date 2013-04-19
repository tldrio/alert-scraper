/**
 * Main Scraper script, responsible for scheduling and launching
 * the used modules
 */

var hnNewPopular = require('./scrapers/hnNewPopular');


// Check HN every 15 minutes
setInterval(hnNewPopular.launchRound, 15 * 60000);



