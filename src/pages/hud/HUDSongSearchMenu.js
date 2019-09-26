import React, {Component} from "react";
import PropTypes from "prop-types";
import dotProp from "dot-prop";
import HUDSearchBar from "../../components/hud/HUDSearchBar";
import SpotifySongListItem from "../../components/hud/SpotifySongListItem";
import "../../css/hud/HUDSongSearch.css";

const MSG_IDENTIFIER = "message";

/**
 * Component responsible for rendering a search bar, and requesting
 * the Spotify service to search for songs.
 */
class HUDSongSearchMenu extends Component {

    constructor(props) {
        super(props);

        if (!props.spotifyService) throw new Error("HUDSearchMenu requires a reference to an instance of SpotifyService!");

        // save a reference to spotify service & state notifier
        this.spotifyService = props.spotifyService;

        // contains list of songs to be rendered
        this.state = {
            "songList": [],
            "hasSearched": false
        };

        // bind functions
        this.filterReceivedJSON = this.filterReceivedJSON.bind(this);
    }

    /**
     * To be used as a callback (or subscription handler) for when a user searches
     * for a set of keywords. This function filters the received object and strips it of
     * unnecessary parameters.
     *
     * @param {Object} json the Spotify server response.
     * @returns {void} new array of songs is updated to the state
     */
    filterReceivedJSON(json) {

        // destructure tracks into array of items
        const items = dotProp.get(json, "tracks.items");
        if (!items) throw new Error("No items found in search response!");

        // for each item, collect URI, song name, artist name, album image
        // eslint-disable-next-line max-params
        const createTrackObject = (id, name, artist, img) => ({
            name,
            artist,
            img,
            id
        });

        const newTrackArray = items.map(item => {

            const id = item.id;
            const songName = item.name;
            const artistNames = dotProp.get(item, "artists").map(artist => artist.name);
            const imgURL = dotProp.get(item, "album.images")[0].url;

            return createTrackObject(id, songName, artistNames, imgURL);

        });

        // update state with new array
        this.setState({
            "songList": newTrackArray
        });

    }

    /**
     * Parses array of songs in state and converts them into JSX elements.
     */
    renderSongList() {

        const {songList, hasSearched} = this.state;

        if (songList.length === 0 && hasSearched) {

            return <h3 className={MSG_IDENTIFIER}>No songs found. Try something else.</h3>;

        }

        return songList.map(song => <SpotifySongListItem
                name={song.name}
                artist={song.artist}
                imgURL={song.img}
                id={song.id}
                key={song.id}
            />);

    }

    // renders a HUDSearchBar and a list of songs
    render() {

        return(
            <div className="hud-song-search-outer-container">
                <div className="hud-song-search-inner-container">
                    <HUDSearchBar
                        searchSongsWithQuery={input => this.spotifyService.search(this.filterReceivedJSON, input)}
                    />
                    {this.renderSongList()}
                </div>
            </div>
        );
    }

}

// default props
HUDSongSearchMenu.defaultProps = {
    "spotifyService": null,
    "selectSong": song => {
        console.error("Couldn't select song. No handler passed", song);
    }
};

// prop type constraints
HUDSongSearchMenu.propTypes = {
    "spotifyService": PropTypes.object,
    "selectSong": PropTypes.func
};

export default HUDSongSearchMenu;