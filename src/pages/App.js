import React, {Component} from "react";
import SpotifyService from "../utils/SpotifyService";
import HUDOverlayManager from "../utils/HUDOverlayManager";

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
			<HUDOverlayManager
				spotifyService={this.spotifyService}
				hasLoggedIn={this.state.hasLoggedIn}
			/>
		);

	}

}

export default App;