import React, {Component} from "react";
import PropTypes from "prop-types";
import {Subject} from "rxjs";
import {GameStateEnums, GameStateController} from "tune-mountain-input-manager";

import HUDSongSearchMenu from "../pages/hud/HUDSongSearchMenu";
import HUDMainMenu from "../pages/hud/HUDMainMenu";
import HUDSongProgress from "../components/hud/HUDSongProgress";
import FadeTransition from "../components/transition/FadeTransition";
import {Transition} from "./TransitionUtils";
import SlideTransition from "../components/transition/SlideTransition";
import HUDSongSelectMenu from "../pages/hud/HUDSongSelectMenu";
import dotProp from "dot-prop";
import FormOverlay from "../components/FormOverlay";
import PauseOverlay from "../components/hud/PauseOverlay";
import SpotifyService from "./SpotifyService";
import MessageOverlay from "../components/MessageOverlay";
import LoadingOverlay from "../components/hud/LoadingOverlay";
import APIService from "./APIService";

/* eslint brace-style: 0 */
/* eslint max-lines: 0 */

/**
 * Utility responsible for unifying and managing all HUD menus and components properly.
 * Should be initialized with reference to the page that will be rendering the error and menu overlay.
 */
class HUDOverlayManager extends Component {

    constructor(props) {
        super(props);

        // will initialize the menu stack with main menu assuming login has been performed
        this.state = {
            "selectedSong": null,
            "playing": false,
            "playbackPosition": 0,
            "score": 0,
            "displayCompletionForm": false,
            "displayPauseOverlay": false,
            "displayLoadingOverlay": false,
            "mountLoadingOverlay": false,
            "displayWelcomeOverlay": false,
            "displayNewPlayerOverlay": false,
            "displayError": false,
            "menuStack": []
        };

        this.mainMenuTransitionController = null;

        // handle request for song to be played
        props.gameStateController.onNotificationOf(GameStateEnums.PLAY, () => {
            // only proceed if selected song exists
            if (this.state.selectedSong) {
                this.props.spotifyService.play(this.state.selectedSong.id);

                this.setState({
                    "playing": true,
                    "displayLoadingOverlay": false,
                    "displayPauseOverlay": true
                });
            }
        });

        props.gameStateController.onNotificationOf(
                GameStateEnums.SCORE_CHANGED,
            ({body}) => this.setState({"score": body})
        );

        // handle spotify player change reactively
        props.spotifyService.stateNotifier
            .filter(stateLog => stateLog.state === "PLAYER_STATE_CHANGED")
            .subscribe(stateLog => this.readAndUpdateState(stateLog.body));

        // id for timer that checks player id
        this.playerStateUpdaterIntervalID = null;

        // binding functions
        this.mountSongSearchMenu = this.mountSongSearchMenu.bind(this);
        this.mountSongSelectMenu = this.mountSongSelectMenu.bind(this);
        this.popMenu = this.popMenu.bind(this);
        this.mainMenu = this.mainMenu.bind(this);
        this.updatePlaybackState = this.updatePlaybackState.bind(this);
        this.renderOverlay = this.renderOverlay.bind(this);
    }

    readAndUpdateState (stateObj) {

            /*
             * case 1: selected song is different --
             *      emit idle state to game
             *      go back to Main menu
             *      pause song ?
             */
            const givenId = dotProp.get(stateObj, "track_window.current_track.id");
            const currentId = dotProp.get(this.state, "selectedSong.id");
            const paused = dotProp.get(stateObj, "paused");
            const position = dotProp.get(stateObj, "position");

            if (givenId !== currentId) {

                // only handle mistaken change of state if completion form is not up
                if (!this.state.displayCompletionForm) {

                    this.props.gameStateController.request(
                        GameStateEnums.IDLE,
                        {"reason": "Outside forces changed the song."}
                    );
                    this.mainMenu();

                    this.setState({
                        "playing": false,
                        "displayPauseOverlay": false
                    });

                    Transition.in(this.mainMenuTransitionController);

                    // make sure user cannot force Spotify Player to play any tracks
                    this.props.spotifyService.deactivate();

                }

            }

            /*
             * case 2: it's paused --
             *      emit pause state to game
             */
            else if (paused) {

                // check if at the end of the song
                if (position === 0) {

                    this.props.gameStateController.request(
                        GameStateEnums.IDLE,
                        {"reason": "end"}
                    );


                    this.setState({
                        "playing": false,
                        "displayPauseOverlay": false,
                        "displayCompletionForm": true
                    });

                    this.props.spotifyService.deactivate();


                } else {

                    this.props.gameStateController.request(
                        GameStateEnums.PAUSE,
                        {"reason": "paused"}
                    );

                    this.setState({
                        "playing": false,
                        "playbackPosition": position
                    });


                }
                // so no useless updates are made
                this.terminatePlaybackStateUpdater();

            }

            /*
             * case 3: it's all the same
             *      update position
             */
            else {

                // send play state if was previously paused
                if (!this.state.playing) {
                    this.props.gameStateController
                        .request(GameStateEnums.PLAY, {"reason": "unpaused"});
                }

                // this means it's not paused too
                this.initPlaybackStateUpdater();

                this.setState({
                    "playing": true,
                    "playbackPosition": position
                });
            }

        }

    componentDidMount() {

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleSongSelectRequest = () => {
            // first transition main menu out
            Transition.out(transitionObservable);

            // transition song search menu in
            this.mountSongSearchMenu(transitionObservable);
        };

        this.mainMenuTransitionController = transitionObservable;

        // now that all is well and mounted, update menu stack with appropriate components
        this.setState({
            "menuStack": [
                <FadeTransition
                    transitionRequestObservable={transitionObservable}
                    key={0}
                >
                    <HUDMainMenu
                        hasLoggedIn={true}
                        onSongSelectRequest={handleSongSelectRequest}
                    />
                </FadeTransition>
            ]
        });

        // show welcome in a couple seconds if appropriate
        if (!this.props.hasLoggedIn) setTimeout(() => this.setState({
            "displayWelcomeOverlay": true
        }), 1500);

    }

    /**
     * Checks Spotify Web Player state to determine current playback
     * position to update UI.
     *
     * WARNING: expensive operation.
     * @returns {void}
     */
    updatePlaybackState() {
        const spotifyPlayerState = this.props.spotifyService.playerState;

        if (spotifyPlayerState) {
            spotifyPlayerState.then(playerState => {
                if (!playerState) {

                    console.error("User is not playing music through the Web Playback SDK");

                    return;

                }

                const {
                    position,
                    paused
                } = playerState;

                this.setState({
                    "playbackPosition": position,
                    "playing": !paused
                });

            });
        }
    }

    // to be run once player starts song. sets up a timer that checks playback state every second
    initPlaybackStateUpdater() {

        // clear just in case
        this.terminatePlaybackStateUpdater();

        this.playerStateUpdaterIntervalID = setInterval(this.updatePlaybackState, 3000);

    }

    // terminates timer for checking state (to be run if song is paused)
    terminatePlaybackStateUpdater() {

        clearInterval(this.playerStateUpdaterIntervalID);

    }

    // mounts menu off screen and transitions both menus appropriately
    mountSongSearchMenu(prevScreenTransitionObservable) {

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleSongSelect = songObject => {
            Transition.out(transitionObservable);
            this.mountSongSelectMenu(songObject, transitionObservable);
        };

        const handleReturn = () => {
            Transition.out(transitionObservable);
            this.popMenu();
            Transition.in(prevScreenTransitionObservable);
        };

        // initialize jsx object
        const songSearchMenu =
            <SlideTransition
                transitionRequestObservable={transitionObservable}
                key={1}
            >
                <HUDSongSearchMenu
                    spotifyService={this.props.spotifyService}
                    selectSong={handleSongSelect}
                    onReturn={handleReturn}
                />
            </SlideTransition>;

        // mount
        this.setState(oldState => ({
            "menuStack": [
                ...oldState.menuStack,
                songSearchMenu
            ]
        }));

    }

    // mounts song select
    mountSongSelectMenu(songObject, prevScreenTransitionObservable) {

        // update state to contain selected song.
        this.setState({
            "selectedSong": songObject
        });

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleConfirmation = () => {
            this.initPlaybackStateUpdater();

            this.setState({
                "displayLoadingOverlay": true,
                "mountLoadingOverlay": true
            });

            Transition.out(transitionObservable);
            // get audio features, emit them to game
            this.props.spotifyService
                .getAudioAnalysisAndFeatures(
                    songObject.id,
                        object => {
                            // log
                            console.log("Features and analysis: ", object);

                            // emit data to game
                            this.props.gameStateController.request(GameStateEnums.GENERATE, object);

                        }
                );

            // connect to player
            this.props.spotifyService.activate();

            this.mainMenu();
        };

        const handleReturn = () => {
            Transition.out(transitionObservable);
            this.popMenu();
            Transition.in(prevScreenTransitionObservable);
        };

        // initialize jsx object
        const songSearchMenu =
            <SlideTransition
                transitionRequestObservable={transitionObservable}
                key={2}
            >
                <HUDSongSelectMenu
                    songObject={songObject}
                    onConfirmation={handleConfirmation}
                    onReturn={handleReturn}
                />
            </SlideTransition>;

        // mount
        this.setState(oldState => ({
            "menuStack": [
                ...oldState.menuStack,
                songSearchMenu
            ]
        }));

    }

    // unmounts top screen
    popMenu() {
        this.setState(oldState => {

            const oldStack = oldState.menuStack;
            oldStack.pop();

            return {"menuStack": [...oldStack]};

        });
    }

    // unmounts all menus except first
    mainMenu(show = false) {
        // eslint-disable-next-line no-unused-vars
        const showMenu = show ? Transition.in(this.mainMenuTransitionController) : null;

        this.setState(oldState => ({"menuStack": [oldState.menuStack[0]]}));
    }

    // wraps overlay rendering logic
    renderOverlay() {
        const {
            displayCompletionForm,
            displayPauseOverlay,
            displayError,
            displayWelcomeOverlay
        } = this.state;

        const {spotifyService} = this.props;

        // toggles playback twice because the SDK is hella glitchy
        const handlePause = () => {
            spotifyService.toggle()
                .then(() => spotifyService.toggle());

        };

        // toggles playback
        const handleResume = () => {
            spotifyService.toggle();
        };

        // prioritize error screen
        if (displayError) return null;
        else if (displayCompletionForm) return <FormOverlay
            zIndex={this.state.menuStack.length}
            onSubmit={respObj => {
                APIService.submitFeedback({...respObj,
                    "songID": dotProp.get(this.state, "selectedSong.id")})
                    .then(() => {
                        this.mainMenu(true);
                        this.setState({
                            "displayCompletionForm": false
                        });
                    })
                    .catch(err => console.error(err));
            }} />; // todo: setup on submit
        // callbacks
        else if (displayPauseOverlay) return <PauseOverlay
            isPlaying={this.state.playing}
            onPause={handlePause}
            onResume={handleResume}
        />;
        else if (displayWelcomeOverlay) return <MessageOverlay
            buttonText="Let's Go!"
            onButtonClick={() => this.setState({"displayWelcomeOverlay": false})}
            title="Welcome to Tune Mountain!"
            subtitle="An audio-visualizer by Léo, Cem, Jarod, and Peter"
        >
            <p>Welcome to Tune Mountain. To play this game <strong>you need</strong> a Spotify premium account, so we could play the song of your choosing. After you log in click <strong>Select Song</strong> to choose any song from Spotify*, and the game will generate a unique mountain experience for you to snowboard down on. </p>
            <p>Game controls can be viewed on the pause menu.</p>
            <p>*The song has to go through the spotify audio feature analysis, so not every song might be available.</p>
        </MessageOverlay>;
        // callbacks for fading it out

        return null;
    }

    // logic for rendering loading overlay
    renderLoadingOverlay() {

        const {
            displayLoadingOverlay,
            mountLoadingOverlay
        } = this.state;

        const observable = new Subject();

        if (displayLoadingOverlay && mountLoadingOverlay) {

            return <LoadingOverlay
                transitionObservable={observable}
                onUnmount={() => this.setState({
                    "mountLoadingOverlay": false
                })}
            />;

        }

        return null;


    }

    render() {

        // if user has not logged in yet, display incomplete main menu as the only object on screen
        const mainComponent = () => {
            if (!this.props.hasLoggedIn) {

                // initialize transition observable
                const transitionObservable = new Subject();

                /*
                 * TODO: assign appropriate fadeout handlers according to button press
                 * let fadeOutHandler = () => console.log("Fade out handler not set for main menu.");
                 */
                const onMount = () => Transition.in(transitionObservable);

                return (
                    <div>
                        <FadeTransition
                            transitionRequestObservable={transitionObservable}
                            // onEndTransitionOut={fadeOutHandler}
                            onMount={onMount}
                        >
                            <HUDMainMenu
                                onLoginRequest={this.props.spotifyService.login}
                                hasLoggedIn={false}
                            />
                        </FadeTransition>
                    </div>
                );

            }

return this.state.menuStack;

        };

        // render song progress component
        const progBar = <HUDSongProgress
            songObject={this.state.selectedSong}
            positionInMilliseconds={this.state.playbackPosition}
            shouldDisplay={this.state.playing}
            score={this.state.score}
        />;

        return(
            <div>
                {progBar}
                {this.state.errorComponent}
                {this.renderLoadingOverlay()}
                {this.renderOverlay()}
                {mainComponent()}
            </div>
        );
    }

}

// make both spotify and state controller required
HUDOverlayManager.propTypes = {
  "gameStateController": PropTypes.instanceOf(GameStateController).isRequired,
  "spotifyService": PropTypes.instanceOf(SpotifyService).isRequired,
  "hasLoggedIn": PropTypes.bool
};

// do not run game if hasLoggedIn is not passed in
HUDOverlayManager.defaultProps = {
    "hasLoggedIn": false
};

export default HUDOverlayManager;