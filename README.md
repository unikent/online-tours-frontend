# Online Tours - Frontend App

See it in use at https://tours.kent.ac.uk/

This codebase is provided primarily as a reference and is still currently heavily tied to the kent look & feel.

The code itself is licensed under the MIT License.

## Dependencies

 * Online tours - Backend App (or something providing an API in this format)


## Setup

### Installation

1. `npm install` to pull in NPM dependencies
2. `bower install` to pull in front-end dependencies
3. Create an `local.config.json` in the root of the app to provide any custom config options. ie. `basePath` or `endpoint`
4. `grunt` to create the index-dev.html & start watch task.

### Building
In development, the application does not need to be built. RequireJS is used to manage dependencies, and will asynchronously load dependencies as/when required.

For production usage, the application should be built with `grunt production`. The optimized JS produced by RequireJS will be placed in `js/dist`.


## Codebase

### Structure

Application components should live within `js/src/`. Dependencies are managed with RequireJS, and are mapped by the `js/src/paths.js` file. `main.js` acts as the main entrypoint for the application. All application components are namespaced under `app/`.

Similarly, unit tests live within `js/test`. Tests can be run by loading test.html in a browser. Dependencies are mapped by the `js/test/paths.js` file, which needs to map both application and test depdencencies. A certain amount of jiggery-pokery is required to make Mocha play nicely with RequireJS - see the comments in the source.

The hard-coded application config lives in `js/src/config.js` but can be overridden by supplying your own custom appConfig in index*.html.

### Testing

We are aiming to test as much as physically possible for this application. Checking for tests will be a part of the QA / PR code-review process. 

There is absolutely no need to test core framework functions. However **any** method containing custom code should be tested. Any method which is untested should be commented as `// !!! UNTESTED - [Reason why there are no tests]` as this will assist with code-review and flag any areas in danger of becoming technical debt.

Tests can be run by navigating to `test.html` in a browser.
To run tests in the cli, you'll need to `npm install -g mocha-phantomjs` and then run `mocha-phantomjs test.html`. 
