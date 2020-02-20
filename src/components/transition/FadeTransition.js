import React from "react";
import PropTypes from "prop-types";
import GenericTransitionWrapper from "./GenericTransitionWrapper";
import {Transition} from "../../utils/TransitionUtils";

const FadeTransition = props => {

    const {
        shouldMountIn,
        onStartTransitionIn,
        onStartTransitionOut,
        onEndTransitionIn,
        onEndTransitionOut,
        transitionRequestObservable,
        onMount,
        zIndex
    } = props;

    // default to transitioning in on mount
    const mountHandler = onMount ? onMount : () => Transition.in(transitionRequestObservable);

    return (
        <GenericTransitionWrapper
            zIndex={zIndex}
            OUT={{"opacity": 0}}
            IN={{"opacity": 1}}
            shouldMountIn={shouldMountIn}
            transitionRequestObservable={transitionRequestObservable}
            onMount={mountHandler}
            onEndTransitionIn={onEndTransitionIn}
            onEndTransitionOut={onEndTransitionOut}
            onStartTransitionIn={onStartTransitionIn}
            onStartTransitionOut={onStartTransitionOut}
        >{props.children}</GenericTransitionWrapper>

    );

};

FadeTransition.propTypes = {
    "onStartTransitionIn": PropTypes.func,
    "onStartTransitionOut": PropTypes.func,
    "onEndTransitionIn": PropTypes.func,
    "onEndTransitionOut": PropTypes.func,
    "onMount": PropTypes.func,
    "transitionRequestObservable": PropTypes.any.isRequired,
    "shouldMountIn": PropTypes.bool,
    "zIndex": PropTypes.number
};

FadeTransition.defaultProps = {
    "shouldMountIn": false,
    "zIndex": 0
};

export default FadeTransition;