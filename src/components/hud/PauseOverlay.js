import React from "react";
import HUDButton from "./HUDButton";
import pauseIcon from "../../img/pause.png";
import playIcon from "../../img/play.png";
import "../../css/hud/PauseOverlay.css";
import Controls from "./Controls";

const PauseOverlay = props => {

    const {
        isPlaying,
        onPause,
        onResume
    } = props;

    const handleClick = () => {
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
            <Controls highlight={!isPlaying} hide={isPlaying} />
        </div>
    );

};

export default PauseOverlay;