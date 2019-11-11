import React, {Component} from "react";
import SpotifyService from "../utils/SpotifyService";
import HUDOverlayManager from "../utils/HUDOverlayManager";
import Game from "tune-mountain";
import {GameStateController} from "tune-mountain-input-manager";
import "../css/App.css";

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

		// game components
		this.canvasReference = React.createRef();

		// will be initialized once component mounts
		this.game = null;
		this.gameStateController = new GameStateController();

		this.state = {
			hasLoggedIn,
			"currentMenu": null
		};

	}

	componentDidMount() {

		// initialize game once component is mounted
		this.game = new Game(this.gameStateController, this.canvasReference.current);

	}

	render() {

		return(
			<div>
				<canvas
					ref={this.canvasReference}
					className={"game-viewport"}
					width={window.innerWidth}
					height={window.innerHeight}
				/>
				<HUDOverlayManager
					spotifyService={this.spotifyService}
					hasLoggedIn={this.state.hasLoggedIn}
					gameStateController={this.gameStateController}
				/>
			</div>
		);

	}

}

export default App;