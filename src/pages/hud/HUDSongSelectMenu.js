import React from "react";
import PropTypes from "prop-types";
import SpotifySong from "../../components/hud/SpotifySong";
import HUDButton, {HUDButtonTypesEnum} from "../../components/hud/HUDButton";
import "../../css/hud/HUDSongSelect.css";

/**
 * Component that displays selected song in the center of the screen, and that
 * progresses the flow of the application towards fetching data from a specific
 * track necessary for level generation, as well as updating game state.
 * @param {Object} props react props
 * @returns {*}
 * @constructor
 */
const HUDSongSelectMenu = props => {

    const {
        songObject,
        onConfirmation
    } = props;

    const {
        name,
        id,
        img,
        artist
    } = songObject;

    const genBtnStyle = {
        "width": "auto"
    };

    return (
        <div className="hud-song-select-outer-container">
                <SpotifySong
                    size="large"
                    name={name}
                    id={id}
                    imgURL={img}
                    artist={artist}
                />
                <HUDButton text="Generate Level" onClick={onConfirmation} style={genBtnStyle}/>
                <HUDButton text={"<"} type={HUDButtonTypesEnum.RETURN} onClick={props.onReturn}/>
        </div>
    );

};

HUDSongSelectMenu.propTypes = {
    "songObject": PropTypes.shape({
        "name": PropTypes.string.isRequired,
        "id": PropTypes.string.isRequired,
        "img": PropTypes.string,
        "artist": PropTypes.array.isRequired
    }),
    "onConfirmation": PropTypes.func.isRequired,
    "onReturn": PropTypes.func.isRequired
};

export default HUDSongSelectMenu;