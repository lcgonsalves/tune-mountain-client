import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/SpotifySong.css";
import {trimEnd} from "../../utils/StringTools";

const SongContainerClassMap = Object.freeze({
    "small": "song-container-small",
    "large": "song-container-large",
    "mini": "song-container-mini"
});

/**
 * React element for rendering a song and handling clicks on that element to select a song.
 *
 * Two styles are supported. Props.size can be either "small", "large", or "mini"
 * @param {Object} props react properties
 * @constructor
 */
const SpotifySong = props => {

    const {
        name,
        id,
        imgURL,
        artist,
        duration,
        handleClick,
        size
    } = props;

    const renderArtistArray = arr => {

        let str = "";

        arr.forEach((artistInArray, index) => {
           str += artistInArray;
           str += index + 1 === arr.length ? "" : ", ";
        });

        return str;
    };

    return (
        <div className={`${SongContainerClassMap[size]} song-container`} onClick={() => handleClick({
            name,
            id,
            imgURL,
            artist,
            duration
        })}>
            <img className="song-image" src={imgURL} alt={`Album cover for song ${name} by artist ${artist}`}/>
            <div className="song-data-container">
                <h1 className="song-name">{trimEnd(name)}</h1>
                <h2 className="song-artist">{trimEnd(renderArtistArray(artist))}</h2>
            </div>
        </div>
    );

};

SpotifySong.defaultProps = {
    "name": "No Song Name Assigned",
    "id": "No ID Passed",
    "imgURL": "No image URL passed",
    "artist": "No Artist",
    "duration": -1,
    "handleClick": () => {
        console.log("Song clicked!");
    },
    "size": "small"
};

SpotifySong.propTypes = {
    "name": PropTypes.string,
    "id": PropTypes.string,
    "imgURL": PropTypes.string,
    "artist": PropTypes.array,
    "duration": PropTypes.number,
    "handleClick": PropTypes.func,
    "size": PropTypes.string
};

export default SpotifySong;