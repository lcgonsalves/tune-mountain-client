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
        onMount
    } = props;

    // default to transitioning in on mount
    const mountHandler = onMount ? onMount : () => Transition.in(transitionRequestObservable);

    return (
        <GenericTransitionWrapper
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
    "children": PropTypes.any
};

FadeTransition.defaultProps = {
    "shouldMountIn": false
};

export default FadeTransition;