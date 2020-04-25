import React, {Component} from "react";
import PropTypes from "prop-types";
import returnIcon from "../../img/return.png";
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
    "ENTER": "ENTER",
    "SPOTIFY": "SPOTIFY"
});

const TypeToClassMap = Object.freeze({
    "SMALL": "hud-button-small",
    "LARGE": "hud-button-large",
    "RETURN": "hud-button-return",
    "ENTER": "hud-button-enter",
    "SPOTIFY": "hud-button-small spotify-button"
});

const TypeToStyleMap = Object.freeze({ // todo: pull this out onto css document
    "SMALL": "hud-button-small-pressed",
    "RETURN": "hud-button-return-pressed",
    "ENTER": "hud-button-enter-pressed",
    "SPOTIFY": "hud-button-small-pressed"
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

        this.btnRef = React.createRef();
    }


    render() {

        // props
        const {
            type,
            text,
            onClick,
            style,
            children,
            className,
            disabled // todo: make it pressed when disabled
        } = this.props;

        const {
            isHovering
        } = this.state;

        // check if passed type exists
        const isValidType = Boolean(HUDButtonTypesEnum[type]);
        const filteredType = isValidType ? TypeToClassMap[type] : TypeToClassMap.SMALL;
        const buttonContent = () => {
            if (type === HUDButtonTypesEnum.RETURN) return <img src={returnIcon} alt="return icon"/>;
            else if (text) return String(text).toLowerCase();

            return children;
        };

        const onHover = () => this.setState({"isHovering": !disabled && true});
        const onHoverEnd = () => this.setState({"isHovering": false});

        // return jsx
        return (
            <div onMouseEnter={onHover}
                 onMouseOver={onHover}
                 onMouseLeave={onHoverEnd}
                 className={`button-wrapper ${className}`}
                 style={style}
            >
                <button
                    ref={this.btnRef}
                    className={`hud-button ${filteredType} ${isHovering ? `${TypeToStyleMap[type]} pressed` : ""}`}
                    disabled={disabled}
                    onClick={(event => {
                        this.btnRef.current.blur();
                        event.buttonType = filteredType;
                        onClick(event);
                    })}
                >
                    {buttonContent()}
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
    "isHovering": PropTypes.bool,
    "style": PropTypes.object,
    "className": PropTypes.string,
    "disabled": PropTypes.bool
};

// default props
HUDButton.defaultProps = {
    "type": HUDButtonTypesEnum.SMALL,
    "text": "Button Text Not Set",
    "onClick": () => console.error("Click handler not set for this button."),
    "onHover": () => console.error("Hover handler not set for this button."),
    "onHoverEnd": () => console.error("End Hover handler not set for this button."),
    "className": "",
    "isHovering": false,
    "disabled": false
};

export default HUDButton;
