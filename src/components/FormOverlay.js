import React, {Component} from "react";
import PropTypes from "prop-types";
import SlideTransition from "./transition/SlideTransition";
import {Subject} from "rxjs";
import {Transition} from "../utils/TransitionUtils";
import "../css/Form.css";

/* eslint no-inline-comments: 0 */
/* eslint line-comment-position: 0 */

/**
 * Component that contains the end-of-game feedback
 * form.
 */
class FormOverlay extends Component {

    constructor(props) {
        super(props);

        // question values
        this.state = {
            "q1": 0, // Q1: Range from 1-6
            "q2": "", // Q2: Textbox
            "q3": "", // Q3: Textbox
            "q4": "", // Q4: Textbox
            "q5": 0, // Q5: Range from 1-6
            "q6": 0, // Q6: Range from 1-6
            "q7": 0, // Q7: Range from 1-6
            "q8": "", // Q8: Textbox
            "q9": "", // Q9: Textbox
            "q10": 0, // Q10: Range from 1-6
            "q11": false, // Q11: Yes/No
            "q12": false, // Q12: Long/Short
            "q13": false, // Q13: Yes/No
            "q14": false, // Q14: Yes/No
            "q15": false // Q15: Yes/No
        };

    }

    handleChange (question, value) {
        const newState = {};
        newState[question] = value;

        this.setState(newState);
    }

    renderQuestionContainer (text, inputComponent, key, currentValueDisplay = null) {
        return (
            <div className="questionContainer" key={key}>
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

        // 1
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
            questions.length
        ));

        // 2
        questions.push(this.renderQuestionContainer(
            "What elements did you particularly enjoy?",
            <input
                type="text"
                value={this.state.q2}
                onChange={evt => this.handleChange(evt, "q2")}
                name="q2"
                id="q2" />,
            questions.length
        ));

        // 3
        questions.push(this.renderQuestionContainer(
            "What elements did you dislike/have problems with?",
            <input
                type="text"
                value={this.state.q3}
                onChange={evt => this.handleChange(evt, "q3")}
                name="q3"
                id="q3" />,
            questions.length
        ));

        // 4
        questions.push(this.renderQuestionContainer(
            "How did playing this game enhance your listening experience?",
            <input
                type="text"
                value={this.state.q4}
                onChange={evt => this.handleChange(evt, "q4")}
                name="q4"
                id="q4" />,
            questions.length
        ));

        // 5
        questions.push(this.renderQuestionContainer(
            "Did you feel the mountain and the jumps were in sync with the music you were listening to?",
            <input
                type="range"
                step="1"
                value={this.state.q5}
                onChange={evt => this.handleChange("q5", parseInt(evt.target.value, 10))}
                min="1"
                max="6"
                name="q5"
                id="q5" />,
            questions.length
        ));

        // 6
        questions.push(this.renderQuestionContainer(
            "Did the moving background help create the feeling of going down a mountain?",
            <input
                type="range"
                step="1"
                value={this.state.q6}
                onChange={evt => this.handleChange("q6", parseInt(evt.target.value, 10))}
                min="1"
                max="6"
                name="q6"
                id="q6" />,
            questions.length
        ));

        // 7
        questions.push(this.renderQuestionContainer(
            "Did the moving background help give you a sense of speed as you went down the mountain?",
            <input
                type="range"
                step="1"
                value={this.state.q7}
                onChange={evt => this.handleChange("q7", parseInt(evt.target.value, 10))}
                min="1"
                max="6"
                name="q7"
                id="q7" />,
            questions.length
        ));

        // 8
        questions.push(this.renderQuestionContainer(
            "Did you feel like you were moving at an appropriate speed for the type of song you chose?",
            <input
                type="text"
                value={this.state.q8}
                onChange={evt => this.handleChange(evt, "q8")}
                name="q8"
                id="q8" />,
            questions.length
        ));

        // 9
        questions.push(this.renderQuestionContainer(
            "To what extent did the background elements positively complement your experience? (1 - not at all, 6 - very much)",
            <input
                type="range"
                step="1"
                value={this.state.q9}
                onChange={evt => this.handleChange("q9", parseInt(evt.target.value, 10))}
                min="1"
                max="6"
                name="q9"
                id="q9" />,
            questions.length
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
            this.state.q12 ? "Short" : "Long"
        ));

        return (
            <SlideTransition
                transitionRequestObservable={transitionObservable}
                onMount={onMount} >
                <div className={"form-container"}>
                    <form>
                        {questions}
                    </form>
                </div>
            </SlideTransition>
        );
    }

}

export default FormOverlay;