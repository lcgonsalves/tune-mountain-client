import React from "react";
import PropTypes from "prop-types";
import HUDButton, {HUDButtonTypesEnum} from "../../components/hud/HUDButton";
import "../../css/hud/HUDMainMenu.css";

/**
 * HUD element that wraps all objects in main menu. Two types of main menu can exist:
 * pre and post login.
 * @param {Object} props react props
 * @constructor
 */
const HUDMainMenu = props => {

    const {
        hasLoggedIn,
        onSongSelectRequest,
        onLoginRequest,
        onAboutPageRequest,
        onLeaderboardsPageRequest
    } = props;

    // // // BUTTONS // // //
    const spotifyLoginButton = <HUDButton
        text="Spotify Login"
        onClick={onLoginRequest}
        type={HUDButtonTypesEnum.SPOTIFY}
    />;

    const selectSongButton = <HUDButton
        text="Select Song"
        onClick={onSongSelectRequest}
        type={HUDButtonTypesEnum.SPOTIFY}
    />;

    const aboutButton = <HUDButton
        text="About"
        onClick={onAboutPageRequest}
    />;

    const leaderboardsButton = <HUDButton
        text="Leaderboards"
        onClick={onLeaderboardsPageRequest}
    />;

    // determines which top button will be rendered
    const mainButton = hasLoggedIn ? selectSongButton : spotifyLoginButton;

    return (

        <div className="hud-main-menu-outer-container">
            <div className="hud-main-menu-button-container">
                {mainButton}
                {hasLoggedIn && leaderboardsButton}
                {aboutButton}
            </div>
        </div>

    );

};

// prop type constraints
HUDMainMenu.propTypes = {
    "hasLoggedIn": PropTypes.bool,
    "onSongSelectRequest": PropTypes.func,
    "onLoginRequest": PropTypes.func,
    "onAboutPageRequest": PropTypes.func,
    "onLeaderboardsPageRequest": PropTypes.func
};

// default properties
HUDMainMenu.defaultProps = {
    "hasLoggedIn": false,
    "onSongSelectRequest": () => {
        throw new Error("No handler passed.");
    },
    "onLoginRequest": () => {
        throw new Error("No handler passed.");
    },
    "onAboutPageRequest": () => {
        throw new Error("No handler passed.");
    },
    "onLeaderboardsPageRequest": () => {
        throw new Error("No handler passed.");
    }
};

export default HUDMainMenu;
