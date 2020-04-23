import React, {Component} from "react";
import PropTypes from "prop-types";
import GameSession from "../../components/hud/GameSession";
import "../../css/HUDLeaderboardsMenu.css";
import SpotifyService from "../../utils/SpotifyService";
import APIService from "../../utils/APIService";
import HUDButton, {HUDButtonTypesEnum} from "../../components/hud/HUDButton";

class HUDLeaderboardsMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            "sessions": []
        };

        // bind state-affecting functions
        this.makeComplexSession = this.makeComplexSession.bind(this);
    }

    componentDidMount() {

        APIService.fetchLeaderboard()
            .then(({sessions}) => sessions.forEach((session, index) => {
                this.makeComplexSession(session, index);
            }));

    }

    /**
     * Fetches additional song and user information and adds session to the state.
     */
    makeComplexSession(session, index) {

        const {
            spotifyService
        } = this.props;

        const {
            sessionID,
            userID,
            score,
            songID,
            gameVersion
        } = session;

        // fetch display name + picture of user
        const userInfoPromise = spotifyService.getUserInfo(userID);

        // fetch song name and album cover
        const songInfoPromise = spotifyService.getSongInfo(songID);

        // promise.all it and resolve it into a song object, session object, and rank.
        Promise.all([userInfoPromise, songInfoPromise])
            .then(([userObject, songObject]) => {
                const output = {
                    "rank": index + 1,
                    "sessionObject": {
                        sessionID,
                        "displayName": userObject.displayName,
                        "profilePicture": userObject.imageUrl,
                        score,
                        gameVersion
                    },
                    songObject
                };

                this.setState(oldState => ({
                    "sessions": [
                        ...oldState.sessions,
                        output
                    ]
                }));
            });

    }

    /**
     * Fetches input history and calls prop function for handling outside this scope.
     */
    handleReplayRequest(songObject, sessionID) {

        APIService.fetchInputs(sessionID)
            .then(({inputs}) => {

                this.props.onReplayRequest(songObject, inputs);

            });

    }

    render() {
        return <div>
            <div className="leaderboards-wrapper">
                <table>
                    <tbody>
                    <GameSession header={true} />
                    {
                        this.state.sessions
                            .filter(session => session.rank)
                            .map(session => <GameSession
                                                key={session.rank}
                                                rank={session.rank}
                                                sessionObject={session.sessionObject}
                                                songObject={session.songObject}
                                                onReplayRequest={() => this.handleReplayRequest(session.songObject, session.sessionObject.sessionID)}
                                            />)
                    }
                    </tbody>
                </table>
            </div>
            <HUDButton type={HUDButtonTypesEnum.RETURN} text={"<"} onClick={this.props.onReturn} />
        </div>;
    }

}

HUDLeaderboardsMenu.propTypes = {
    "spotifyService": PropTypes.instanceOf(SpotifyService).isRequired,
    "onReturn": PropTypes.func.isRequired,
    "onReplayRequest": PropTypes.func.isRequired
};

export default HUDLeaderboardsMenu;
