import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/Controls.css";

const Controls = props => {

    const {
        controlMap,
        highlight,
        hide
    } = props;

    const arrow = " \u27f6 ";

    return <div className={`control-display-wrapper ${highlight ? "highlight bounce animated" : ""} ${hide ? "hide" : ""}`}>
        <h1>Controls:</h1>
        {
            Object.keys(controlMap).map((key, index) => <h3 key={key + index}>
                <strong>{key}</strong>{arrow}{controlMap[key]}
            </h3>)
        }
    </div>;
};

Controls.propTypes = {
    "controlMap": PropTypes.object.isRequired,
    "highlight": PropTypes.bool,
    "hide": PropTypes.bool
};

Controls.defaultProps = {
    "controlMap": {
        "Spacebar": "Jump",
        "W": "Trick 1",
        "A": "Trick 2",
        "S": "Trick 3",
        "D": "Trick 4"
    },
    "highlight": false
};

export default Controls;