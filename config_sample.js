var config = {};

config.path = "/PATH/TO/PROJECT/ml-sem-taxonomy/"; // include trailing "/"

config.host = "localhost";

config.database = {
  "name": "ml-sem-taxonomy",
  "port": 8562
};

config.auth = {
  user: 'ML_USER',
  pass: 'ML_PASSWORD',
  sendImmediately: false
};

config.databaseSetup = {
  "database-name": config.database.name,
  "triple-index": true
};

config.forestSetup = {
  "forest-name": config.database.name + '-1',
  "database": config.database.name
}

config.restSetup = {
  "rest-api": {
    "name": config.database.name + "-rest",
    "database": config.database.name,
    "modules-database": config.database.name + "-modules",
    "port": config.database.port,
    "error-format": "json"
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
