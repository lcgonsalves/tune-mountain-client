import React, {Component} from "react";
import PropTypes from "prop-types";
import {Subject} from "rxjs";
import {GameStateEnums, GameStateController} from "tune-mountain-input-manager";

import HUDSongSearchMenu from "../pages/hud/HUDSongSearchMenu";
import HUDMainMenu from "../pages/hud/HUDMainMenu";
import HUDSongProgress from "../components/hud/HUDSongProgress";
import HUDButton, {HUDButtonTypesEnum} from "../components/hud/HUDButton";
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
import HUDLeaderboardsMenu from "../pages/hud/HUDLeaderboardsMenu";

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
            "multiplier": 1,
            "displayCompletionForm": false,
            "displayPauseOverlay": false,
            "displayLoadingOverlay": false,
            "mountLoadingOverlay": false,
            "displayWelcomeOverlay": false,
            "displayNewPlayerOverlay": false,
            "displayAboutOverlay": false,
            "displayError": false,
            "replayMode": false,
            "menuStack": []
        };

        this.mainMenuTransitionController = null;

        // handle request for song to be played
        props.gameStateController.onNotificationOf(GameStateEnums.PLAY, () => {
            // only proceed if selected song exists
            if (this.state.selectedSong) {

                // begin taking inputs or sending stream of inputs
                if (this.state.replayMode) {
                    this.props.onReplayPlaybackStart();
                } else {
                    this.props.onGameStart();
                }

                // begin playback of song
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
            ({body}) => this.setState({
                "score": body.score,
                "multiplier": body.multiplier
            })
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

    /**
     * Callback for reading and updating the state of Spotify Web Player
     * @param {Object} stateObj output of Spotify Web Playback SDK player
     * @returns {void}
     */
    readAndUpdateState (stateObj) {

            const givenId = dotProp.get(stateObj, "track_window.current_track.id");
            const currentId = dotProp.get(this.state, "selectedSong.id");
            const paused = dotProp.get(stateObj, "paused");
            const position = dotProp.get(stateObj, "position");

            /*
             * case 1: selected song is different --
             *      emit idle state to game
             *      go back to Main menu
             *      pause song ?
             */
            if (givenId !== currentId) {

                // only handle mistaken change of state if completion form is not up
                if (!this.state.displayCompletionForm) {

                    this.props.gameStateController.request(
                        GameStateEnums.IDLE,
                        {"reason": "Outside forces changed the song."}
                    );

                    this.mainMenu();

                    // interrupt input collection or cancel replay
                    if (this.state.replayMode) this.props.onReplayInterruptRequest();
                    else this.props.onGameInterrupted();

                    this.setState({
                        "playing": false,
                        "displayPauseOverlay": false,
                        "replayMode": false
                    });

                    Transition.in(this.mainMenuTransitionController);

                    // make sure user cannot force Spotify Player to play any tracks
                    this.props.spotifyService.deactivate();

                    // so no useless updates are made
                    this.terminatePlaybackStateUpdater();

                }

            }

            /*
             * case 2: it's paused --
             *      emit pause state to game
             *      if the current context is *replay* terminate session
             */
            else if (paused) {

                if (this.state.replayMode) {
                    // interrupt IM
                    this.props.onReplayInterruptRequest();

                    // make sure user cannot force Spotify Player to play any tracks
                    this.props.spotifyService.deactivate();

                    this.setState({
                        "playing": false,
                        "displayPauseOverlay": false,
                        "displayCompletionForm": false
                    });

                    this.mainMenu(true);

                } else if (position === 0) {

                    this.props.gameStateController.request(
                        GameStateEnums.IDLE,
                        {"reason": "end"}
                    );

                    this.setState({
                        "playing": false,
                        "displayPauseOverlay": false,
                        "displayCompletionForm": true
                    });

                    // stop player so external inputs can't begin playback
                    this.props.spotifyService.deactivate();

                    // signal that game is over and inputs should stop being recorded, and then be stored
                    this.props.onGameFinish(this.state.score, this.state.selectedSong.id);


                } else {

                    this.props.gameStateController.request(
                        GameStateEnums.PAUSE,
                        {"reason": "paused"}
                    );

                    this.setState({
                        "playing": false,
                        "playbackPosition": position
                    });

                    // pause input collection
                    this.props.onGamePause();


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

                // resume inputs


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
        const handleLeaderboardsRequest = () => {
            // first transition main menu out
            Transition.out(transitionObservable);

            // transition song search menu in
            this.mountLeaderboardsPage(transitionObservable);
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
                        onLeaderboardsPageRequest={handleLeaderboardsRequest}
                        onAboutPageRequest={() => this.setState({"displayAboutOverlay": true})}
                    />
                </FadeTransition>
            ]
        });

        // show welcome in a couple seconds if appropriate
        if (!localStorage.getItem("welcome")) setTimeout(() => {
            // set state if never accessed
            this.setState({
                "displayWelcomeOverlay": true
            });

            // set welcome to true
            localStorage.setItem("welcome", "true");

        }, 1500);

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

    // mounts leaderboards page and sets up hooks to change HUDOverlayManager state to replay
    mountLeaderboardsPage(prevScreenTransitionObservable) {

        // todo: mount leaderboards menu

        // todo: hook function calls to fetch replays

        // todo: hook state update to change state to replay

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleReturn = () => {
            // Transition.out(transitionObservable);
            this.popMenu();
            Transition.in(prevScreenTransitionObservable);
        };

        const handleReplayRequest = (songObject, inputHistory) => {

            this.initPlaybackStateUpdater();

            // tells app to load input history
            this.props.onReplayBeginRequest(inputHistory);

            this.setState({
                "selectedSong": songObject,
                "displayLoadingOverlay": true,
                "mountLoadingOverlay": true,
                "replayMode": true
            });

            // Transition.out(transitionObservable);

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

            // remove all screens but main menu, but don't show it
            this.mainMenu();
        };

        // initialize jsx object
        const songSearchMenu =
            <SlideTransition
                transitionRequestObservable={transitionObservable}
                key={1}
            >
                <HUDLeaderboardsMenu
                    spotifyService={this.props.spotifyService}
                    onReturn={handleReturn}
                    onReplayRequest={handleReplayRequest}
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

    // mounts menu off screen and transitions both menus appropriately
    mountSongSearchMenu(prevScreenTransitionObservable) {

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleSongSelect = songObject => {
            Transition.out(transitionObservable);
            this.mountSongSelectMenu(songObject, transitionObservable);
        };

        const handleReturn = () => {
            // Transition.out(transitionObservable);
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
                "mountLoadingOverlay": true,
                "replayMode": false
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
            // Transition.out(transitionObservable);
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
        // todo: remove this once Game properly accounts for its pointers
        // eslint-disable-next-line
        if (show) location.reload();

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
            displayWelcomeOverlay,
            displayAboutOverlay,
            replayMode
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

        const hideAbout = () => this.setState({
            "displayAboutOverlay": false
        });

        /*
         * todo: create replay overlay
         * todo: account for replay state to avoid pauses as well as completion form
         */

        // prioritize error screen
        if (displayError) return null;
        else if (!replayMode && displayCompletionForm) return <FormOverlay
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
            }}
            onCancel={() => {
                this.mainMenu(true);
                this.setState({
                    "displayCompletionForm": false
                });
            }}
        />;
        // callbacks
        else if (!replayMode && displayPauseOverlay) return <PauseOverlay
            isPlaying={this.state.playing}
            onPause={handlePause}
            onResume={handleResume}
        />;
        else if (replayMode && displayPauseOverlay) return <HUDButton
            onClick={handleResume}
            className={"play-pause-btn"}
            text="Cancel"
            style={{
                "zIndex": 10,
                "top": "1vh",
                "right": "2vh"
            }}
        />;
        else if (displayWelcomeOverlay) return <MessageOverlay
            buttonText="Let's Go!"
            onButtonClick={() => this.setState({"displayWelcomeOverlay": false})}
            title="Welcome to Tune Mountain!"
            subtitle="An audio-visualizer by Léo, Cem, and Jarod, with art by Peter, Joy, and Ali."
        >
            <p>Welcome to Tune Mountain. To play this game <strong>you need</strong> a Spotify premium account, so we could play the song of your choosing. After you log in click <strong>Select Song</strong> to choose any song from Spotify*, and the game will generate a unique mountain experience for you to snowboard down on. </p>
            <p>Game controls can be viewed on the pause menu.</p>
            <p>*The song has to go through the spotify audio feature analysis, so not every song might be available.</p>
        </MessageOverlay>;
        else if (displayAboutOverlay) return <MessageOverlay
            buttonText={"Go back"}
            onButtonClick={hideAbout}
            title={"About Tune Mountain"}
            subtitle={"An audio-visualizer MQP by Léo, Cem, and Jarod, with art by Peter, Joy, and Ali."}
        >
            <p>Tune Mountain is a snowboarding game with procedurally-generated mountain courses. Using Spotify’s Web API to obtain structural metadata of a song chosen by the player, we calculate a downhill slope conformed to the “shape” of the song, and allow the player to navigate this slope in a physics-driven simulation while listening to the associated music. Players accumulate points by successfully completing tricks and collecting snowballs, and are able to compare high scores on a leaderboard, as well as view replays of their sessions.</p>
            <p>You can find our source code for the web app <a href="https://github.com/lcgonsalves/tune-mountain-client" rel="noopener noreferrer" target="_blank">here!</a></p>
            <p>Follow these links to find out more about the authors of this project: <a href="https://www.leogons.com/about" rel="noopener noreferrer" target="_blank">Leo Gonsalves</a>, <a href="https://github.com/calemdar" rel="noopener noreferrer" target="_blank">Cem Alemdar</a>, <a href="https://github.com/jsthompson16" rel="noopener noreferrer" target="_blank">Jarod Thompson</a>.</p>
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

        const showAbout = () => this.setState({
            "displayAboutOverlay": true
        });

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
                                onAboutPageRequest={showAbout}
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
            multiplier={this.state.multiplier}
            replayMode={this.state.replayMode}
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
    "user": PropTypes.shape({
        "imageUrl": PropTypes.string.isRequired,
        "displayName": PropTypes.string.isRequired,
        "spotifyID": PropTypes.string.isRequired
    }).isRequired,
    "hasLoggedIn": PropTypes.bool,
    "onGamePause": PropTypes.func.isRequired,
    "onGameResume": PropTypes.func.isRequired,
    "onGameStart": PropTypes.func.isRequired,
    "onGameFinish": PropTypes.func.isRequired,
    "onGameInterrupted": PropTypes.func.isRequired,
    "onReplayBeginRequest": PropTypes.func.isRequired,
    "onReplayPlaybackStart": PropTypes.func.isRequired,
    "onReplayInterruptRequest": PropTypes.func.isRequired
};

// do not run game if hasLoggedIn is not passed in
HUDOverlayManager.defaultProps = {
    "hasLoggedIn": false,
    "user": {
        "displayName": null,
        "imageUrl": null,
        "spotifyID": null
    }
};

export default HUDOverlayManager;
