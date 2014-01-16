# check-types.js

[![Build status][ci-image]][ci-status]

A tiny JavaScript library
for checking types
and throwing exceptions.

## Why would I want such a thing?

Writing explicit conditions
in your functions
for checking arguments
and throwing exceptions
is a task that
swiftly becomes tiresome
and adds complexity
to your codebase.

The purpose of check-types.js
is to remove this burden
from JavaScript application developers
in an efficient and robust manner.

## How tiny is it?

14.3 kb unminified with comments, 2.2 kb minified, 0.8 kb minified + gzipped.

## How do I install it?

Any of the following will do:

```
npm install check-types

jam install check-types

bower install check-types

component install philbooth/check-types.js

git clone git@github.com:philbooth/check-types.js.git
```

## How do I use it?

If you are running in
[Node.js][node],
[Browserify]
or another CommonJS-style
environment,
you can `require`
check-types.js like so:

```javascript
var check = require('check-types');
```

It also the supports
the AMD-style format
preferred by [Require.js][require]:

```javascript
require.config({
    paths: {
        check: 'check-types.js/src/check-types'
    }
});

require([ 'check' ], function (check) {
});
```

If you are
including check-types.js
with an HTML `<script>` tag,
or neither of the above environments
are detected,
check-types.js will just export its interface globally
as `check`.

Once you have loaded the library
in your application,
a whole bunch of functions are available
to call:

* `check.quacksLike(thing, duck)`:
  Tests whether an object 'quacks like a duck'.
  Returns `true`
  if the first argument has all of the properties
  of the second, archetypal argument (the 'duck').
  Returns `false` otherwise.
  If either argument is not an object,
  an exception is thrown.

* `check.verifyQuack(thing, duck, message)`:
  Throws an exception
  if an object does not 'quack like a duck'.

* `check.isInstance(thing, prototype)`:
  Returns `true` if an object is an instance of a prototype,
  `false` otherwise.

* `check.verifyInstance(thing, prototype, message)`:
  Throws an exception if an object is not an instance of a prototype.

* `check.isEmptyObject(thing)`:
  Returns `true` if something is an empty, non-null, non-array object,
  `false` otherwise.

* `check.verifyEmptyObject(thing, message)`:
  Throws an exception unless something is an empty, non-null, non-array object.

* `check.isObject(thing)`:
  Returns `true` if something is a non-null, non-array, non-date object,
  `false` otherwise.

* `check.verifyObject(thing, message)`:
  Throws an exception unless something is a non-null, non-array, non-date object.

* `check.isLength(thing, length)`:
  Returns `true` if something has a length property
  that matches the specified length,
  `false` otherwise.

* `check.verifyLength(thing, length, message)`:
  Throws an exception unless something has a length property
  matching the specified length.

* `check.isArray(thing)`:
  Returns `true` something is an array,
  `false` otherwise.

* `check.verifyArray(thing, message)`:
  Throws an exception unless something is an array.

* `check.isDate(thing)`:
  Returns `true` something is a date,
  `false` otherwise.

* `check.verifyDate(thing, message)`:
  Throws an exception unless something is a date.

* `check.isFunction(thing)`:
  Returns `true` if something is function,
  `false` otherwise.

* `check.verifyFunction(thing, message)`:
  Throws an exception unless something is function.

* `check.isUnemptyString(thing)`:
  Returns `true` if something is a non-empty string,
  `false` otherwise.

* `check.verifyUnemptyString(thing, message)`:
  Throws an exception unless something is a non-empty string.

* `check.isString(thing)`:
  Returns `true` if something is a string,
  `false` otherwise.

* `check.verifyString(thing, message)`:
  Throws an exception unless something is a string.

* `check.isPositiveNumber(thing)`:
  Returns `true` if something is a number
  greater than zero,
  `false` otherwise.

* `check.verifyPositiveNumber(thing, message)`:
  Throws an exception unless something is a number
  greater than zero.

* `check.isNegativeNumber(thing)`:
  Returns `true` if something is a number
  less than zero,
  `false` otherwise.

* `check.verifyNegativeNumber(thing, message)`:
  Throws an exception unless something is a number
  less than zero.

* `check.isEvenNumber(thing)`:
  Returns `true` if something is an even number,
  `false` otherwise.

* `check.verifyEvenNumber(thing, message)`:
  Throws an exception unless something is an even number.

* `check.isOddNumber(thing)`:
  Returns `true` if something is an even number,
  `false` otherwise.

* `check.verifyOddNumberthing, message)`:
  Throws an exception unless something is an even number.

* `check.isNumber(thing)`:
  Returns `true` if something is a number,
  `false` otherwise.
  In this case, `NaN` is not considered a number.

* `check.verifyNumber(thing, message)`:
  Throws an exception unless something is a number.
  In this case, `NaN` is not considered a number.

## How do I set up the build environment?

The build environment relies on
Node.js,
[NPM],
[Jake],
[JSHint],
[Mocha],
[Chai] and
[UglifyJS].
Assuming that you already have Node.js and NPM set up,
you just need to run `npm install` to
install all of the dependencies as listed in `package.json`.

The unit tests are in `test/check-types.js`.
You can run them with the command `npm test` or `jake test`.
To run the tests in a web browser,
open `test/check-types.html`.

[ci-image]: https://secure.travis-ci.org/philbooth/check-types.js.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/check-types.js
[node]: http://nodejs.org/
[browserify]: http://browserify.org/
[require]: http://requirejs.org/
[npm]: https://npmjs.org/
[jake]: https://github.com/mde/jake
[jshint]: https://github.com/jshint/node-jshint
[mocha]: http://visionmedia.github.com/mocha
[chai]: http://chaijs.com/
[uglifyjs]: https://github.com/mishoo/UglifyJS

