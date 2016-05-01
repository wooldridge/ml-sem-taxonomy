var config = require('./config'),
    rp = require('request-promise'),
    marklogic = require('marklogic'),
    express = require('express');

// Set up EXPRESS
var app = express(),
    port = config.server.port,
    router = express.Router();

// Set up MARKLOGIC
var db = marklogic.createDatabaseClient({
  host: config.host,
  port: config.database.port,
  user: config.auth.user,
  password: config.auth.pass,
  authType: 'digest'
});

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

// SEARCH for a KEYWORD
app.get('/search', function(req, res){
  var q = req.query.q;
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/search?options=taxonomy';
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

// SEARCH for a CONCEPT
app.get('/concept', function(req, res){
  var q = req.query.q;
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var body = 'PREFIX wb: <http://vocabulary.worldbank.org/taxonomy/> ' +
             'SELECT ?uri ' +
             'WHERE { ' +
             '  ?uri <http://example.org/hasConcept> wb:' + q + ' . ' +
             '} ';

  var options = {
    method: "POST",
    url: url,
    body: body,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (response) {
      console.log(JSON.stringify(response, null, 2));
      //res.json(response);
      var uris = response.results.bindings.map(function (curr) {
        return curr.uri.value;
      })
      db.documents.read({
        uris: uris
      }).result(
        function(response) {
          res.send(response);
        },
        function(error) { console.log(JSON.stringify(error)); }
      )
    })
    .catch(function (err) {
      console.log(JSON.stringify(err, null, 2));
    });
});

// TOP concepts in hierarchy, with subconcept counts
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

// TOP concepts in hierarchy, with doc counts
app.get('/top2', function(req, res){
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var body =  'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
              'SELECT ?concept ?label ' +
              '(count(distinct ?doc) as ?num) (sum(?countSubs) as ?numSubs) ' +
              'WHERE ' +
              '{ ' +
              '  ?concept skos:topConceptOf ?o . ' +
              '  ?concept skos:prefLabel ?label . ' +
              '  ?doc <http://example.org/hasConcept> ?concept . ' +
              '  OPTIONAL { ' +
              '    ?concept skos:narrower ?concept2 . ' +
              '    BIND(IF(?concept2 != "", 1, 0) AS ?countSubs) . ' +
              '  } ' +
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

// BROADER concepts in hierarchy
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

// NARROWER concepts in hierarchy, with subconcept counts
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

// NARROWER concepts in hierarchy, with subconcept counts
app.get('/narrower2', function(req, res){
  var url  = 'http://' + config.host + ':' + config.database.port;
      url += '/v1/graphs/sparql';
  var q = req.query.q;
  var body =  'PREFIX ex: <http://example.org/> ' +
              'PREFIX wb: <http://vocabulary.worldbank.org/taxonomy/> ' +
              'PREFIX skos: <http://www.w3.org/2004/02/skos/core#> ' +
              'SELECT ?concept ?label ' +
              '(count(distinct ?doc) as ?num) (sum(?countSubs) as ?numSubs) ' +
              'WHERE ' +
              '{ ' +
              '  wb:' + q + ' skos:narrower ?concept . ' +
              '  ?concept skos:prefLabel ?label . ' +
              '  ?doc <http://example.org/hasConcept> ?concept . ' +
              '  OPTIONAL { ' +
              '    ?concept skos:narrower ?concept2 . ' +
              '    BIND(IF(?concept2 != "", 1, 0) AS ?countSubs) . ' +
              '  } ' +
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
