import React from "react";
import PropTypes from "prop-types";
import FadeTransition from "../transition/FadeTransition";
import {Subject} from "rxjs";
import "../../css/hud/LoadingOverlay.css";
import Controls from "./Controls";

const LoadingOverlay = props => {

    const {
        transitionObservable,
        onUnmount
    } = props;

    return (
        <FadeTransition
            transitionRequestObservable={transitionObservable}
            shouldMountIn={false}
            zIndex={3}
            onEndTransitionOut={onUnmount} >

            <div className="loading-overlay-container">
                <div className="lds-roller">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <h2 className="loading-text">Generating mountain...</h2>
                <Controls />
            </div>

        </FadeTransition>
    );

};

LoadingOverlay.propTypes = {
    "transitionObservable": PropTypes.instanceOf(Subject).isRequired,
    "onUnmount": PropTypes.func
};

export default LoadingOverlay;