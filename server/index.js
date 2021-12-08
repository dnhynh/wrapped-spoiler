const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const cors = require('cors')
const cookieParser = require('cookie-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const { URLSearchParams } = require('url');
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

  /**
  * Generate Spotify Authorization URL
  * @returns {json}
  */
app.get('/login', function(req, res) {
  // Create the authorization URL
  const state = generateRandomString(16)
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.cookie(stateKey, state);

  res.json({url: authorizeURL});
})

app.get('/callback', function(req, res) {
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      URLSearchParams.stringify({
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

      res.cookie('token', data.body.access_token, {httpOnly: true})
      res.cookie('refresh', data.body.refresh_token, {httpOnly: true})

      res.redirect(`http://localhost:3000`);
    },
    function(err) {
      console.log('Something went wrong!', err);
    }
  );
});

/**
 * Get 50 recent tracks from user and return audio analysis
 */
app.get('/recent', (req, res) => {
  !spotifyApi.getAccessToken() && spotifyApi.setAccessToken(req.cookies['token']) 
  spotifyApi.getMyRecentlyPlayedTracks({
    limit : 50
  }).then(function(data) {
      // Fetch Audio Analysis
      const allTrackInfo = {}
      const tracks = []

      data.body.items.forEach((item) => {
        tracks.push(item.track.id)
        // Construct track info
        allTrackInfo[item.track.id] = {
          song_name: item.track.name,
          artist: item.track.artists.map((artist) => artist.name),
          album: item.track.album,
          played_at: item.played_at,
          preview: item.track.preview_url,
        }
      })
      spotifyApi.getAudioFeaturesForTracks(tracks)
        .then(function(data) {
          const trackData = [];
          data.body.audio_features.forEach((analysis) => {
            allTrackInfo[analysis.id] = {
              ...allTrackInfo[analysis.id],
              analysis: analysis
            }
            trackData.push(allTrackInfo[analysis.id])
          })
          res.json({data: trackData})
        }, function(err) {
          console.log(err);
        });
    }, function(err) {
      console.log('Something went wrong!', err);
    });

})
  

const server = app.listen(8888, function (){
  var port = server.address().port
  console.log(`Server listening on localhost:${port}`)
});;