## 3<sup>rd</sup> party libraries

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