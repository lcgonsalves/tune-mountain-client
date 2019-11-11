import React, {Component} from "react";
import PropTypes from "prop-types";
import {Subject} from "rxjs";
import {GameStateEnums} from "tune-mountain-input-manager";

import HUDSongSearchMenu from "../pages/hud/HUDSongSearchMenu";
import HUDMainMenu from "../pages/hud/HUDMainMenu";
import FadeTransition from "../components/transition/FadeTransition";

import {Transition} from "./TransitionUtils";
import SlideTransition from "../components/transition/SlideTransition";
import HUDSongSelectMenu from "../pages/hud/HUDSongSelectMenu";

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
            "errorComponent": null,
            "menuStack": []
        };

        this.mainMenuTransitionController = null;

        // handle request for song to be played
        this.props.gameStateController.onNotificationOf(GameStateEnums.PLAY, () => {
            // only proceed if selected song exists
            if (this.state.selectedSong) {
                this.props.spotifyService.play(this.state.selectedSong.id);
            }
        });

        // binding functions
        this.mountSongSearchMenu = this.mountSongSearchMenu.bind(this);
        this.mountSongSelectMenu = this.mountSongSelectMenu.bind(this);
        this.popMenu = this.popMenu.bind(this);
        this.mainMenu = this.mainMenu.bind(this);
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

                            // TODO: remove forcing song to start playing
                            this.props.gameStateController.notify(GameStateEnums.PLAY);
                        }
                );


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
    mainMenu() {
        this.setState(oldState => ({"menuStack": [oldState.menuStack[0]]}));
    }

    render() {

        // if user has not logged in yet, display incomplete main menu as the only object on screen
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

        return(
            <div>
                {this.state.errorComponent}
                {this.state.menuStack}
            </div>
        );
    }

}

// make both spotify and state controller required
HUDOverlayManager.propTypes = {
  "gameStateController": PropTypes.object.isRequired,
  "spotifyService": PropTypes.object.isRequired,
  "hasLoggedIn": PropTypes.bool
};

// do not run game if hasLoggedIn is not passed in
HUDOverlayManager.defaultProps = {
    "hasLoggedIn": false
};

export default HUDOverlayManager;