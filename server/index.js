const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const cors = require('cors')
const cookieParser = require('cookie-parser');
var querystring = require('querystring');
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const app = express();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
 var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// TODO: Production URL
const redirectUri = process.env.NODE_ENV === "dev" ? 'http://localhost:8888/callback' : 'http://localhost:8888/callback';
const scopes = ["user-read-private", "user-read-email", "user-read-playback-state", "user-read-recently-played", "playlist-read-private", "playlist-read-collaborative", "playlist-modify-public", "playlist-modify-private", "user-top-read"];
const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
}

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi(credentials);
const stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  // Create the authorization URL
  const state = generateRandomString(16)
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.cookie(stateKey, state);

  res.redirect(authorizeURL)
})

app.get('/callback', function(req, res) {
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
  };
  const { code } = req.query;
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
  
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      res.redirect('http://localhost:3000');
    },
    function(err) {
      console.log('Something went wrong!', err);
    }
  );
});
  

const server = app.listen(8888, function (){
  var port = server.address().port
  console.log(`Server listening on localhost:${port}`)
});;