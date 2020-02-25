import React, {Component} from "react";
import PropTypes from "prop-types";
import SlideTransition from "./transition/SlideTransition";
import {Subject} from "rxjs";
import {Transition} from "../utils/TransitionUtils";
import "../css/Form.css";
import HUDButton, {HUDButtonTypesEnum} from "./hud/HUDButton";

/* eslint no-inline-comments: 0 */
/* eslint line-comment-position: 0 */
/* eslint max-params: 0 */

const rangeLowToHigh = ["Very Poorly", "Poorly", "Somewhat Poorly", "Somewhat Well", "Well", "Very Well"];
const rangeSlowFast = ["Too Slow", "Just Right", "Too Fast"];

export const questionLabels = {
    "q1": "What elements did you particularly enjoy?",
    "q2": "What elements did you dislike/have problems with?",
    "q3": "Did you feel that this experience helped enhance the music you were listening to?",
    "q4": "To what degree did you feel the elements in the level were in sync with the music you were listening to?",
    "q5": "To what extent did the moving background help create the feeling of going down a mountain?",
    "q6": "How much did the moving background help give you a sense of speed as you went down the mountain? ",
    "q7": "Did you feel like you were moving at an appropriate speed for the type of song you chose?",
    "q8": "To what extent did the background elements positively complement your visual experience?",
    "q9": "Did being able to choose your own song help enhance your experience over having to select a song from a given playlist?",
    "q10": "Select all that describe your experience choosing a song",
    "q11": "Would you like to see song recommendations based on what you listened to previously?",
    "q12": "If there was one thing you could improve about this game what would it be?",
    "q13": "Do you have a Spotify Premium account?",
    "q14": "Do you have any other comments about our game?"
};

/**
 * Component that contains the end-of-game feedback
 * form.
 */
class FormOverlay extends Component {

    // todo: constrain string length for questions
    constructor(props) {
        super(props);

        // question values
        this.state = {
            "btnText": "Submit!",
            "q1": {
                "speed": false,
                "tricks": false,
                "movingBackground": false,
                "jump": false,
                "art": false,
                "character": false,
                "animations": false,
                "mountain": false
            }, // Q1: multiple ans
            "q2": {
                "speed": false,
                "tricks": false,
                "movingBackground": false,
                "jump": false,
                "art": false,
                "character": false,
                "animations": false,
                "mountain": false
            }, // Q2: mult ans
            "q3": false, // Q3: y / n
            "q4": 1, // Q4: range 1-6
            "q5": 1, // Q5: Range from 1-6
            "q6": 1, // Q6: Range from 1-6
            "q7": 2, // Q7: Range from 1-3
            "q8": 1, // Q8: Range from 1-6
            "q9": false, // Q9: Textbox
            "q10": {
                "easy": false,
                "overwhelming": false,
                "couldntChoose": false,
                "cateredToMe": false,
                "noChoiceAvailabe": false,
                "other": false,
                "otherValue": ""
            }, // mult choice with other
            "q11": false, // Q11: Yes/No
            "q12": "", // Q12: txt
            "q13": false, // Q13: Yes/No
            "q14": "" // Q14: txt
        };

        this.handleChange = this.handleChange.bind(this);

    }

    handleChange (question, value) {
        const newState = {};
        newState[question] = value;

        this.setState(newState);
    }

    renderQuestionContainer (text, inputComponent, key, currentValueDisplay = null) {

        return (
            <div className="question-container" key={key}>
                <p>{text}</p>
                <div className="input-wrapper">
                    {inputComponent}
                    {currentValueDisplay ? <p><strong>{currentValueDisplay}</strong></p> : null}
                </div>
            </div>
        );
    }

    renderMultipleChoiceContainer (text, key, choiceLabels, questionID, other = false) {

        const stateObjRef = this.state[questionID];
        const stateObjKeys = Object.keys(stateObjRef);

        if (other) {
            if (choiceLabels.length !== stateObjKeys.length - 1) {
                console.error("Labels not compatible with keys.", {
                    "labels": choiceLabels.length,
                    "keys": stateObjKeys.length
                });

                return null;
            }
        } else if (choiceLabels.length !== stateObjKeys.length) {
                console.error("Labels not compatible with keys.", {
                    "labels": choiceLabels.length,
                    "keys": stateObjKeys.length
                });

                return null;
            }

        const handleCheckboxChange = evt => {

            const box = evt.target.value;
            const oldState = stateObjRef;
            oldState[box] = evt.target.checked;

            const newState = {};
            newState[questionID] = oldState;

            this.setState(newState);

        };

        const handleOtherChange = evt => {

            const oldState = stateObjRef;
            oldState.otherValue = evt.target.value;

            const newState = {};
            newState[questionID] = oldState;

            this.setState(newState);

        };

        return (
            <div className="question-container" key={key}>
                <p>{text}</p>
                <div className="checkbox-array-container">
                    {choiceLabels.map((label, index) => <div className="checkbox-div" key={questionID + index}>
                        <label>
                            <input
                                type="checkbox"
                                checked={stateObjRef[stateObjKeys[index]]}
                                value={stateObjKeys[index]}
                                onChange={handleCheckboxChange} /> {label}
                        </label>
                    </div>)}
                    {other ? <input
                        type="text"
                        disabled={!stateObjRef.other}
                        value={stateObjRef.otherValue}
                        onChange={handleOtherChange}
                        name={questionID}
                        id={questionID} /> : null }
                </div>
            </div>
        );

    }

    render() {

        const transitionObservable = new Subject();
        const onMount = () => Transition.in(transitionObservable);
        const questions = [];

        const q1andq2Labels = [
            "The speed",
            "The tricks",
            "The moving backgrounds",
            "The jumping",
            "The Artwork",
            "The player character",
            "Animations",
            "Procedurally generated mountain"
        ];

        const generateQuestions = () => {
            // 1
            questions.push(this.renderMultipleChoiceContainer(
                questionLabels.q1,
                questions.length,
                q1andq2Labels, "q1"
            ));

            // 2
            questions.push(this.renderMultipleChoiceContainer(
                questionLabels.q2,
                questions.length,
                q1andq2Labels,
                "q2"
            ));

            // 3
            questions.push(this.renderQuestionContainer(
                questionLabels.q3,
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q3", evt.target.checked)}
                           checked={this.state.q3} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q3 ? "Yes" : "No"
            ));

            // 4
            questions.push(this.renderQuestionContainer(
                questionLabels.q4,
                <input
                    type="range"
                    step="1"
                    value={this.state.q4}
                    onChange={evt => this.handleChange("q4", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q4"
                    id="q4" />,
                questions.length,
                rangeLowToHigh[this.state.q4 - 1]
            ));

            // 5
            questions.push(this.renderQuestionContainer(
                questionLabels.q5,
                <input
                    type="range"
                    step="1"
                    value={this.state.q5}
                    onChange={evt => this.handleChange("q5", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q5"
                    id="q5" />,
                questions.length,
                rangeLowToHigh[this.state.q5 - 1]
            ));

            // 6
            questions.push(this.renderQuestionContainer(
                questionLabels.q6,
                <input
                    type="range"
                    step="1"
                    value={this.state.q6}
                    onChange={evt => this.handleChange("q6", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q6"
                    id="q6" />,
                questions.length,
                rangeLowToHigh[this.state.q6 - 1]
            ));

            // 7
            questions.push(this.renderQuestionContainer(
                questionLabels.q7,
                <input
                    style={{
                        "width": "20vw"
                    }}
                    type="range"
                    step="1"
                    value={this.state.q7}
                    onChange={evt => this.handleChange("q7", parseInt(evt.target.value, 10))}
                    min="1"
                    max="3"
                    name="q7"
                    id="q7" />,
                questions.length,
                rangeSlowFast[this.state.q7 - 1]
            ));

            // 8
            questions.push(this.renderQuestionContainer(
                questionLabels.q8,
                <input
                    type="range"
                    step="1"
                    value={this.state.q8}
                    onChange={evt => this.handleChange("q8", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q8"
                    id="q8" />,
                questions.length,
                rangeLowToHigh[this.state.q8 - 1]
            ));

            // 9
            questions.push(this.renderQuestionContainer(
                questionLabels.q9,
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q9", evt.target.checked)}
                           checked={this.state.q9} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q9 ? "Yes" : "No"
            ));

            // 10
            questions.push(this.renderMultipleChoiceContainer(
                questionLabels.q10,
                questions.length,
                [
                    "Easy to use",
                    "Overwhelming",
                    "Couldn’t think of a song",
                    "Catered to me",
                    "My choice wasn't there",
                    "Other"
                ],
                "q10",
                true
            ));

            // 11
            questions.push(this.renderQuestionContainer(
                questionLabels.q11,
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q11", evt.target.checked)}
                           checked={this.state.q11} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q11 ? "Yes" : "No"
            ));

            // 12
            questions.push(this.renderQuestionContainer(
                questionLabels.q12,
                <input
                    type="text"
                    value={this.state.q12}
                    onChange={evt => this.handleChange("q12", evt.target.value)}
                    name="q12"
                    id="q12" />,
                questions.length,
                this.state.q12 ? "√" : "Field required"
            ));

            // 13
            questions.push(this.renderQuestionContainer(
                questionLabels.q13,
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q13", evt.target.checked)}
                           checked={this.state.q13} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q13 ? "Yes" : "No"
            ));

            // 14
            questions.push(this.renderQuestionContainer(
                questionLabels.q14,
                <input
                    type="text"
                    value={this.state.q14}
                    onChange={evt => this.handleChange("q14", evt.target.value)}
                    name="q14"
                    id="q14" />,
                questions.length,
                ""
            ));
        };

        generateQuestions();

        return (
            <SlideTransition
                zIndex={this.props.zIndex}
                transitionRequestObservable={transitionObservable}
                onMount={onMount} >
                <div className={"form-container"}>
                    <form onSubmit={evt => {
                        evt.preventDefault();

                        this.props.onSubmit(this.state);
                    }}>
                        {questions}
                        <HUDButton
                            onClick={() => this.setState({"btnText": "Submitting..."})}
                            type={HUDButtonTypesEnum.SMALL}
                            text={this.state.btnText} />
                    </form>
                </div>
            </SlideTransition>
        );
    }

}

FormOverlay.propTypes = {
    "onSubmit": PropTypes.func.isRequired,
    "zIndex": PropTypes.number
};

FormOverlay.defaultProps = {
    "zIndex": 5
};

export default FormOverlay;