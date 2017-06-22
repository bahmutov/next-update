# check-types.js

[![Build status][ci-image]][ci-status]

A little JavaScript library
for asserting types
and values.

* [Why would I want that?](#why-would-i-want-that)
* [How little is it?](#how-little-is-it)
* [How do I install it?](#how-do-i-install-it)
* [How do I use it?](#how-do-i-use-it)
    * [Loading the library](#loading-the-library)
    * [Calling the exported functions](#calling-the-exported-functions)
        * [String predicates](#string-predicates)
        * [Number predicates](#number-predicates)
        * [Boolean predicates](#boolean-predicates)
        * [Array predicates](#array-predicates)
        * [Object predicates](#object-predicates)
        * [Date predicates](#date-predicates)
        * [Error predicates](#error-predicates)
        * [Function predicates](#function-predicates)
        * [Other predicates](#other-predicates)
        * [Modifiers](#modifiers)
        * [Batch operations](#batch-operations)
        * [Some examples](#some-examples)
* [Where can I use it?](#where-can-i-use-it)
* [What changed from 2.x to 3.x?](#what-changed-from-2x-to-3x)
* [What changed from 1.x to 2.x?](#what-changed-from-1x-to-2x)
* [What changed from 0.x to 1.x?](#what-changed-from-0x-to-1x)
* [How do I set up the build environment?](#how-do-i-set-up-the-build-environment)
* [What license is it released under?](#what-license-is-it-released-under)

## Why would I want that?

Writing explicit conditions
in your functions
to check arguments
and throw exceptions
is a task that
swiftly becomes tiresome
and adds complexity
to your codebase.

The purpose of check-types.js
is to remove this burden
from JavaScript application developers
in an efficient and robust manner,
abstracted by a simple API.

## How little is it?

22 kb unminified with comments, 5.8 kb minified, 2 kb minified + gzipped.

## How do I install it?

If you're using npm:

```
npm install check-types --save
```

Or if you just want the git repo:

```
git clone git@github.com:philbooth/check-types.js.git
```

If you're into
other package managers,
it is also available
from Bower, Component and Jam.

## How do I use it?

### Loading the library

If you are running in
Node.js,
Browserify
or another CommonJS-style
environment,
you can `require`
check-types like so:

```javascript
var check = require('check-types');
```

It also the supports
the AMD-style format
preferred by Require.js.

If you are
including check-types.js
with an HTML `<script>` tag,
or neither of the above environments
are detected,
it will export the interface globally as `check`.

### Calling the exported functions

Once you have loaded the library
in your application,
a whole bunch of functions are available
to call.

Most of the functions
are predicates,
which can be executed
in a number of different contexts:

* `check.xxx(thing)`:
  These functions are basic predicates,
  returning true or false
  depending on the type and value of `thing`.

* `check.not.xxx(thing)`:
  The `not` modifier
  negates predicates,
  returning `true` if the predicate returns `false`
  and `false` if the predicate returns `true`.
  It is also itself a function,
  which simply returns
  the negation of
  its argument.

* `check.maybe.xxx(thing)`:
  The `maybe` modifier
  tweaks predicates to
  return `true` if `thing` is `null` or `undefined`,
  otherwise their normal result
  is returned.
  It is also itself a function,
  which returns `true`
  when its argument is `null` or `undefined`,
  otherwise it returns its argument.

* `check.either.xxx(thing).or.yyy(thang)`:
  The `either` modifier
  returns `true` if either predicate is true,
  it will only return `false`
  when both predicates are false.

* `check.assert.xxx(thing, message)`:
  The `assert` modifier
  changes predicates
  to throw when their result
  would otherwise be `false`.
  It can be applied
  to the `not`, `maybe` and `either` modifiers
  using the forms
  `check.assert.not.xxx(thing, message)`,
  `check.assert.maybe.xxx(thing, message)`
  and
  `check.assert.either.xxx(thing, message).or.yyy(thang)`.
  It is also itself a function,
  which simply throws
  when its argument is false.

* `check.array.of.xxx(thing)`:
  The `array.of` modifier
  first checks that
  it is operating on an array
  and then applies
  the modified predicate
  to each item
  of the array.
  If the predicate fails
  for any item,
  it returns `false`,
  otherwise it returns `true`.
  It can also be prefixed
  by other modifiers,
  so `check.maybe.array.of`,
  `check.not.array.of`,
  `check.assert.array.of`,
  `check.assert.maybe.array.of` and
  `check.assert.not.array.of`
  all work
  as you would expect
  them to.

* `check.arrayLike.of.xxx(thing)`:
  The `arrayLike.of` modifier
  is synonymous with `array.of`,
  except it operates on array-like objects.

* `check.iterable.of.xxx(thing)`:
  The `iterable.of` modifier
  is synonymous with `array.of`,
  except it operates on iterables.

* `check.object.of.xxx(thing)`:
  The `object.of` modifier
  is synonymous with `array.of`,
  except it operates on an object's properties.

Additionally, there are some batch operations
that allow you to apply different predicates
to each value
in an array or object.
These are implemented by
`check.apply`,
`check.map`,
`check.any` and
`check.all`.

#### String predicates

* `check.string(thing)`:
  Returns `true`
  if `thing` is a string,
  `false` otherwise.

* `check.unemptyString(thing)`:
  Returns `true`
  if `thing` is a non-empty string,
  `false` otherwise.

* `check.contains(thing, substring)`:
  Returns `true`
  if `thing` is a string
  that contains `substring`,
  `false` otherwise.

* `check.match(thing, regex)`:
  Returns `true`
  if `thing` is a string
  that matches `regex`,
  `false` otherwise.

* `check.hasLength(thing, value)`:
  Returns `true`
  if `thing` has a length property
  that equals `value`,
  `false` otherwise.

#### Number predicates

* `check.number(thing)`:
  Returns `true`
  if `thing` is a number,
  `false` otherwise.
  Note that
  `NaN`,
  `Number.POSITIVE_INFINITY` and
  `Number.NEGATIVE_INFINITY`
  are not considered numbers here.

* `check.greater(thing, value)`:
  Returns `true` if `thing` is a number
  greater than `value`,
  `false` otherwise.

* `check.greaterOrEqual(thing, value)`:
  Returns `true` if `thing` is a number
  greater than or equal to `value`,
  `false` otherwise.

* `check.less(thing, value)`:
  Returns `true` if `thing` is a number
  less than `value`,
  `false` otherwise.

* `check.lessOrEqual(thing, value)`:
  Returns `true` if `thing` is a number
  less than or equal to `value`,
  `false` otherwise.

* `check.between(thing, a, b)`:
  Returns `true` if `thing` is a number
  between than `a` and `b`,
  `false` otherwise.
  The arguments `a` and `b`
  may be in any order,
  it doesn't matter
  which is greater.

* `check.inRange(thing, a, b)`:
  Returns `true` if `thing` is a number
  in the range `a` .. `b`,
  `false` otherwise.
  The arguments `a` and `b`
  may be in any order,
  it doesn't matter
  which is greater.

* `check.positive(thing)`:
  Returns `true` if `thing` is a number
  greater than zero,
  `false` otherwise.

* `check.negative(thing)`:
  Returns `true`
  if `thing` is a number
  less than zero,
  `false` otherwise.

* `check.zero(thing)`:
  Returns `true`
  if `thing` is zero,
  `false` otherwise.

* `check.odd(thing)`:
  Returns `true`
  if `thing` is an odd number,
  `false` otherwise.

* `check.even(thing)`:
  Returns `true`
  if `thing` is an even number,
  `false` otherwise.

* `check.integer(thing)`:
  Returns `true`
  if `thing` is an integer,
  `false` otherwise.

#### Boolean predicates

* `check.boolean(thing)`:
  Returns `true`
  if `thing` is a boolean,
  `false` otherwise.

#### Array predicates

* `check.array(thing)`:
  Returns `true`
  if `thing` is an array,
  `false` otherwise.

* `check.emptyArray(thing)`:
  Returns `true`
  if `thing` is an empty array,
  `false` otherwise.

* `check.hasLength(thing, value)`:
  Returns `true`
  if `thing` has a length property
  that equals `value`,
  `false` otherwise.

* `check.arrayLike(thing)`:
  Returns `true`
  if `thing` has a numeric length property,
  `false` otherwise.

* `check.iterable(thing)`:
  Returns `true`
  if `thing` implements the iterable protocol,
  `false` otherwise.
  In pre-ES6 environments,
  this predicate falls back
  to `arrayLike` behaviour.

#### Object predicates

* `check.object(thing)`:
  Returns `true`
  if `thing` is a plain-old JavaScript object,
  `false` otherwise.

* `check.emptyObject(thing)`:
  Returns `true`
  if `thing` is an empty object,
  `false` otherwise.

* `check.instance(thing, prototype)`:
  Returns `true`
  if `thing` is an instance of `prototype`,
  `false` otherwise.

* `check.like(thing, duck)`:
  Duck-typing checker.
  Returns `true`
  if `thing` has all of the properties of `duck`,
  `false` otherwise.

#### Date predicates

* `check.date(thing)`:
  Returns `true`
  if `thing` is a valid date,
  `false` otherwise.

#### Error predicates

* `check.error(thing)`:
  Returns `true`
  if `thing` is an error,
  `false` otherwise.

#### Function predicates

* `check.function(thing)`:
  Returns `true`
  if `thing` is a function,
  `false` otherwise.

* `check.hasLength(thing, value)`:
  Returns `true`
  if `thing` has a length property
  that equals `value`,
  `false` otherwise.

#### Other predicates

* `check.null(thing)`:
  Returns `true`
  if `thing` is `null`,
  `false` otherwise.

* `check.undefined(thing)`:
  Returns `true`
  if `thing` is `undefined`,
  `false` otherwise.

* `check.assigned(thing)`:
  Returns `true`
  if `thing` is not
  `null` or `undefined`,
  `false` otherwise.

#### Modifiers

* `check.not(value)`:
  Returns the negation
  of `value`.

* `check.not.xxx(...)`:
  Returns the negation
  of the predicate.

* `check.maybe(value)`:
  Returns `true`
  if `value` is `null` or `undefined`,
  otherwise it returns `value`.

* `check.maybe.xxx(...)`:
  Returns `true`
  if `thing` is `null` or `undefined`,
  otherwise it propagates
  the return value
  from its predicate.

* `check.either.xxx(...).or.yyy(...)`:
  Returns `true`
  if either predicate is true.
  Returns `false`
  if both predicates are false.

* `check.array.of.xxx(value)`:
  Returns `true`
  if `value` is an array
  and the predicate is true
  for every item.
  Also works with the `not` and `maybe` modifiers.

* `check.arrayLike.of.xxx(thing)`:
  The `arrayLike.of` modifier
  is synonymous with `array.of`,
  except it operates on array-like objects.

* `check.iterable.of.xxx(thing)`:
  The `iterable.of` modifier
  is synonymous with `array.of`,
  except it operates on iterables.

* `check.object.of.xxx(thing)`:
  The `object.of` modifier
  is synonymous with `array.of`,
  except it operates on an object's properties.

* `check.assert(value, message)`:
  Throws an `Error`
  if `value` is `false`,
  setting `message`
  on the `Error` instance.

* `check.assert.xxx(...)`:
  Throws an `Error`
  if the predicate returns false.
  The last argument
  is an optional message
  to be set on the `Error` instance.
  Also works with the `not`, `maybe`, `either` and `...of` modifiers.

#### Batch operations

* `check.apply(things, predicates)`:
  Applies each value from the `things` array
  to the corresponding predicate
  and returns the array of results.
  Passing a single predicate
  instead of an array
  applies all of the values
  to the same predicate.

* `check.map(things, predicates)`:
  Maps each value from the `things` object
  to the corresponding predicate
  and returns an object
  containing the results.
  Supports nested objects.
  Passing a single predicate
  instead of an object
  applies all of the values
  to the same predicate,
  ignore nested objects.

* `check.all(results)`:
  Returns `true`
  if all the result values are true
  in an array (returned from `apply`)
  or object (returned from `map`).

* `check.any(predicateResults)`:
  Returns `true`
  if any result value is true
  in an array (returned from `apply`)
  or object (returned from `map`).

#### Some examples

```javascript
check.even(3);
// Returns false
```

```javascript
check.not.even(3);
// Returns true
```

```javascript
check.maybe.even(null);
// Returns true
```

```javascript
check.either.even(3).or.odd(3);
// Returns true
```

```javascript
check.assert.like({ foo: 'bar' }, { baz: 'qux' }, 'Invalid object');
// Throws new Error('Invalid object')
```

```javascript
check.assert.not.like({ foo: 'bar' }, { baz: 'qux' }, 'Invalid object');
// Doesn't throw
```

```javascript
check.assert.maybe.like(undefined, { foo: 'bar' }, 'Invalid object');
// Doesn't throw
```

```javascript
check.assert(myFunction(), 'Something went wrong');
// Throws if myFunction returns `false`
```

```javascript
check.apply([ 'foo', 'bar', '' ], check.unemptyString);
// Returns [ true, true, false ]
```

```javascript
check.map({
    foo: 2,
    bar: { baz: 'qux' }
}, {
    foo: check.odd,
    bar: { baz: check.unemptyString }
});
// Returns { foo: false, bar: { baz: true } }
```

```javascript
check.all(
    check.map(
        { foo: 0, bar: '' },
        { foo: check.number, bar: check.string }
    );
);
// Returns true
```

```javascript
check.any(
    check.apply(
        [ 1, 2, 3, '' ],
        check.string
    )
);
// Returns true
```

## Where can I use it?

As of version 2.0,
this library no longer supports ES3.
That means you can't use it
in IE 7 or 8.

Everywhere else should be fine.

If those versions of IE
are important to you,
worry not!
The 1.x versions
all support old IE
and any future 1.x versions
will adhere to that too.

See the [releases]
for more information.

## What changed from 2.x to 3.x?

Breaking changes
were made to the API
in version 3.0.0.

Specifically,
the predicate `length`
was renamed to `hasLength`
and the predicate `webUrl`
was removed.

See the [history][history3]
for more details.

## What changed from 1.x to 2.x?

Breaking changes
were made to the API
in version 2.0.0.

Specifically:

* Support for ES3 was dropped
* The predicates `gitUrl`, `email` and `floatNumber` were removed.
* `verify` was renamed to `assert`.
* `nulled` was renamed to `null`.
* `oddNumber` was renamed to `odd`.
* `evenNumber` was renamed to `even`.
* `positiveNumber` was renamed to `positive`.
* `negativeNumber` was renamed to `negative`.
* `intNumber` was renamed to `integer`.
* `bool` was renamed to `boolean`.
* `defined` was swapped to become `undefined`.
* `webUrl` was tightened to reject more cases.

See the [history][history2]
for more details.

## What changed from 0.x to 1.x?

Breaking changes
were made to the API
in version 1.0.0.

Specifically,
all of the predicates
were renamed
from `check.isXxxx`
to `check.xxx` and
all of the verifiers
were renamed
from `check.verifyXxxx`
to `check.verify.xxx`.

See the [history][history1]
for more details.

## How do I set up the build environment?

The build environment relies on
[Node.js][node],
[NPM],
[JSHint],
[Mocha],
[Chai] and
[UglifyJS].
Assuming that you already have Node.js and NPM set up,
you just need to run `npm install` to
install all of the dependencies as listed in `package.json`.

The unit tests are in `test/check-types.js`.
You can run them with the command `npm test`.
To run the tests in a web browser,
open `test/check-types.html`.

## What license is it released under?

[MIT][license]

[ci-image]: https://secure.travis-ci.org/philbooth/check-types.js.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/check-types.js
[releases]: https://github.com/philbooth/check-types.js/releases
[history3]: HISTORY.md#30
[history2]: HISTORY.md#20
[history1]: HISTORY.md#10
[node]: http://nodejs.org/
[npm]: https://npmjs.org/
[jshint]: https://github.com/jshint/node-jshint
[mocha]: http://mochajs.org/
[chai]: http://chaijs.com/
[uglifyjs]: https://github.com/mishoo/UglifyJS
[license]: https://github.com/philbooth/check-types.js/blob/master/COPYING

