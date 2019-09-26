import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/HUDButton.css";

/**
 * Enumeration that defines types of button CSS layouts supported. Buttons instantiated without
 * a type will default to SMALL.
 * This value is emitted along with the original click event.
 * @type {Readonly<{RETURN: string, SMALL: string, LARGE: string, ENTER: string}>}
 */
export const HUDButtonTypesEnum = Object.freeze({
    "SMALL": "hud-button-small",
    "LARGE": "hud-button-large",
    "RETURN": "hud-button-return",
    "ENTER": "hud-button-enter"
});

/**
 * Wrapper for HTML Button element. Sanitizes button text and has preset styles.
 * Emits button type on click.
 *
 * @param {Object} props React properties
 * @returns {React.Component} JSX element
 * @constructor
 */
const HUDButton = props => {

    // props
    const {
        type,
        text,
        onClick
    } = props;

    // check if passed type exists
    const classes = Object.values(HUDButtonTypesEnum);
    const isValidType = classes.findIndex(element => element === type) !== -1;
    const filteredType = isValidType ? type : HUDButtonTypesEnum.SMALL;

    // return jsx
    return (
        <button
            className={`${filteredType} hud-button`}
            onClick={(event => {
                event.buttonType = filteredType;
                onClick(event);
            })}
        >
            {text}
        </button>
    );

};

// prop types for development
HUDButton.propTypes = {
    "type": PropTypes.string,
    "text": PropTypes.string,
    "onClick": PropTypes.func
};

// default props
HUDButton.defaultProps = {
    "type": HUDButtonTypesEnum.SMALL,
    "text": "Button Text Not Set",
    "onClick": () => console.error("Click handler not set for this button.")
};

export default HUDButton;