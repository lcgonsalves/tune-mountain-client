/**
 * Service utility for client server communication;
 * Abstracts HTTP operations for more ease of repeated use.
 */
import dotProp from "dot-prop";

class APIService {

    /**
     * Determines if user exists in database; If exists,
     * resolves promise to true. If not, resolves promise to false.
     *
     * If some error occurs, promise is rejected.
     *
     * @param {String} spotifyID the spotify ID of the user
     * @param {String} displayName the display name of the user // todo: Field is updated if user exists in database.
     * @param {String} imageUrl the profile picture of user // todo: Field is updated if user exists in database
     * @returns {Promise<Boolean>} resolves to true if user exists, false if user is new. Rejects if there's an error.
     */
    static checkInUser(spotifyID, displayName, imageUrl) {

        const addNewUser = () => {

            const init = {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    spotifyID,
                    displayName,
                    imageUrl
                })
            };

            return fetch("/api/users", init);

        };

        const promiseHandler = (resolve, reject) => {

            // get user if exists
            fetch(`/api/user/${spotifyID}`)
                .then(res => res.json())
                .then(resJSON => {

                    if (resJSON.status === "success") {

                        // TODO: implement endpoint for updating fields
                        resolve(true);

                    } else if (resJSON.status === "failure" && resJSON.errorCode === 1) {

                        return addNewUser();

                    } else reject();

                })
                .then(res => res.json())
                .then(resJSON => {
                    if (resJSON.status === "success") {
                        resolve(false);
                    } else reject();
                })
                .catch(() => reject());


        };

        return new Promise(promiseHandler);

    }

    /**
     * Stores a game session and game session inputs in the database.
     *
     * @param {Object} sessionObject object containing session information (score, songID, userID, gameVersion)
     * @param {Array<Object>} inputArray contains input objects (sessionID, action, timestamp, type)
     * @returns {Promise<null>} resolves if successful and rejects if there's an error
     */
    static saveGameSession(sessionObject, inputArray) {

        const handler = (resolve, reject) => {

            this.saveGameSessionOnly(sessionObject)
                .then(id => this.saveInputArrayOnly(inputArray, id))
                .then(res => resolve(res))
                .catch(err => reject(err));

        };

        return new Promise(handler);

    }

    /**
     * Stores only a game session object in the database.
     *
     * @param {Object} sessionObject contains (score, songID, userID, gameVersion)
     * @returns {Promise<Number>} resolves to an integer representing the sessionID if successfully inserted, rejects if
     * there's an error
     */
    static saveGameSessionOnly(sessionObject) {

        const url = "/api/sessions";
        const init = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(sessionObject)
        };

        const handler = (resolve, reject) => {

            fetch(url, init)
                .then(response => response.json())
                .then(responseJSON => {
                    const sessions = dotProp.get(responseJSON, "sessions");

                    return responseJSON.status === "success"
                        ? resolve(sessions[sessions.length - 1].sessionID)
                        : reject(responseJSON);
                })
                .catch(err => reject(err));

        };

        return new Promise(handler);

    }

    /**
     * Stores only an array of inputs in the database.
     *
     * Note: inputs can only be stored after session is stored.
     *
     * @param {Array} inputArray array containing objects (sessionID, action, timestamp, type)
     * @param {Number} sessionID an integer representing the id of the session
     * @returns {Promise<Object>} resolves if successfully inserted, rejects if there's an error
     */
    static saveInputArrayOnly(inputArray, sessionID) {

        const modifiedArray = inputArray.map(input => ({
            ...input,
            sessionID
        }));

        const url = "/api/inputs";
        const init = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "inputs": modifiedArray
            })
        };

        const handler = (resolve, reject) => {

            if (typeof sessionID !== "number") reject({
                    "status": "failure",
                    "reason": "something is wrong",
                    "thing": {
                        inputArray,
                        sessionID
                    }
                });

            fetch(url, init)
                .then(response => response.json())
                .then(responseJSON => responseJSON.status === "success"
                    ? resolve()
                    : reject(responseJSON))
                .catch(err => reject(err));

        };

        return new Promise(handler);

    }

    /**
     * Fetches top 10 sessions in database.
     *
     * @param {String} userID optional spotify ID to filter top 10 plays of given user
     * @returns {Promise<Object>} promise that resolves in a response object containing all sessions or rejects in
     * case of an error.
     */
    static fetchLeaderboard(userID = null) {

        const url = `/api/leaderboard${userID ? `/${userID}` : ""}`;

        const handler = (resolve, reject) => {

            fetch(url)
                .then(response => response.json())
                .then(responseJSON => responseJSON.status === "success"
                    ? resolve(responseJSON)
                    : reject(responseJSON))
                .catch(err => reject(err));

        };

        return new Promise(handler);

    }


    /**
     * Fetches all inputs to a given session
     *
     * @param {Number} sessionID id of session to which inputs will be fetched.
     * @returns {Promise<Object>} promise that resolves to object containing session info and inputs;
     */
    static fetchInputs(sessionID) {

        const url = `/api/session/${sessionID}`;

        const handler = (resolve, reject) => {

            fetch(url)
                .then(response => response.json())
                .then(responseJSON => responseJSON.status === "success"
                    ? resolve(responseJSON)
                    : reject(responseJSON))
                .catch(err => reject(err));

        };

        return new Promise(handler);

    }

    /**
     * POSTs answers to feedback form properly encoded for the SQLite database.
     * @param {Object} responseObject state object in FormOverlay.js
     */
    static submitFeedback(responseObject) {

        const url = "/api/submit-feedback";
        const init = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(responseObject)
        };

        return fetch(url, init)
            .then(response => response.json());

    }

}

export default APIService;