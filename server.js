var config = require('./config'),
    rp = require('request-promise'),
    express = require('express');

// Set up EXPRESS
var app = express(),
    port = config.server.port,
    router = express.Router();

app.use(express.static(__dirname + '/app/'));

// Log requests
router.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});

var auth = {
  user: config.auth.user,
  pass: config.auth.pass,
  sendImmediately: false
};

// /v1/search POST
app.get('/search', function(req, res){
  var q = req.query.q;
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/search';
  var body = {
    "query": {
      "queries": [{
        "term-query": {
          "text": [ q ]
        },
        "collection-query": {
          "uri": [ "docs" ]
        }
      }]
    }
  };

  var options = {
    method: "POST",
    url: url,
    body: JSON.stringify(body),
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (response) {
      console.log(JSON.stringify(response, null, 2));
      res.json(response);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });

});

// /v1/graphs/sparql POST
app.get('/top', function(req, res){
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var body =  'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
              'SELECT ?concept ?label ?concept2 (sum(?count) as ?num) ' +
              'WHERE ' +
              '{ ' +
              '  ?concept skos:topConceptOf ?o . ' +
              '  ?concept skos:prefLabel ?label . ' +
              '  OPTIONAL { ' +
              '    ?concept skos:narrower ?concept2 . ' +
              '    BIND(IF(?concept2 != "", 1, 0) AS ?count) ' +
              '  } . ' +
              '} ' +
              'GROUP BY ?concept ' +
              'ORDER BY ?label ';

  var options = {
    method: "POST",
    url: url,
    body: body,
    headers: {
      'Content-Type': 'application/sparql-query'
    },
    auth: auth
  };
  rp(options)
    .then(function (response) {
      res.send(response);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });

});

// /v1/graphs/sparql POST
app.get('/broader', function(req, res){
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var q = req.query.q;
  var body =  'PREFIX ex: <http://example.org/> ' +
              'PREFIX wb: <http://vocabulary.worldbank.org/taxonomy/> ' +
              'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
              'SELECT ?concept ?label ' +
              'WHERE ' +
              '{ ' +
              '  wb:' + q + ' skos:broader ?concept . ' +
              '  ?concept skos:prefLabel ?label . ' +
              '} ' +
              'ORDER BY ?label';

  var options = {
    method: "POST",
    url: url,
    body: body,
    headers: {
      'Content-Type': 'application/sparql-query'
    },
    auth: auth
  };
  rp(options)
    .then(function (response) {
      res.send(response);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });

});

// /v1/graphs/sparql POST
app.get('/narrower', function(req, res){
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var q = req.query.q;
  var body =  'PREFIX ex: <http://example.org/> ' +
              'PREFIX wb: <http://vocabulary.worldbank.org/taxonomy/> ' +
              'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
              'SELECT ?concept ?label $concept2 (sum(?count) as ?num)  ' +
              'WHERE ' +
              '{ ' +
              '  wb:' + q + ' skos:narrower ?concept . ' +
              '  ?concept skos:prefLabel ?label . ' +
              '  OPTIONAL { ' +
              '    ?concept skos:narrower ?concept2 . ' +
              '    BIND(IF(?concept2 != "", 1, 0) AS ?count) ' +
              '  } . ' +
              '} ' +
              'GROUP BY $concept ' +
              'ORDER BY ?label';

  var options = {
    method: "POST",
    url: url,
    body: body,
    headers: {
      'Content-Type': 'application/sparql-query'
    },
    auth: auth
  };
  rp(options)
    .then(function (response) {
      res.send(response);
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });

});

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
