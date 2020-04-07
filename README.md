# Tune Mountain Client
A react application that handles the GUI and other modules of the `Tune Mountain` MQP project, by [Léo Gonsalves
](https://www.leogons.com/about)
, [Cem
 Alemdar](https://github.com/calemdar), and [Jarod Thompson](https://github.com/jsthompson16).

Find a running version of this project on www.tune-mountain.com.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

In order to properly run this application locally, you must either proxy all backend requests to [tune-mountain.com
](https://www.tune-mountain.com) or to a locally hosted equivalent of the backend server. See the [back-end
 repository here](https://github.com/calemdar/tune-mountain-website). Simply clone and run `npm start`, then proxy
  requests to the url displayed on the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run update-tm-pkg`

Installs / updates other `tune-mountain` dependencies needed for the project to function. If changes have been made
 to the dependencies, one must run this command manually, because none of the dependencies are hosted on npm, only on
  github. 
