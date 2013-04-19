var env = process.env.NODE_ENV || 'development'
  // Common config parameters
  , config = {
      dbHost: 'localhost'
    , dbPort: 27017
    , redisDb: 0
    , templatesDir: 'templates'
    , nodeRedisPubsub: { port: 6379 }
    , readability: { token: "74b0e2e2c47c71f2c6065531d64f314894f91d22"
                   , app: "tldr.io"
                   }
  };

switch(env) {
  case 'development':
    config.env = 'development';
    config.dbName = 'dev-db';
    break;

  case 'production':
    config.env = 'production';
    config.dbName = 'prod-db';
    break;
}


module.exports = config;
