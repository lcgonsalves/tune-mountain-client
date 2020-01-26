import React from "react";
import PropTypes from "prop-types";
import SpotifySong from "./SpotifySong";
import "../../css/hud/HUDSongProgress.css";

const HUDSongProgress = props => {

    const {
        songObject,
        positionInMilliseconds,
        shouldDisplay
    } = props;

    if (!songObject) return null;

    const {
        name,
        id,
        img,
        artist,
        duration
    } = songObject;

    const percentage = positionInMilliseconds / duration * 100;

    const barProperties = {
        "width": `${percentage}%`
    };

    const componentStyle = {
        "display": shouldDisplay ? "block" : "none"
    };

    return (
        <div
            className={"song-progress-bar-container"}
            style={componentStyle}
        >
            <div id={"bar-wrapper"}>
                <div
                    id={"progress-bar"}
                    style={barProperties}
                />
            </div>
            <div className={"progress-bar-song-icon"}>
                {
                    <SpotifySong
                        name={name}
                        artist={artist}
                        imgURL={img}
                        id={id}
                        size={"mini"}
                    />
                }
            </div>
        </div>
    );

};

HUDSongProgress.propTypes = {
    "songObject": PropTypes.shape({
        "name": PropTypes.string,
        "id": PropTypes.string,
        "img": PropTypes.string,
        "artist": PropTypes.array,
        "duration": PropTypes.number
    }),
    "positionInMilliseconds": PropTypes.number.isRequired,
    "shouldDisplay": PropTypes.bool.isRequired
};

export default HUDSongProgress;