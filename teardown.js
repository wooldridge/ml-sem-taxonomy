var config = require('./config'),
    rp = require('request-promise');

function handleError(err) {
  if (err.error &&
      err.error.errorResponse &&
      err.error.errorResponse.message) {
    console.log('Error: ' + err.error.errorResponse.message);
  } else {
    console.log(JSON.stringify(err, null, 2));
  }
}

function deleteREST() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/v1/rest-apis/' + config.database.name + "-rest" +
         '?include=content&include=modules',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance deleted: ' + config.database.name + "-rest");
    })
    .catch(function (err) {
      handleError(err)
    });
}

function start() {
  deleteREST();
}

start();
