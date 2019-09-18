import fromCDN from 'from-cdn';

/**
 * Service that handles client-side handling of Spotify communications.
 */
class SpotifyService {

	// must have a reference to SDK so playback functions can be called.
	constructor (spotifyPlayerName, userToken = null) {

		// handle state of SDK and user token
		this.state = {
			'SDKLoaded': false,
			'playerReady': false,
			'userToken': userToken
		};

		this.name = spotifyPlayerName;
		this.player = null;

		// load sdk, update state
		fromCDN(["https://sdk.scdn.co/spotify-player.js"])
			.then(() => {
				this.state.SDKLoaded = true;
			});

		// event will only be triggered when sdk loads
		window.onSpotifyWebPlaybackSDKReady = () => {

			const { Player } = window.Spotify;

			// initialize player
			this.player = new Player({
				'name': 'tune mountain',
				'getOAuthToken': callback => callback(this.state.userToken),
				'volume': 0.5
			});

			console.log(this.player);

			this.player.connect()
				.then(success => {
					if (success) console.log('spotify player connected.')
				});

			this.player.addListener('ready', ({ device_id }) => {
				console.log('Connected with Device ID', device_id);
			});

		}

	}

	/**
	 * Refreshes the user token.
	 * @param newToken
	 */
	refreshToken(newToken) {

		this.state.userToken = newToken;

	}

	togglePlayback() {

		this.player.getCurrentState().then(state => {
			if (!state) {
				console.error('User is not playing music through the Web Playback SDK');

				this.play();

				return;
			}

			let {
				current_track,
				next_tracks: [next_track]
			} = state.track_window;

			console.log(state);

			console.log('Currently Playing', current_track);
			console.log('Playing Next', next_track);
		});

		this.player.togglePlay();

	}

	retryConnect() {

		this.player.connect()
			.then(success => {
				if (success) console.log('spotify player connected.')
			});

	}

	play(uri) {

		console.log("Starting to play", uri);

		const play = ({
			spotify_uri,
			playerInstance: {
				_options: {
					getOAuthToken,
					id
				}
			}
		}) => {
			getOAuthToken(access_token => {
				const details = {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${access_token}`
					},
				};

				if (spotify_uri) {
					details.body = JSON.stringify({ uris: [spotify_uri] });
				}

				fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`,
					details
				).then(() => console.log("Fetch (PUT) returned!" +
					" Playing" +
					" uri: ", spotify_uri));
			});
		};

		play({
			playerInstance: this.player,
			spotify_uri: uri,
		});

	}


}

export default SpotifyService;