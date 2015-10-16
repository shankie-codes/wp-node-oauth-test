/* From https://gist.github.com/santosh79/1964797 */
/* and https://gist.github.com/mccahill/6378276*/

var express = require('express');
var sys = require('util');
var oauth = require('oauth');
var config = require('./config.js');
var request = require('superagent');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorhandler = require('errorhandler');
var uuid = require('uuid');

// Set up our Express app
var app = express();
app.use(cookieParser());

var _wpConsumerKey = config.WP_CONSUMER_KEY;
var _wpConsumerSecret = config.WP_CONSUMER_SECRET;

var wpRequestUrl;
var wpAccessUrl;

var oauthRequestToken;
var oauthRequestTokenSecret;


request
  .get(config.WP_INDEX_ENDPOINT)
  .type('application/json')
  .end(function(err, res) {
    if(res){
      wpRequestUrl = res.body.authentication.oauth1.request;
      wpAccessUrl = res.body.authentication.oauth1.access;
      wpAuthorizeUrl = res.body.authentication.oauth1.authorize;
      callbackUrl = config.HOSTPATH + "/sessions/callback";
      // callbackUrl = config.HOSTPATH + ":" + config.PORT + "/sessions/callback"; // This is what we actually want, but WordPress balks at redirects with port numbers

      console.log(" wpRequestUrl: %s\n wpAccessUrl: %s\n wpAuthorizeUrl: %s\n callbackUrl: %s", wpRequestUrl, wpAccessUrl, wpAuthorizeUrl, callbackUrl);
    }
});

console.log("_wpConsumerKey: %s \n _wpConsumerSecret %s", _wpConsumerKey, _wpConsumerSecret);

function consumer() {
  return new oauth.OAuth(
    wpRequestUrl, wpAccessUrl, 
    _wpConsumerKey, _wpConsumerSecret, "1.0A", callbackUrl, "HMAC-SHA1");   
}

app.use(session({
  genid: function(req) {
    return uuid.v1(); // use UUIDs for session IDs
  },
  secret: config.EXPRESS_SESSION_SECRET
}));

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler());
}

app.get('/', function(req, res){
  res.send('Hello World');
});

/* Get a temporary request token and then redirect the user to the WP login page */
app.get('/sessions/connect', function(req, res){
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
    } else {  
      // req.session.oauthRequestToken = oauthToken;
      // req.session.oauthRequestTokenSecret = oauthTokenSecret;
      oauthRequestToken = oauthToken;
      oauthRequestTokenSecret = oauthTokenSecret;
      // res.redirect(wpAuthorizeUrl + "?oauth_token=" + req.session.oauthRequestToken + "&oauth_callback=" + callbackUrl);      
      res.redirect(wpAuthorizeUrl + "?oauth_token=" + oauthRequestToken + "&oauth_callback=" + callbackUrl);      
    }
  });
});

app.get('/sessions/callback', function(req, res){
  // sys.puts(">>"+req.session.oauthRequestToken);
  // sys.puts(">>"+req.session.oauthRequestTokenSecret);
  sys.puts(">>"+oauthRequestToken);
  sys.puts(">>"+oauthRequestTokenSecret);
  sys.puts(">>"+req.query.oauth_verifier);

  consumer().getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
  // consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      // We're connected
      res.send('Looks like we\'re connected. Print out some nice things for your user.');
      
      // You now have everything that you need to make requests. Try superagent and superagent-oauth
    }
  });
});

app.listen(parseInt(config.PORT || 80));