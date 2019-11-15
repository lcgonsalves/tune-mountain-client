import React, {Component} from "react";
import PropTypes from "prop-types";
import "../../css/hud/HUDButton.css";

/**
 * Enumeration that defines types of button CSS layouts supported. Buttons instantiated without
 * a type will default to SMALL.
 * This value is emitted along with the original click event.
 * @type {Readonly<{RETURN: string, SMALL: string, LARGE: string, ENTER: string}>}
 */
export const HUDButtonTypesEnum = Object.freeze({
    "SMALL": "SMALL",
    "LARGE": "LARGE",
    "RETURN": "RETURN",
    "ENTER": "ENTER"
});

const TypeToClassMap = Object.freeze({
    "SMALL": "hud-button-small",
    "LARGE": "hud-button-large",
    "RETURN": "hud-button-return",
    "ENTER": "hud-button-enter"
});

const TypeToStyleMap = Object.freeze({
    "SMALL": {
        "borderBottom": "solid 4px",
        "borderLeft": "solid 4px",
        "marginTop": "1.5vw",
        "height": "5vw"
    },
    "RETURN": {
        "width": "7.8vw",
        "height": "7vw",
        "borderBottom": "solid 4px",
        "borderLeft": "solid 4px"
    },
    "ENTER": {}
});

/**
 * Wrapper for HTML Button element. Sanitizes button text and has preset styles.
 * Emits button type on click.
 *
 * @param {Object} props React properties
 * @returns {React.Component} JSX element
 * @constructor
 */
class HUDButton extends Component {

    constructor(props) {
        super(props);

        this.state = {
            "isHovering": false
        };
    }


    render() {

        // props
        const {
            type,
            text,
            onClick
        } = this.props;

        const {
            isHovering
        } = this.state;

        // check if passed type exists
        const isValidType = Boolean(HUDButtonTypesEnum[type]);
        const filteredType = isValidType ? TypeToClassMap[type] : TypeToClassMap.SMALL;

        const onHover = () => this.setState({"isHovering": true});
        const onHoverEnd = () => this.setState({"isHovering": false});

        // return jsx
        return (
            <div onMouseEnter={onHover} onMouseLeave={onHoverEnd} className={"button-wrapper"}>
                <button
                    style={isHovering ? TypeToStyleMap[type] : null}
                    className={`${filteredType} hud-button`}
                    onClick={(event => {
                        event.buttonType = filteredType;
                        onClick(event);
                    })}
                >
                    {text}
                </button>
            </div>
        );

    }

}

// prop types for development
HUDButton.propTypes = {
    "type": PropTypes.string,
    "text": PropTypes.string,
    "onClick": PropTypes.func,
    "onHover": PropTypes.func,
    "onHoverEnd": PropTypes.func,
    "isHovering": PropTypes.bool
};

// default props
HUDButton.defaultProps = {
    "type": HUDButtonTypesEnum.SMALL,
    "text": "Button Text Not Set",
    "onClick": () => console.error("Click handler not set for this button."),
    "onHover": () => console.error("Hover handler not set for this button."),
    "onHoverEnd": () => console.error("End Hover handler not set for this button."),
    "isHovering": false
};

export default HUDButton;