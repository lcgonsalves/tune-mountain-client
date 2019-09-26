// key for accessing local storage data
const LOCAL_STORAGE_KEY = "spotify-refresh-token";

/**
 * Either console logs or broadcasts a state message.
 *
 * @param {String} state current spotify service state
 * @param {*} body the body of the notification. Could be anything depending on the state.
 * @param {String} message optional message to be notified
 * @param {Rx.Subject} notifier the observable to emit the message from
 *
 * @returns {void}
 */
const log = (state, body, message = "", notifier = null) => {

    const notification = {
        "source": "SpotifyService",
        state,
        body,
        message
    };

    // broadcast state
    if (notifier) notifier.next(notification);
    else console.log(notification);

};

/**
 * Fetches tokens from URL query and returns them in an object.
 * @returns {{accessToken: *, refreshToken: *}} object containing both tokens
 */
const getTokensFromQuery = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");

    return {
        accessToken,
        refreshToken
    };
};

/**
 * Returns refresh and access tokens if a valid refresh token is found either in the query or local storage.
 * If no valid refresh token exists, returned tokens will be "null".
 * @param {Function} refreshTokenFunction function that fetches refresh tokens from server.
 * @param {Rx.Subject} stateNotifier an optional Subject that will be used to broadcast state of the utility
 * @returns {{accessToken: *, refreshToken: *}} object containing both tokens
 */
const processTokens = (refreshTokenFunction, stateNotifier = null) => {

    // Handle state of SDK and user token
    const queryTokens = getTokensFromQuery();

    let accessToken = null;
    let refreshToken = null;

    // check if refresh token exists in local storage, or else check query
    if (queryTokens.accessToken && queryTokens.refreshToken) {

        // set state tokens
        accessToken = queryTokens.accessToken;
        refreshToken = queryTokens.refreshToken;

        // update state
        log("ACCESS_TOKEN_ACQUIRED", {
            accessToken,
            refreshToken
        }, "Using tokens from query returned from server!", stateNotifier);

        // save token locally if it was found
        localStorage.setItem(LOCAL_STORAGE_KEY, queryTokens.refreshToken);

    } else {

        // this is the case when query tokens don't exist
        log("LOADING_TOKEN_FROM_LOCAL_STORAGE", null, "Spotify tokens not found in query. Looking in local storage...", stateNotifier);

        const localStorageRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEY);

        // if found, attempt to refresh
        if (localStorageRefreshToken) {

            log(
            "REFRESHING_TOKEN",
                null,
                "Spotify refresh token found in localStorage. Fetching new accessToken from server...",
                stateNotifier
            );

            refreshTokenFunction(localStorageRefreshToken)
                .then(json => {

                    log(
                        "ACCESS_TOKEN_ACQUIRED",
                        {
                            "accessToken": json.accessToken,
                            "refreshToken": localStorageRefreshToken
                        },
                        "Spotify access token fetched.",
                        stateNotifier
                    );

                });

        } else {

            log(
                "NO_ACCESS_TOKEN",
                null,
                "No tokens found or refreshed. User must log in.",
                stateNotifier
            );

        }
    }
};

export {
    getTokensFromQuery,
    processTokens,
    log
};