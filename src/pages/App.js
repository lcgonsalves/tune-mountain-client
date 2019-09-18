import React, {Component} from "react";
import UserProfile from "../components/UserProfile";
import SpotifyService from '../utils/SpotifyService';
import querystring from 'querystring';

const DEBUG_URL = 'http://localhost:8080';

class App extends Component {

	constructor(props) {

		super(props);

		this.state = {
			'userProfile': null,
			'userToken': null,
			'refreshToken': null,
			'spotifyService': null
		};

	}

	componentDidMount() {

		const urlParams = new URLSearchParams(window.location.search);
		console.log(urlParams);

		if (urlParams.has('accessToken')) {
			fetch(`${DEBUG_URL}/spotify-service/user-information/${urlParams.get('accessToken')}`)
				.then(response => response.json())
				.then(userJSON => {

					const {
						country,
						display_name,
						email,
						id,
						images,
						uri
					} = userJSON;

					const user =
						<UserProfile
							displayName={display_name}
							country={country}
							email={email}
							id={id}
							uri={uri}
							profilePictureUrl={images[0].url}
							accessToken={urlParams.get('accessToken')}
							refreshToken={urlParams.get('refreshToken')}
						/>;

					this.setState({
						'userProfile': user,
						'spotifyService': new SpotifyService('Tune Mountain', urlParams.get('accessToken'))
					});

				})
				.catch(err => console.error(err));
		}

	}


	render() {


		const endpoint = '/spotify-service/login';

		const btn = <button><a href={`${DEBUG_URL}${endpoint}`}>Login with Spotify</a></button>;
		const playpause = <button onClick={() => {
			if (this.state.spotifyService) this.state.spotifyService.togglePlayback();
		}}>Play / Pause</button>;

		const connect = <button onClick={() => {
			if (this.state.spotifyService) this.state.spotifyService.play("spotify:track:2Wo9g52HBAuThdJaUEYKdY");
		}}>Retry connect</button>;

		return(
			<div>

				{btn}

				{this.state.userProfile}

				{this.state.spotifyService ? [playpause, connect] : null}

			</div>
		);

	}

}

export default App;