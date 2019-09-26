import React, {Component} from "react";
import PropTypes from "prop-types";
import HUDButton, {HUDButtonTypesEnum} from "./HUDButton";
import {wordsToArray} from "../../utils/StringTools";
import "../../css/hud/HUDSongSearch.css";

class HUDSearchBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            "value": props.defaultTextValue
        };
        this.lastSubmittedValue = null;

        this.autoSearchTimer = null;

        // function bindings
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    /**
     * Updates the text in the text box and resets the auto-search timer.
     * @param {Event} event event of a key being pressed
     * @returns {void}
     */
    handleChange(event) {

        // if timer has been set, clear it and reset it.
        if (this.autoSearchTimer) clearTimeout(this.autoSearchTimer);
        this.autoSearchTimer = setTimeout(this.handleSubmit, 1000);

        this.setState({"value": event.target.value});

    }

    /**
     * Filters text in box into an array of words (also getting rid of illegal symbols)
     * and runs handler function passing it such array.
     * @returns {void}
     */
    handleSubmit() {

        // do not search if nothing is in text box
        if (this.state.value === "") return;

        // only submit if the value has changed
        if (this.state.value !== this.lastSubmittedValue) {

            this.props.searchSongsWithQuery(wordsToArray(this.state.value));
            this.lastSubmittedValue = this.state.value;

        }

    }

    render() {
        return(
            <div className="search-bar-container">
                <input className="text-box" type="text" value={this.state.value} onChange={this.handleChange} />
                <HUDButton type={HUDButtonTypesEnum.ENTER}
                           text="Search"
                           onClick={this.handleSubmit}
                />
            </div>
        );
    }

}

// default props
HUDSearchBar.defaultProps = {
    "searchSongsWithQuery": query => {
        throw new Error(`Unable to search song with query ${query}. No handler passed.`);
    },
    "defaultTextValue": "Type the name of a song..."
};

// prop type constraints
HUDSearchBar.propTypes = {
    "searchSongsWithQuery": PropTypes.func,
    "defaultTextValue": PropTypes.string
};

export default HUDSearchBar;