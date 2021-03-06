var express = require( 'express' );
var bodyParser = require( 'body-parser' );
var mongoose = require( 'mongoose' );
var User = require( './models/user' ); // the USER MODEL
var Message = require( './models/message' ); // the MESSAGE MODEL

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here

var runServer = function( callback ) {
  var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
  mongoose.connect( databaseUri ).then( function() {
    var port = process.env.PORT || 8080;
    var server = app.listen( port, function() {
      console.log( 'Listening on localhost:' + port );
      if ( callback ) {
        callback( server );
      }
    } );
  } );
};

if ( require.main === module ) {
  runServer();
}

/*------------------ USERS ------------------*/

app.get( '/users', function( req, res ) {
  User.find( function( err, users ) {
    if ( err ) {
      return res.status( 400 ).json( err );
    }
    res.status( 200 ).json( users );
  } );
} );

app.get( '/users/:userId', function( req, res ) {
  var userId = req.params.userId;
  User.findById( userId, function( err, user ) {
    if ( err ) {
      return res.status( 400 ).json( err );
    } else if ( !user ) {
      return res.status( 404 ).json( {
        message: 'User not found'
      } );
    } else {
      res.status( 200 ).json( {
        username: user.username,
        _id: user._id
      } );
    }
  } );
} );

app.post( '/users', jsonParser, function( req, res ) {
  if ( !req.body.username ) {
    return res.status( 422 ).json( {
      message: 'Missing field: username'
    } );
  }

  if ( typeof( req.body.username ) !== 'string' ) {
    return res.status( 422 ).json( {
      message: 'Incorrect field type: username'
    } );
  }

  User.create( {
    username: req.body.username
  }, function( err, user ) {
    if ( err ) {
      return res.status( 400 ).json( err );
    }
    res.header( 'location', '/users/' + user._id ).status( 201 ).json( {} );
  } );
} );

app.put( '/users/:userId', jsonParser, function( req, res ) {
  var userId = req.params.userId;
  User.findByIdAndUpdate( userId, req.body, function( err, user ) {
    if ( err ) {
      return res.status( 400 ).json( err );
    }
    if ( !user ) {
      User.create( {
        username: req.body.username,
        _id: req.body._id
      } );
    }
    if ( !req.body.username ) {
      return res.status( 422 ).json( {
        message: 'Missing field: username'
      } );
    }
    if ( typeof( req.body.username ) !== 'string' ) {
      return res.status( 422 ).json( {
        message: 'Incorrect field type: username'
      } );
    }
    res.status( 200 ).json( {} );
  } );
} );

app.delete( '/users/:userId', function( req, res ) {
  var userId = req.params.userId;
  User.findByIdAndRemove( userId, function( err, user ) {
    if ( !user ) {
      return res.status( 404 ).json( {
        message: 'User not found'
      } );
    }
    if ( err ) {
      return res.status( 400 ).json( err );
    }
    res.status( 200 ).json( {} );
  } );
} );

/*------------------ MESSAGING ------------------*/

app.get( '/messages', function( req, res ) {
  Message.find( req.query ).populate( 'from to' ).exec( function( err, messages ) {
    if ( err ) {
      return res.status( 400 ).json( err );
    }
    res.status( 200 ).json( messages );
  } );
} );

app.get( '/messages/:messageId', function( req, res ) {
  var id = req.params.messageId;
  Message.findById( id ).populate( 'from to' ).exec( function( err, message ) {
    if ( !message ) {
      return res.status( 404 ).json( {
        message: 'Message not found'
      } );
    }
    res.status( 200 ).json( message );
  } );
} );

app.post( '/messages', jsonParser, function( req, res ) {
  if ( !req.body.text ) {
    return res.status( 422 ).json( {
      message: 'Missing field: text'
    } );
  }
  if ( typeof( req.body.text ) !== 'string' ) {
    return res.status( 422 ).json( {
      message: 'Incorrect field type: text'
    } );
  }
  if ( typeof( req.body.to ) !== 'string' ) {
    return res.status( 422 ).json( {
      message: 'Incorrect field type: to'
    } );
  }
  if ( typeof( req.body.from ) !== 'string' ) {
    return res.status( 422 ).json( {
      message: 'Incorrect field type: from'
    } );
  }
  User.findById( req.body.from, function( err, user ) {
    if ( !user ) {
      return res.status( 422 ).json( {
        message: 'Incorrect field value: from'
      } );
    }
    User.findById( req.body.to, function( err, user ) {
      if ( !user ) {
        return res.status( 422 ).json( {
          message: 'Incorrect field value: to'
        } );
      }
      Message.create( req.body, function( err, message ) {
        if ( err ) {
          return res.status( 400 ).json( err );
        }
        res.header( 'location', '/messages/' + message._id ).status( 201 ).json( {} );
      } );
    } );
  } );
} );


exports.app = app;
exports.runServer = runServer;
