import React from "react";
import PropTypes from "prop-types";
import "../../css/hud/GameSession.css";

const GameSession = props => {

    const {
        sessionObject,
        songObject,
        rank,
        header,
        onReplayRequest
    } = props;

    // prop check
    if (!header && (!songObject || !sessionObject)) throw new Error(`Missing ${!songObject ? "song object" : "session object"}.`);

    const color = rank % 2 ? "tr-dark" : "tr-light";

    // position, score, userPic, userName, songAlbum, playedSong
    if (header) return <tr className={color}>
        <th className="header-rank">Rank</th>
        <th className="header-score" colSpan={1}>Score</th>
        <th className="header-display-name" colSpan={2}>Player</th>
        <th className="header-song-name" colSpan={3}>Song</th>
    </tr>;

    return <tr className={color}>
        <td className="session-rank">{rank}</td>
        <td className="session-score">{sessionObject.score}</td>
        <td className="session-profile-picture"><img src={sessionObject.profilePicture} alt={`${sessionObject.displayName}'s profile picture`}/></td>
        <td className="session-display-name">{sessionObject.displayName}</td>
        <td className="session-album-cover"><img src={songObject.img} alt={`Album cover for song: ${songObject.name}`}/></td>
        <td className="session-song-name">{songObject.name}</td>
        <td className="session-replay-button"><button onClick={onReplayRequest}>View Replay</button></td>
    </tr>;

};

GameSession.defaultProps = {
    // eslint-disable-next-line multiline-comment-style
    // "sessionObject": {
    //     "sessionID": -1,
    //     "displayName": "Leo Gonsalves",
    //     "profilePicture": "https://profile-images.scdn.co/images/userprofile/default/eb6e342aca9e0f0e82fc48fc5431e33ddc6f79b5",
    //     "score": 54003323124,
    //     "gameVersion": "0.1.0"
    // },
    // "songObject": {
    //     "songID": "2mDYYGaGd9uXKkK2YhDA3i",
    //     "name": "Brooklyn Bridge To Chorus",
    //     "imgUrl": "https://i.scdn.co/image/ab67616d0000b273bfa99afb5ef0d26d5064b23b"
    // },
    // "rank": 0,
    "header": false
};

GameSession.propTypes = {
    "sessionObject": PropTypes.shape({
        "sessionID": PropTypes.number.isRequired,
        "displayName": PropTypes.string.isRequired,
        "profilePicture": PropTypes.string.isRequired,
        "score": PropTypes.number.isRequired,
        "gameVersion": PropTypes.string.isRequired
    }),
    "songObject": PropTypes.shape({
        "id": PropTypes.string.isRequired,
        "name": PropTypes.string.isRequired,
        "img": PropTypes.string.isRequired
    }),
    "rank": PropTypes.number,
    "header": PropTypes.bool,
    "onReplayRequest": PropTypes.func
};

export default GameSession;
