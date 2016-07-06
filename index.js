var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var user = require('./models/user'); // the MODEL

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here

var runServer = function (callback) {
  var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
  mongoose.connect(databaseUri).then(function () {
    var port = process.env.PORT || 8080;
    var server = app.listen(port, function () {
      console.log('Listening on localhost:' + port);
      if (callback) {
        callback(server);
      }
    });
  });
};

if (require.main === module) {
  runServer();
}

app.get('/users', function (req, res) {
  user.find(function (err, users) {
    if (err) {
      return res.status(400).json(err);
    }
    res.status(200).json(users);
  });
});

exports.app = app;
exports.runServer = runServer;
