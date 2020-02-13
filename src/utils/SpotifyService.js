import fromCDN from "from-cdn";
import Rx from "rxjs";
import {processTokens, log} from "./SpotifyServiceTools";

// url for react debugging on node server (comment out for building in production)
const DEBUG_URL = "http://localhost:8080";


/**
 * Service that handles client-side handling of Spotify communications.
 */
class SpotifyService {

	// Must have a reference to SDK so playback functions can be called.
	constructor (spotifyPlayerName) {

		// keep track of all three initializations
		const $cdn = new Rx.BehaviorSubject(false);
		const $sdk = new Rx.BehaviorSubject(false);
		const $token = new Rx.BehaviorSubject(false);

		/*
		 * spotify service observable
		 * subject that notifies of all state changes within this module.
		 */
		const $spotifyServiceStateNotifier = new Rx.ReplaySubject();

		// does all necessary initialization
		const initPlayer = () => {

			// if this is running again after initialization, quit.
			if (this.player) return;

			const {Player} = window.Spotify;

			/*
			 * todo: may extract this to a separate func
			 * Initialize player
			 */
			this.player = new Player({
				"name": "tune mountain",
				"getOAuthToken": callback => callback(this.accessToken),
				"volume": 0.5
			});

			this.player.connect();

			// noinspection JSDeprecatedSymbols
			this.player.addListener("ready", ({device_id}) => {
				log("PLAYER_READY", `Spotify player ready to stream songs on ${device_id}`, $spotifyServiceStateNotifier);
			});

			// check for player state updates and notify them
			this.player.addListener("player_state_changed", webPlaybackStateObject => log(
				"PLAYER_STATE_CHANGED",
				webPlaybackStateObject,
				"Spotify player state changed!",
				$spotifyServiceStateNotifier
			));

			// TODO: add listener for error and automatically refresh token

		};

		// only init spotify player/service once all three parts are done with their processes
		$cdn.combineLatest(
			$sdk,
			$token,
			(cdnLoaded, sdkLoaded, tokenLoaded) => cdnLoaded && sdkLoaded && tokenLoaded
		)
			.filter(isAllLoaded => isAllLoaded)
			.subscribe(() => {
				log("LOGGED_IN", null, "User has logged in.", $spotifyServiceStateNotifier);
				initPlayer();
			});

		// process tokens and collect notifications from it
		processTokens(this.getNewAccessToken, $spotifyServiceStateNotifier);

		// save tokens when they're acquired
        $spotifyServiceStateNotifier
            .filter(notif => notif.state === "ACCESS_TOKEN_ACQUIRED")
            .subscribe(newState => {

                // get tokens from update
                const {
                    accessToken,
                    refreshToken
                } = newState.body;

                this.accessToken = accessToken;
                this.refreshToken = refreshToken;

                if (accessToken && refreshToken) $token.next(true);
                else $token.next(false);

            });

		this.name = spotifyPlayerName;
		this.player = null;
		this.spotifyStateNotifier = $spotifyServiceStateNotifier;

		// Load sdk, update state
		fromCDN(["https://sdk.scdn.co/spotify-player.js"])
			.then(() => {
				$cdn.next(true);
			});

		window.onSpotifyWebPlaybackSDKReady = () => $sdk.next(true);

		this.spotifyStateNotifier = $spotifyServiceStateNotifier;

		// bind functions?
		this.pause = this.pause.bind(this);
		this.resume = this.resume.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	/**
	 * Getter for Rx.Subject that notifies state of this module to rest of the app.
	 * @returns {Subject} Rx Observable that emits state updates.
	 */
	get stateNotifier() {
		return this.spotifyStateNotifier;
	}

	/**
	 * Getter for current state of spotify player.
	 * @returns {Promise} contains the player state object
	 */
	get playerState() {
		if (this.player) return this.player.getCurrentState();

		return null;
	}

	/**
	 * Connects spotify player to Spotify Connct
	 */
	activate() {
		if (this.player) return this.player.connect();

		return null;
	}

	deactivate() {
		if (this.player) this.player.disconnect();
	}

	/**
	 * Refreshes the user token.
	 * @param {String} refreshToken refresh token received from Spotify
	 * @returns {JSON} JSON returned from query.
	 */
	getNewAccessToken(refreshToken = null) {

		const tokenToBeUsed = refreshToken ? refreshToken : this.refreshToken;

		return fetch(`${DEBUG_URL ? DEBUG_URL : ""}/spotify-service/refresh-token/${tokenToBeUsed}`)
			.then(response => response.json())
			.catch(error => {
				console.error(error);
			});

	}

	/**
	 * Pauses playback on local spotify player.
	 * @returns {Promise}
	 */
	pause() {
		if (this.player) return this.player.pause();

		return null;

	}

	/**
	 * Pauses playback on local spotify player.
	 * @returns {Promise}
	 */
	toggle() {
		if (this.player) return this.player.togglePlay();

		return null;

	}

	/**
	 * Resumes playback on local spotify player
	 * @returns {Promise}
	 */
	resume() {
		if (this.player) return this.player.resume();

		return null;
	}

	/**
	 * Plays a song on the current active player with a given spotify URI.
	 * @param {String} songID the Spotify track ID of the song. Can be acquired through search params.
	 * @returns {void}
	 */
	play(songID) {

		const uri = `spotify:track:${songID}`;

		if (!this.player) throw new Error("Player not initialized.");

		const play = ({
			spotifyURI,
			"playerInstance": {
				"_options": {
					getOAuthToken,
					id
				}
			}
		}) => {
			getOAuthToken(access_token => {
				const details = {
					"method": "PUT",
					"headers": {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${access_token}`
					}
				};

				if (spotifyURI) {
					details.body = JSON.stringify({"uris": [spotifyURI]});
				}

				fetch(
				`https://api.spotify.com/v1/me/player/play?device_id=${id}`,
					details
				).then(() => console.log(`Success: Playing uri: ${spotifyURI}`));
			});
		};

		// run the function
		play({
			"playerInstance": this.player,
			"spotifyURI": uri
		});

	}

	/**
	 * Redirects application to accounts.spotify.com web page for login.
	 * @returns {void}
	 */
	login() {

		console.log("Redirecting to Spotify for authorization...");
		window.location = `${DEBUG_URL ? DEBUG_URL : ""}/spotify-service/login`;

	}

	/**
	 * Searches spotify servers using the passed keywords in any order (without quotations on query).
	 * Returns tracks on the State updater using the state keyword TRACKS_FETCHED; if a callback function is
	 * passed, the returned JSON object is passed as the only argument in the callback function.
	 *
	 * @param {Function} callback an optional callback function whose argument will be the JSON object containing the songs
	 * @param {...String} keywords one or more strings to be used in the query parameter.
	 * @returns {void} return values are emitted on Subject or passed to callback
	 */
	search(callback = null, ...keywords) {

		// 1: filter keywords into a query string
		let searchQueryString = "q=";
		for (let index = 0; index < keywords.length; index++) {

			// append keyword
			searchQueryString += keywords[index];

			// add &20 between keywords if not last item
			searchQueryString += index + 1 === keywords.length ? "" : "&20";

		}

		// other filtering parameters
		const type = "type=track";
		const limit = "limit=8";

		// 2: define GET parameters and headers
		const url = `https://api.spotify.com/v1/search?${searchQueryString}&${type}&${limit}`;
		const header = {
			"method": "GET",
			"headers": {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.accessToken}`
			}
		};

		// 3: emit result in callback and subject
		fetch(url, header)
			.then(response => response.json())
			.then(json => {

				// emit
				log(
					"TRACKS_FETCHED",
					json,
					"Choose any of these songs...",
					this.spotifyStateNotifier
				);

				// callback
				// eslint-disable-next-line callback-return
				if (callback) callback(json);

			})
			.catch(err => {
				throw new Error(err);
			});

	}

	/**
	 * Returns through callback an object containing "audioFeatures" and "audioAnalysis" for a given
	 * track ID.
	 * @param {String} id a spotify track id
	 * @param {Function} callback callback function for handling features and analysis
	 * @returns {void} return values are passed to callback
	 */
	getAudioAnalysisAndFeatures(id, callback) {

		const analysisURL = `https://api.spotify.com/v1/audio-analysis/${id}`;
		const featuresURL = `https://api.spotify.com/v1/audio-features/${id}`;

		const header = {
			"method": "GET",
			"headers": {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.accessToken}`
			}
		};

		let analysis = null;
		let features = null;

		fetch(analysisURL, header)
			.then(response => response.json())
			.then(analysisObject => {
				analysis = analysisObject;

				return fetch(featuresURL, header);
			})
			.then(response => response.json())
			.then(featuresObject => {
				features = featuresObject;

				if (callback) {

					// eslint-disable-next-line callback-return
					callback({
						features,
						analysis
					});

				}

				// emit
				log(
					"METADATA_FECHED",
					{
						"audioFeatures": features,
						"audioAnalysis": analysis
					},
					"Metadata available.",
					this.spotifyStateNotifier
				);

			})
			.catch(error => console.error(error));
	}

	/**
	 *  Fetches user info
	 *
	 *  @returns {Promise} promise that evaluates in the response.
	 */
	getUserInfo() {

		const handler = (resolve, reject) => {

			const url = "https://api.spotify.com/v1/me";
			const header = {
				"method": "GET",
				"headers": {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.accessToken}`
				}
			};

			return fetch(url, header)
				.then(res => res.json())
				.then(resJSON => resolve({
					"spotifyID": resJSON.id,
					"displayName": resJSON.display_name,
					"imageUrl": resJSON.images[0].url
				}))
				.catch(err => reject(err));

		};

		return new Promise(handler);

	}

}

export default SpotifyService;