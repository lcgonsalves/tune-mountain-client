import React from "react";
import HUDButton from "./HUDButton";
import pauseIcon from "../../img/pause.png";
import playIcon from "../../img/play.png";
import "../../css/hud/PauseOverlay.css";

const PauseOverlay = props => {

    const {
        isPlaying,
        onPause,
        onResume
    } = props;

    const handleClick = evt => {
        console.log(isPlaying ? "running onPause()" : "running onResume()");

        if (isPlaying) onPause();
        onResume();
    };

    return (
        <div className={`pause-overlay-container ${isPlaying ? "" : "cover-screen"}`}>
            <HUDButton
                className={`play-pause-btn ${isPlaying ? "playing" : "paused"}`}
                onClick={handleClick}
                text="" >
                <img src={isPlaying ? pauseIcon : playIcon} alt="Play/Pause Icon"/>
            </HUDButton>
        </div>
    );

};

export default PauseOverlay;