// Get the hash of the url

const hash = window.location.hash
  .substring(1)
  .split('&')
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
  console.log(hash)
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '754095ec83f74d30ac89dbd32a298582';
const redirectUri = 'http://localhost:5501/chillBeats';
const scopes = [
  'streaming',
  'user-modify-playback-state',
  'user-library-modify',
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    '%20'
  )}&response_type=token`;
}

// Set up the Web Playback SDK

let deviceId;

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: 'Just a Random Song',
    getOAuthToken: (cb) => {
      cb(_token);
    },
    volume: 0.5
  });

  // Error handling
  player.on('initialization_error', (e) => console.error(e));
  player.on('authentication_error', (e) => console.error(e));
  player.on('account_error', (e) => console.error(e));
  player.on('playback_error', (e) => console.error(e));

  // Playback status updates
  player.on('player_state_changed', (state) => {
    if (
      state.paused &&
      state.position === 0 &&
      state.restrictions.disallow_resuming_reasons &&
      state.restrictions.disallow_resuming_reasons[0] === 'not_paused'
    ) {
      console.log('finished');
      getASong();
    }
  });

  // Ready
  player.on('ready', (data) => {
    console.log('Ready with Device ID', data.device_id);
    deviceId = data.device_id;
  });
  player.pause().then(() => {
    console.log('pause')
  })

  player.resume().then(() => {
    console.log('resume')
  })

  // Connect to the player!
  player.connect();
};

// Play a specified track on the Web Playback SDK's device ID
function play(device_id, track) {
  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
    type: 'PUT',
    data: `{"uris": ["${track}"]}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
    },
    success: function (data) {
      console.log(data);
    },
  });
}
//3XabMu0mJaQmrqz57UkEZI
function getASong() {
  const mood_data = {
    study:
      '?seed_artists=5IH6FPUwQTxPSXurCrcIov&seed_artists=4MXUO7sVCaFgFjoTI5ox5c&seed_artists=5fuBZptKdXWB7NLT2eDwaT&seed_genres=chill&seed_genres=ambient&seed_genres=acoustic&seed_genres=piano&seed_genres=sleep&seed_tracks=0N8xcgJldOu3c7sOM3xo7K&seed_tracks=0e4cuDNgPJTgvioyI3dslDB&seed_tracks=2eAvDnpXP5W0cVtiI0PUxV&seed_tracks=4IhKLu7Vk3j2TLmnFPl6To',
    
  };
  let random_offset = Math.floor(Math.random() * 20);

  $.ajax({
    url: `https://api.spotify.com/v1/recommendations/${mood_data.study}`,
    type: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
    },
    success: function (data) {
      let trackUri = data.tracks[random_offset].uri;

      play(deviceId, trackUri);
      $('#embed-uri').attr(
        'src',
        'https://open.spotify.com/embed/track/' + data.tracks[random_offset].id
      );
    },
  });
}
