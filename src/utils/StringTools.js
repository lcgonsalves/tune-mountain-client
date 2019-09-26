/**
 * Converts a paragraph to an array of words, removing any symbols so that
 * no wacky HTTP GET requests are done to Spotify.
 *
 * @param {String} string the input string.
 * @returns {Array<String>} an array of the words passed to the function.
 */
const wordsToArray = string => {

    // trim whitespace before and after
    const paragraph = string.trim();

    // eslint-disable-next-line require-unicode-regexp
    const regex = /[A-Za-z0-1 ]/g;

    // filter symbols
    const letters = paragraph.match(regex);

    const words = [];
    let curWord = "";

    // join letters and remove whitespace
    letters.forEach((letter, index) => {
        if (letter === " ") {
            if (curWord.length > 0) words.push(curWord);
            curWord = "";
        } else {
            curWord += letter;
            if (index + 1 === letters.length) words.push(curWord);
        }
    });

    return words;

};

export {
    wordsToArray
};