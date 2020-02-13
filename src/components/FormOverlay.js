import React, {Component} from "react";
import SlideTransition from "./transition/SlideTransition";
import {Subject} from "rxjs";
import {Transition} from "../utils/TransitionUtils";
import "../css/Form.css";
import HUDButton, {HUDButtonTypesEnum} from "./hud/HUDButton";

/* eslint no-inline-comments: 0 */
/* eslint line-comment-position: 0 */
/* eslint max-params: 0 */

const rangeLowToHigh = ["Very Low", "Low", "Somewhat Low", "Somewhat High", "High", "Very High"];


/**
 * Component that contains the end-of-game feedback
 * form.
 */
class FormOverlay extends Component {

    constructor(props) {
        super(props);

        // question values
        this.state = {
            "q1": 1, // Q1: Range from 1-6
            "q2": "", // Q2: Textbox
            "q3": "", // Q3: Textbox
            "q4": "", // Q4: Textbox
            "q5": 1, // Q5: Range from 1-6
            "q6": 1, // Q6: Range from 1-6
            "q7": 1, // Q7: Range from 1-6
            "q8": "", // Q8: Textbox
            "q9": 1, // Q9: Textbox
            "q10": 1, // Q10: Range from 1-6
            "q11": false, // Q11: Yes/No
            "q12": false, // Q12: Long/Short
            "q13": false, // Q13: Yes/No
            "q14": false, // Q14: Yes/No
            "q15": false // Q15: Yes/No
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
                {inputComponent}
                {currentValueDisplay || <p>{currentValueDisplay}</p>}
            </div>
        );
    }

    render() {

        const transitionObservable = new Subject();
        const onMount = () => Transition.in(transitionObservable);
        const questions = [];

        const appendQuestions = () => {
            // 1 range
            questions.push(this.renderQuestionContainer(
                "How would you rate your overall enjoyment of the game?",
                <input
                    type="range"
                    step="1"
                    value={this.state.q1}
                    onChange={evt => this.handleChange("q1", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q1"
                    id="q1" />,
                questions.length,
                rangeLowToHigh[this.state.q1 - 1]
            ));

            // 2 text
            questions.push(this.renderQuestionContainer(
                "What elements did you particularly enjoy?",
                <input
                    type="text"
                    value={this.state.q2}
                    onChange={evt => this.handleChange("q2", evt.target.value)}
                    name="q2"
                    id="q2" />,
                questions.length,
                this.state.q2 ? "" : "Field required"
            ));

            // 3 text
            questions.push(this.renderQuestionContainer(
                "What elements did you dislike/have problems with?",
                <input
                    type="text"
                    value={this.state.q3}
                    onChange={evt => this.handleChange("q3", evt.target.value)}
                    name="q3"
                    id="q3" />,
                questions.length,
                this.state.q3 ? "" : "Field required"
            ));

            // 4 text
            questions.push(this.renderQuestionContainer(
                "How did playing this game enhance your listening experience?",
                <input
                    type="text"
                    value={this.state.q4}
                    onChange={evt => this.handleChange("q4", evt.target.value)}
                    name="q4"
                    id="q4" />,
                questions.length,
                this.state.q4 ? "" : "Field required"
            ));

            // 5 range
            questions.push(this.renderQuestionContainer(
                "How would you rate the synchronicity between the mountain props and jumps and the music you were listening to?",
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
                rangeLowToHigh[this.state.q5]
            ));

            // 6 range
            questions.push(this.renderQuestionContainer(
                "How much did the moving background help create the feeling of going down a mountain?",
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
                this.state.q6
            ));

            // 7 range
            questions.push(this.renderQuestionContainer(
                "To what degree did the moving background help give you a sense of speed as you went down the mountain?",
                <input
                    type="range"
                    step="1"
                    value={this.state.q7}
                    onChange={evt => this.handleChange("q7", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q7"
                    id="q7" />,
                questions.length,
                this.state.q7
            ));

            // 8 text
            questions.push(this.renderQuestionContainer(
                "How appropriate was the downhill speed for the type of song you chose?",
                <input
                    type="text"
                    value={this.state.q8}
                    onChange={evt => this.handleChange("q8", evt.target.value)}
                    name="q8"
                    id="q8" />,
                questions.length,
                this.state.q8 ? "" : "Field required"
            ));

            // 9 range
            questions.push(this.renderQuestionContainer(
                "To what extent did the background elements positively complement your experience?",
                <input
                    type="range"
                    step="1"
                    value={this.state.q9}
                    onChange={evt => this.handleChange("q9", parseInt(evt.target.value, 10))}
                    min="1"
                    max="6"
                    name="q9"
                    id="q9" />,
                questions.length,
                `(1 - not at all, 6 - very much) Your answer: ${this.state.q9}`
            ));

            // 11 (checkbox)
            questions.push(this.renderQuestionContainer(
                "Were you able to find the song you were looking for easily?",
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q11", evt.target.checked)}
                           checked={this.state.q11} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q11 ? "Yes" : "No"
            ));

            // 12 (checkbox)
            questions.push(this.renderQuestionContainer(
                "Did it take a short or long time to start playing the game after you picked a song?",
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q12", evt.target.checked)}
                           checked={this.state.q12} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q12 ? "Long" : "Short"
            ));

            // 13 (checkbox)
            questions.push(this.renderQuestionContainer(
                "Would you like to see song recommendations based on what you listened to previously?",
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q13", evt.target.checked)}
                           checked={this.state.q13} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q13 ? "Yes" : "No"
            ));

            // 14 (checkbox)
            questions.push(this.renderQuestionContainer(
                "Are you a musician?",
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q14", evt.target.checked)}
                           checked={this.state.q14} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q14 ? "Yes" : "No"
            ));

            // 15 (checkbox)
            questions.push(this.renderQuestionContainer(
                "Did you play using spotify premium?",
                <label className="switch">
                    <input type="checkbox"
                           onChange={evt => this.handleChange("q15", evt.target.checked)}
                           checked={this.state.q15} />
                    <span className="slider"/>
                </label>,
                questions.length,
                this.state.q15 ? "Yes" : "No"
            ));
        };

        appendQuestions();

        return (
            <SlideTransition
                transitionRequestObservable={transitionObservable}
                onMount={onMount} >
                <div className={"form-container"}>
                    <form>
                        {questions}
                        <HUDButton
                            type={HUDButtonTypesEnum.SMALL}
                            text={"Submit!"} />
                    </form>
                </div>
            </SlideTransition>
        );
    }

}

export default FormOverlay;