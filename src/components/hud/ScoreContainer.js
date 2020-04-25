import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/ScoreContainer.css";

const ScoreContainer = props => <div className="score-container">
        <h2>Score: </h2><h1>{props.score}</h1><h1>x {props.multiplier}</h1>
    </div>;

ScoreContainer.propTypes = {
    "score": PropTypes.number.isRequired,
    "multiplier": PropTypes.number.isRequired
};

export default ScoreContainer;
