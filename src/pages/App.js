import React, {Component} from "react";
import SpotifyService from "../utils/SpotifyService";
import HUDOverlayManager from "../utils/HUDOverlayManager";
import APIService from "../utils/APIService";
import Game from "tune-mountain-game";
import {GameStateController, InputManager} from "tune-mountain-input-manager";
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
			.subscribe(() => {
				spotifyService.getUserInfo()
					.then(userObj => {
						// add user to database if doesn't exist
						APIService.checkInUser(userObj.spotifyID, userObj.displayName, userObj.imageUrl);

						// update state
						this.setState({
							"hasLoggedIn": true,
							"user": userObj
						});
					});
			});

		// init player when sdk is ready
		this.spotifyService = spotifyService;

		// api service
		this.apiService = new APIService();

		// game components
		this.canvasReference = React.createRef();

		// will be initialized once component mounts
		this.game = null;
		this.gameStateController = new GameStateController();
		this.inputManager = null;

		this.state = {
			hasLoggedIn,
			"gameVersion": process.env.REACT_APP_VERSION
		};

		this.handleGameFinish = this.handleGameFinish.bind(this);
		this.handleGameInterrupt = this.handleGameInterrupt.bind(this);
		this.handleGamePause = this.handleGamePause.bind(this);
		this.handleGameResume = this.handleGameResume.bind(this);
		this.handleGameStart = this.handleGameStart.bind(this);
		this.handleReplayBeginRequest = this.handleReplayBeginRequest.bind(this);
		this.handleReplayInterruptRequest = this.handleReplayInterruptRequest.bind(this);
		this.handleReplayPlaybackStart = this.handleReplayPlaybackStart.bind(this);

	}

	componentDidMount() {

		this.inputManager = new InputManager();

		// initialize game once component is mounted
		this.game = new Game(this.gameStateController, this.canvasReference.current, this.inputManager);

	}

	/**
	 * Begins recording inputs in input manager.
	 */
	handleGameStart() {

		// begins recording
		this.inputManager.startSession();

	}

	/**
	 *  Pauses recording of inputs.
	 */
	handleGamePause() {

		// pauses recording
		this.inputManager.pauseSession();

	}

	/**
	 * Resumes input gathering.
	 */
	handleGameResume() {

		// resumes
		this.inputManager.resumeSession();

	}

	/**
	 * Stops recording inputs, extracts them, stores inputs and session, resets input manager history.
	 */
	handleGameFinish(score, songID) {

		// stops recording and returns input history
		const inputHistory = this.inputManager.terminateSession();

		// input history will be null if it's been terminated already (sometimes the Spotify SDK duplicates the event that triggers this)
		if (inputHistory) {

			const session = {
				songID,
				score,
				"userID": this.state.user.spotifyID,
				"gameVersion": this.state.gameVersion
			};

			console.log(session, inputHistory);

			APIService.saveGameSession(session, inputHistory)
				.then(console.log);

		}

	}

	/**
	 *  Stops recording inputs, resets history. Does not save session or inputs.
	 */
	handleGameInterrupt() {

		// stops recording
		console.log("Wrong termination", this.inputManager.terminateSession());

	}

	/**
	 * Receives input history and loads it in the input manager
	 */
	handleReplayBeginRequest(inputHistory) {

		this.inputManager.loadInputsForReplay(inputHistory);

	}

	/**
	 * Terminates replay session in input manager and restores it to regular emission state.
	 */
	handleReplayInterruptRequest() {

		this.inputManager.terminateReplaySession();

	}

	/**
	 * Notifies input manager to begin replay.
	 */
	handleReplayPlaybackStart() {

		this.inputManager.beginReplaySession();

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
					user={this.state.user}
					onGameFinish={this.handleGameFinish}
					onGameInterrupted={this.handleGameInterrupt}
					onGamePause={this.handleGamePause}
					onGameStart={this.handleGameStart}
					onGameResume={this.handleGameResume}
				 	onReplayBeginRequest={this.handleReplayBeginRequest}
				 	onReplayInterruptRequest={this.handleReplayInterruptRequest}
				 	onReplayPlaybackStart={this.handleReplayPlaybackStart}
				/>
				<p id="version">Ver {this.state.gameVersion}</p>
			</div>
		);

	}

}

export default App;
