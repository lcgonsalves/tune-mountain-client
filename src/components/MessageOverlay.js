import React from "react";
import PropTypes from "prop-types";
import HUDButton, {HUDButtonTypesEnum} from "./hud/HUDButton";
import "../css/MessageOverlay.css";
import LoremIpsum from "../utils/LoremIpsum";
import FadeTransition from "./transition/FadeTransition";
import {Subject} from "rxjs";
import {Transition} from "../utils/TransitionUtils";

/**
 * Renders an overlay with a button. Possible to pass either
 * a title, subtitle and body to text, or title, subtitle, and child props.
 * @param {Object} props
 * @returns {jsx} the jsx object
 * @constructor
 */
const MessageOverlay = props => {

    const {
        buttonText,
        onButtonClick,
        title,
        subtitle,
        paragraphs,
        children
    } = props;

    if (children && paragraphs) {

        console.error("You can pass either an array of paragraphs or children to be rendered.");

        return null;

    }

    const subtitleElement = subtitle ? <h2>{subtitle}</h2> : null,
          titleElement = title ? <h1>{title}</h1> : null;

    let bodyElement = null;

    if (children) bodyElement = children;
    else if (paragraphs && Array.isArray(paragraphs)) bodyElement = paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>);

    const transitionObservable = new Subject();
    const handleButtonClick = () => Transition.out(transitionObservable);

    return (

            <FadeTransition
                transitionRequestObservable={transitionObservable}
                shouldMountIn={false}
                zIndex={3}
                onEndTransitionOut={onButtonClick} >

                <div className="message-overlay-outer-container">
                    <div className="message-overlay-body-container">
                        {titleElement}
                        {subtitleElement}
                        {bodyElement}
                        <br/>
                        <HUDButton type={HUDButtonTypesEnum.SMALL} text={buttonText} onClick={handleButtonClick} />
                    </div>
                </div>
            </FadeTransition>
    );

};

MessageOverlay.propTypes = {
    "buttonText": PropTypes.string,
    "onButtonClick": PropTypes.func.isRequired,
    "title": PropTypes.string,
    "subtitle": PropTypes.string,
    "paragraphs": PropTypes.arrayOf(PropTypes.string)
};

MessageOverlay.defaultProps = {
    "buttonText": "OK",
    "onButtonClick": () => console.error("No button click handler."),
    "title": "Default message:",
    "subtitle": "This is a message."
    // "paragraphs": [...LoremIpsum.get(3), "Thank you for reading!"]
};

export default MessageOverlay;