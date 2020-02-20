import React, {Component} from "react";
import PropTypes from "prop-types";
import {TransitionEnums} from "../../utils/TransitionUtils";
import "../../css/GenericTransitionWrapper.css";

/**
 * Component responsible for generating a wrapper DIV with properties that allow
 * for controllable transition in and out of screen, with the ability to track
 * the beginning and end of each transition independently.
 *
 * Transition types are not specified, and are expected to be passed as an object
 * containing all CSS properties that represent either IN or OUT.
 *
 * @param {Object} props should contain functions for handling end of transitions, and definitions for changes that
 * entail IN or OUT states.
 * @constructor
 */
class GenericTransitionWrapper extends Component {

    constructor(props) {
        super(props);

        // define IN and OUT attributes.
        const {
            IN,
            OUT,
            transitionRequestObservable
        } = props;

        // determines whether wrapped element starts in or out of the viewport
        this.state = {
            "position": props.shouldMountIn ? TransitionEnums.IN : TransitionEnums.OUT,
            "currentStyle": props.shouldMountIn ? IN : OUT
        };

        // handle transition requests
        transitionRequestObservable.delay(250).subscribe(msg => {

            const {
                position
            } = msg;

            if (position === TransitionEnums.IN) {

                this.handleTransitionStart(position);
                this.setState({
                    position,
                    "currentStyle": props.IN
                });

            } else if (position === TransitionEnums.OUT) {

                this.handleTransitionStart(position);
                this.setState({
                    position,
                    "currentStyle": props.OUT
                });

            } else console.error("Invalid position request. Position passed: ", position);

        });

        // bind functions
        this.handleTransitionStart = this.handleTransitionStart.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

    }

    componentDidMount() {

        const {
            onMount
        } = this.props;

        if (onMount) onMount();

    }

    /**
     * Handles start of transition, and calls appropriate handler prop.
     * @param {TransitionEnums} position Enumeration designating desired change
     * @returns {void}
     */
    handleTransitionStart(position) {

        switch(position) {

            case TransitionEnums.IN:
                // break if no assigned functions
                if (!this.props.onStartTransitionIn) break;
                this.props.onStartTransitionIn();
                break;
            case TransitionEnums.OUT:
                // break if no assigned functions
                if (!this.props.onStartTransitionOut) break;
                this.props.onStartTransitionOut();
                break;
            default:
                console.error("'Position' state not appropriate: ", position);
                break;
        }

    }

    /**
     * Handles end of transition, and calls appropriate handler prop.
     * @returns {void}
     */
    handleTransitionEnd() {

        switch(this.state.position) {

            case TransitionEnums.IN:
                if (!this.props.onEndTransitionIn) break;
                this.props.onEndTransitionIn();
                break;
            case TransitionEnums.OUT:
                if (!this.props.onEndTransitionOut) break;
                this.props.onEndTransitionOut();
                break;
            default:
                console.error("'Position' state not appropriate: ", this.state.position);
                break;
        }

    }

    render() {
        return (
            <div
                className={"transition-wrapper"}
                style={{
                    ...this.state.currentStyle,
                    "zIndex": this.props.zIndex
                }}
                onTransitionEnd={this.handleTransitionEnd}
            >
                {this.props.children}
            </div>
        );
    }


}

GenericTransitionWrapper.propTypes = {
    "IN": PropTypes.object.isRequired,
    "OUT": PropTypes.object.isRequired,
    "shouldMountIn": PropTypes.bool,
    "children": PropTypes.any,
    "onStartTransitionIn": PropTypes.func,
    "onStartTransitionOut": PropTypes.func,
    "onEndTransitionIn": PropTypes.func,
    "onEndTransitionOut": PropTypes.func,
    "transitionRequestObservable": PropTypes.any.isRequired,
    "onMount": PropTypes.func,
    "zIndex": PropTypes.number
};

GenericTransitionWrapper.defaultProps = {
    "onMount": () => console.log("Component mounted."),
    "onStartTransitionIn": null,
    "onStartTransitionOut": null,
    "onEndTransitionIn": null,
    "onEndTransitionOut": null,
    "shouldMountIn": false,
    "zIndex": 0
};

export default GenericTransitionWrapper;