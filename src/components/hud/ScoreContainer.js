import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/ScoreContainer.css";

const ScoreContainer = props => {
    if (props.replayMode) {
        return <div className="score-container">
            <h2>Replaying...</h2>
        </div>;

    }

    return <div className="score-container">
                <h2>Score: </h2><h1>{props.score}</h1><h2 style={{"marginLeft": "10px"}}>x{props.multiplier}</h2>
            </div>;

};

ScoreContainer.propTypes = {
    "score": PropTypes.number.isRequired,
    "multiplier": PropTypes.number.isRequired,
    "replayMode": PropTypes.bool
};

export default ScoreContainer;
