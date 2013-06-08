# next-update

Tests if module's dependencies can be updated to newer / latest versions
without breaking the tests.

    next-update --available
    // shows new versions available without installing anything
    next-update --latest
    // checks if latest versions of 3rd party break any unit tests

## Example

There is an [next-update-example](https://npmjs.org/package/next-update-example)
module I created just for testing *next-update*.

Imagine your nodejs module *foo* has the following dependencies listed in *package.json*

    "dependencies": {
        "lodash": "~1.2.0",
        "async": "~0.2.5"
    }

You would like to update lodash and async to latest versions, but not sure if
this would break anything. With *next-update* it is easy: run command `next-update`
in the folder with module *foo*. Here is the example output:

    next updates:
    lodash
        1.2.1 PASS
    async
        0.2.6 PASS
        0.2.7 PASS
        0.2.8 PASS


Both *package.json* file and *node_modules* folder are left unchanged,
and now you know that you can safely upgrade both libraries to later versions.

This might not appear like a big deal for a single module that is using
popular 3rd party libraries with stable apis only. *next-update* is most useful
in the larger development context, where multiple modules are being developed
side by side, often by different teams. In such situations, checking if an upgrade
is possible could be part of the continuous build pipeline.

## Install

    npm install -g next-update  // installs module globally
    next-update --help          // shows command line options

## Use

Make sure the target module has unit / integration tests,
and the tests can be run using `npm test` command.

Run `next-update` from the command line in the same folder as
the target module. In general this tool does the following:

1. Reads the module's dependencies (including dev) and their versions
2. Queries npm registry to see if there are newer versions
3. For each dependency that has newer versions available:
    1. Installs each version
    2. Runs command `npm test` to determine if the new version breaks the tests
    3. Installs back the current version.
4. Reports results

### Misc

* When comparing versions, keywords *latest* and *** are both assumed to equal to "0.0.0".
* A good workflow using *next-update*
    * see available new versions `next-update --available`
    * check latest version of each module using `next-update --latest`
    * install new versions of the desired modules using standard `npm i dependency@version --save`
* You can use custom test command, for example `next-update -t "grunt test"`
    * `npm test` is used by default.

### 3<sup>rd</sup> party libraries

* [lo-dash](https://github.com/bestiejs/lodash) is used throught the code to deal with collections.
* [check-types](https://github.com/philbooth/check-types.js) is used to verify arguments through out the code.
* [optimist](https://github.com/substack/node-optimist) is used to process command line arguments.
* [request](https://npmjs.org/package/request) is used to fetch NPM registry information.
* [semver](https://npmjs.org/package/semver) is used to compare module version numbers.
* [q](https://npmjs.org/package/q) library is used to handle promises. While developing this tool,
I quickly ran into problems managing the asynchronous nature of fetching information, installing multiple modules,
testing, etc. At first I used [async](https://npmjs.org/package/async), but it was still too complex.
Using promises allowed to cut the program's code and the complexity to very manageable level.
* [cli-color](https://npmjs.org/package/cli-color) prints colored text to the terminal.

## Small print

Author: Gleb Bahmutov &copy; 2013

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with the module, email me directly.