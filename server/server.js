var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var User = require('./models/user-model.js');


/* ============= GOOGLE AUTHENTICATION & PASSPORT CONFIG ================= */
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// GOOGLE CREDENTIALS
var GOOGLE_CLIENT_ID = "615669438819-m1ilq060a5u3grritkida3edigottqa0.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "LHzp14JwYUpuKn50eAbr4Xn3";

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  console.log("DESERIALIZING!!!!! ", id);
  User.getOne(id, function (err, user) {
  	done(err, user);
  });
});

// WELCOME TO HELL
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/login-verify"
  },
  function(accessToken, refreshToken, profile, done) {
  	User.getOne(profile.id, function (err, result) {
  		if (result.length === 0) {
  			User.addOne([profile.displayName ,profile.id], function (err, result) {
          if (err) {
            console.log("ERROR: ", err);
          } else {
            console.log("RESULTS: ", result);
          }
  				done(null, result);
  			});
  		} else {
  			done(null, result[0]);
  		};
  	});
  }
));


/* ==================== MIDDLEWARE ================== */
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Allow cross origin requests
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain);

//Set up routes
require('./routes/index.js')(app, express, passport);

//Set up static files
app.use(express.static(path.join(__dirname ,'../client')));

// Set up ports
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Server listening on port ' + port);
});

module.exports = app;

