import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/SpotifySong.css";

/**
 * React element for rendering a song and handling clicks on that element to select a song.
 * @param {Object} props react properties
 * @constructor
 */
const SpotifySongListItem = props => {

    const {
        name,
        id,
        imgURL,
        artist,
        handleClick
    } = props;

    const renderArtistArray = arr => {

        let str = "";

        arr.forEach((artist, index) => {
           str += artist;
           str += index + 1 === arr.length ? "" : ", ";
        });

        return str;
    };

    return (
        <div className="song-li-container" onClick={() => handleClick({
            name,
            id,
            imgURL,
            artist
        })}>
            <img className="song-image" src={imgURL}/>
            <div className="song-data-container">
                <h1 className="song-name">{name}</h1>
                <h2 className="song-artist">{renderArtistArray(artist)}</h2>
            </div>
        </div>
    );

};

SpotifySongListItem.defaultProps = {
    "name": "No Song Name Assigned",
    "id": "No ID Passed",
    "imgURL": "No image URL passed",
    "artist": "No Artist",
    "handleClick": () => {
        throw new Error("No click handler passed");
    }
};

SpotifySongListItem.propTypes = {
    "name": PropTypes.string,
    "id": PropTypes.string,
    "imgURL": PropTypes.string,
    "artist": PropTypes.array,
    "handleClick": PropTypes.func
};

export default SpotifySongListItem;