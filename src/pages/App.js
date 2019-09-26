import React, {Component} from "react";
import HUDMainMenu from "./hud/HUDMainMenu";
import SpotifyService from "../utils/SpotifyService";
import HUDSongSearchMenu from "./hud/HUDSongSearchMenu";

const APP_NAME = "Tune Mountain";

class App extends Component {

	constructor(props) {

		super(props);

		const spotifyService = new SpotifyService(`${APP_NAME} Web Player`);
		const hasLoggedIn = false;
		spotifyService.stateNotifier.subscribe(state => console.log(state));
		spotifyService.stateNotifier
			.filter(notification => notification.state === "LOGGED_IN")
			.subscribe(() => this.setState({"hasLoggedIn": true}));

		// init player when sdk is ready

		this.spotifyService = spotifyService;

		this.state = {
			hasLoggedIn,
			"currentMenu": null
		};

	}

	componentDidMount() {

	}

	render() {

		return(
			<div>

				{this.state.currentMenu || <HUDMainMenu onLoginRequest={this.spotifyService.login}
														hasLoggedIn={this.state.hasLoggedIn}
														onSongSelectRequest={() => this.setState({"currentMenu": <HUDSongSearchMenu spotifyService={this.spotifyService}/>})}
				/>}

			</div>
		);

	}

}

export default App;