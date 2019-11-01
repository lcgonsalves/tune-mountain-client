import React, {Component} from "react";
import PropTypes from "prop-types";
import {Subject} from "rxjs";

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

        // observer that notifies game of state changes coming from HUD interactions
        this.gameStateManager = props.gameStateManager;

        // will initialize the menu stack with main menu assuming login has been performed
        this.state = {
            "errorComponent": null,
            "menuStack": []
        };

        // binding functions
        this.mountSongSearchMenu = this.mountSongSearchMenu.bind(this);
        this.mountSongSelectMenu = this.mountSongSelectMenu.bind(this);
        this.popMenu = this.popMenu.bind(this);
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

        // initialize transition observable
        const transitionObservable = new Subject();

        const handleConfirmation = () => {
            Transition.out(transitionObservable);

            console.log("song confirmed!");
            console.log(songObject);
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

        }, () => console.log("Screen popped."));
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

HUDOverlayManager.propTypes = {
  "gameStateManager": PropTypes.object,
  "spotifyService": PropTypes.object,
  "hasLoggedIn": PropTypes.bool
};

export default HUDOverlayManager;