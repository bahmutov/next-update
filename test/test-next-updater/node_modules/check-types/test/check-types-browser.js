(function () {
    'use strict';

    var assert = chai.assert;

    suite('check-types.js:', function () {
        test('verifyQuack function is defined', function () {
            assert.isFunction(check.verifyQuack);
        });

        test('verifyQuack with two empty object arguments does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyQuack({}, {});
            });
        });

        test('verifyQuack with foo bar properties throws', function () {
            assert.throws(function () {
                check.verifyQuack({ foo: {} }, { bar: {} });
            });
        });

        test('verifyQuack with foo foo properties does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyQuack({ foo: {} }, { foo: {} });
            });
        });

        test('verifyQuack with bar baz second properties throws', function () {
            assert.throws(function () {
                check.verifyQuack({ foo: {}, bar: {} }, { foo: {}, baz: {} });
            });
        });

        test('verifyQuack with bar bar second properties does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyQuack({ foo: (function () {}), bar: {} }, { foo: (function () {}), bar: {} });
            });
        });

        test('verifyQuack with differently typed bar bar second properties throws', function () {
            assert.throws(function () {
                check.verifyQuack({ foo: (function () {}), bar: {} }, { foo: (function () {}), bar: (function () {}) });
            });
        });

        test('quacksLike function is defined', function () {
            assert.isFunction(check.quacksLike);
        });

        test('quacksLike without arguments throws', function () {
            assert.throws(function () {
                check.quacksLike();
            });
        });

        test('quacksLike with two object arguments does not throw', function () {
            assert.doesNotThrow(function () {
                check.quacksLike({}, {});
            });
        });

        test('quacksLike with function first argument throws', function () {
            assert.throws(function () {
                check.quacksLike(function () {}, {});
            });
        });

        test('quacksLike with null first argument throws', function () {
            assert.throws(function () {
                check.quacksLike(null, {});
            });
        });

        test('quacksLike with function second argument throws', function () {
            assert.throws(function () {
                check.quacksLike({}, function () {});
            });
        });

        test('quacksLike with null second argument throws', function () {
            assert.throws(function () {
                check.quacksLike({}, null);
            });
        });

        test('quacksLike with two empty object arguments returns true', function () {
            assert.isTrue(check.quacksLike({}, {}));
        });

        test('quacksLike with foo bar properties returns false', function () {
            assert.isFalse(check.quacksLike({ foo: {} }, { bar: {} }));
        });

        test('quacksLike with foo foo properties returns true', function () {
            assert.isTrue(check.quacksLike({ foo: {} }, { foo: {} }));
        });

        test('quacksLike with bar baz second properties returns false', function () {
            assert.isFalse(check.quacksLike({ foo: {}, bar: {} }, { foo: {}, baz: {} }));
        });

        test('quacksLike with bar bar second properties returns true', function () {
            assert.isTrue(check.quacksLike({ foo: (function () {}), bar: {} }, { foo: (function () {}), bar: {} }));
        });

        test('quacksLike with differently typed bar bar second properties returns false', function () {
            assert.isFalse(check.quacksLike({ foo: (function () {}), bar: {} }, { foo: (function () {}), bar: (function () {}) }));
        });

        test('verifyInstance with new Error and Error does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyInstance(new Error(), Error);
            });
        });

        test('verifyInstance with object and Error throws', function () {
            assert.throws(function () {
                check.verifyInstance({}, Error);
            });
        });

        test('verifyInstance with null and null throws', function () {
            assert.throws(function () {
                check.verifyInstance(null, null);
            });
        });

        test('verifyInstance with object and Object does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyInstance({}, Object);
            });
        });

        test('verifyInstance with null and Object throws', function () {
            assert.throws(function () {
                check.verifyInstance(null, Object);
            });
        });

        test('verifyInstance with array and Array does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyInstance([], Array);
            });
        });

        test('verifyInstance with Object and object throws', function () {
            assert.throws(function () {
                check.verifyInstance(Object, {});
            });
        });

        test('isInstance function is defined', function () {
            assert.isFunction(check.isInstance);
        });

        test('isInstance with new Error and Error returns true', function () {
            assert.isTrue(check.isInstance(new Error(), Error));
        });

        test('isInstance with object and Error returns false', function () {
            assert.isFalse(check.isInstance({}, Error));
        });

        test('isInstance with null and null returns false', function () {
            assert.isFalse(check.isInstance(null, null));
        });

        test('isInstance with object and Object returns true', function () {
            assert.isTrue(check.isInstance({}, Object));
        });

        test('isInstance with null and Object returns false', function () {
            assert.isFalse(check.isInstance(null, Object));
        });

        test('isInstance with array and Array returns true', function () {
            assert.isTrue(check.isInstance([], Array));
        });

        test('isInstance with Object and object returns false', function () {
            assert.isFalse(check.isInstance(Object, {}));
        });

        test('verifyEmptyObject function is defined', function () {
            assert.isFunction(check.verifyEmptyObject);
        });

        test('verifyEmptyObject with empty object does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyEmptyObject({});
            });
        });

        test('verifyEmptyObject with non-empty object throws', function () {
            assert.throws(function () {
                check.verifyEmptyObject({ foo: 'bar' });
            });
        });

        test('verifyEmptyObject with null throws', function () {
            assert.throws(function () {
                check.verifyEmptyObject(null);
            });
        });

        test('verifyEmptyObject with string throws', function () {
            assert.throws(function () {
                check.verifyEmptyObject('{}');
            });
        });

        test('verifyEmptyObject with array throws', function () {
            assert.throws(function () {
                check.verifyEmptyObject([]);
            });
        });

        test('isEmptyObject function is defined', function () {
            assert.isFunction(check.isEmptyObject);
        });

        test('isEmptyObject with empty object returns true', function () {
            assert.isTrue(check.isEmptyObject({}));
        });

        test('isEmptyObject with empty array returns false', function () {
            assert.isFalse(check.isEmptyObject([]));
        });

        test('isEmptyObject with null returns false', function () {
            assert.isFalse(check.isEmptyObject(null));
        });

        test('isEmptyObject with non-empty object returns false', function () {
            assert.isFalse(check.isEmptyObject({ foo: 'bar' }));
        });

        test('verifyObject function is defined', function () {
            assert.isFunction(check.verifyObject);
        });

        test('verifyObject with object does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyObject({});
            });
        });

        test('verifyObject with null throws', function () {
            assert.throws(function () {
                check.verifyObject(null);
            });
        });

        test('verifyObject with string throws', function () {
            assert.throws(function () {
                check.verifyObject('[]');
            });
        });

        test('verifyObject with array throws', function () {
            assert.throws(function () {
                check.verifyObject([]);
            });
        });

        test('isObject function is defined', function () {
            assert.isFunction(check.isObject);
        });

        test('isObject with object returns true', function () {
            assert.isTrue(check.isObject({}));
        });

        test('isObject with null returns false', function () {
            assert.isFalse(check.isObject(null));
        });

        test('isObject with string returns false', function () {
            assert.isFalse(check.isObject('{}'));
        });

        test('isObject with array returns false', function () {
            assert.isFalse(check.isObject([]));
        });

        test('verifyLength function is defined', function () {
            assert.isFunction(check.verifyLength);
        });

        test('verifyLength with matching undefined length does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyLength({});
            });
        });

        test('verifyLength with contrasting undefined length throws', function () {
            assert.throws(function () {
                check.verifyLength({}, 42);
            });
        });

        test('verifyLength with matching length on array does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyLength([ 1, 2, 3], 3);
            });
        });

        test('verifyLength with contrasting length on array throws', function () {
            assert.throws(function () {
                check.verifyLength([ 2, 3], 3);
            });
        });

        test('verifyLength with matching length on object does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyLength({ length: 4 }, 4);
            });
        });

        test('verifyLength with contrasting length on object throws', function () {
            assert.throws(function () {
                check.verifyLength({ length: 5 }, 4);
            });
        });

        test('isLength function is defined', function () {
            assert.isFunction(check.isLength);
        });

        test('isLength with matching undefined length returns true', function () {
            assert.isTrue(check.isLength({}));
        });

        test('isLength with contrasting undefined length returns false', function () {
            assert.isFalse(check.isLength({}, 7));
        });

        test('isLength with matching length on array returns true', function () {
            assert.isTrue(check.isLength([ 'foo', 'bar' ], 2));
        });

        test('isLength with contrasting length on array returns false', function () {
            assert.isFalse(check.isLength([ 'foo', 'bar', 'baz' ], 2));
        });

        test('isLength with matching length on object returns true', function () {
            assert.isTrue(check.isLength({ length: 1 }, 1));
        });

        test('isLength with contrasting length on object returns false', function () {
            assert.isFalse(check.isLength({ length: 1 }, 2));
        });

        test('verifyArray function is defined', function () {
            assert.isFunction(check.verifyArray);
        });

        test('verifyArray with array does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyArray([]);
            });
        });

        test('verifyArray with null throws', function () {
            assert.throws(function () {
                check.verifyArray(null);
            });
        });

        test('verifyArray with string throws', function () {
            assert.throws(function () {
                check.verifyArray('[]');
            });
        });

        test('verifyArray with object throws', function () {
            assert.throws(function () {
                check.verifyArray({});
            });
        });

        test('isArray function is defined', function () {
            assert.isFunction(check.isArray);
        });

        test('isArray with array returns true', function () {
            assert.isTrue(check.isArray([]));
        });

        test('isArray with null returns false', function () {
            assert.isFalse(check.isArray(null));
        });

        test('isArray with string returns false', function () {
            assert.isFalse(check.isArray('[]'));
        });

        test('isArray with object returns false', function () {
            assert.isFalse(check.isArray({}));
        });

        test('verifyFunction function is defined', function () {
            assert.isFunction(check.verifyFunction);
        });

        test('verifyFunction with function does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyFunction(function () {});
            });
        });

        test('verifyFunction with null throws', function () {
            assert.throws(function () {
                check.verifyFunction(null);
            });
        });

        test('verifyFunction with string throws', function () {
            assert.throws(function () {
                check.verifyFunction('[]');
            });
        });

        test('verifyFunction with object throws', function () {
            assert.throws(function () {
                check.verifyFunction({});
            });
        });

        test('verifyFunction with array throws', function () {
            assert.throws(function () {
                check.verifyFunction([]);
            });
        });

        test('isFunction function is defined', function () {
            assert.isFunction(check.isFunction);
        });

        test('isFunction with function returns true', function () {
            assert.isTrue(check.isFunction(function () {}));
        });

        test('isFunction with null returns false', function () {
            assert.isFalse(check.isFunction(null));
        });

        test('isFunction with string returns false', function () {
            assert.isFalse(check.isFunction('function () {}'));
        });

        test('isFunction with object returns false', function () {
            assert.isFalse(check.isFunction({}));
        });

        test('isFunction with array returns false', function () {
            assert.isFalse(check.isFunction([]));
        });

        test('verifyUnemptyString function is defined', function () {
            assert.isFunction(check.verifyUnemptyString);
        });

        test('verifyUnemptyString with string baz does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyUnemptyString('baz');
            });
        });

        test('verifyUnemptyString with null throws', function () {
            assert.throws(function () {
                check.verifyUnemptyString(null);
            });
        });

        test('verifyUnemptyString with empty string throws', function () {
            assert.throws(function () {
                check.verifyUnemptyString('');
            });
        });

        test('verifyUnemptyString with object throws', function () {
            assert.throws(function () {
                check.verifyUnemptyString({});
            });
        });

        test('verifyUnemptyString with string qux does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyUnemptyString('qux');
            });
        });

        test('isUnemptyString function is defined', function () {
            assert.isFunction(check.isUnemptyString);
        });

        test('isUnemptyString with string foo returns true', function () {
            assert.isTrue(check.isUnemptyString('foo'));
        });

        test('isUnemptyString with null returns false', function () {
            assert.isFalse(check.isUnemptyString(null));
        });

        test('isUnemptyString with empty string returns false', function () {
            assert.isFalse(check.isUnemptyString(''));
        });

        test('isUnemptyString with object returns false', function () {
            assert.isFalse(check.isUnemptyString({}));
        });

        test('isUnemptyString with string bar returns true', function () {
            assert.isTrue(check.isUnemptyString('bar'));
        });

        test('verifyString function is defined', function () {
            assert.isFunction(check.verifyString);
        });

        test('verifyString with string baz does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyString('baz');
            });
        });

        test('verifyString with null throws', function () {
            assert.throws(function () {
                check.verifyString(null);
            });
        });

        test('verifyString with empty string does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyString('');
            });
        });

        test('verifyString with object throws', function () {
            assert.throws(function () {
                check.verifyString({});
            });
        });

        test('isString function is defined', function () {
            assert.isFunction(check.isString);
        });

        test('isString with string foo returns true', function () {
            assert.isTrue(check.isString('foo'));
        });

        test('isString with null returns false', function () {
            assert.isFalse(check.isString(null));
        });

        test('isString with empty string returns true', function () {
            assert.isTrue(check.isString(''));
        });

        test('isString with object returns false', function () {
            assert.isFalse(check.isString({}));
        });

        test('verifyPositiveNumber function is defined', function () {
            assert.isFunction(check.verifyPositiveNumber);
        });

        test('verifyPositiveNumber with positive integer does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyPositiveNumber(1);
            });
        });

        test('verifyPositiveNumber with negative integer throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber(-1);
            });
        });

        test('verifyPositiveNumber with positive fraction does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyPositiveNumber(1/2);
            });
        });

        test('verifyPositiveNumber with negative fraction throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber(-1/2);
            });
        });

        test('verifyPositiveNumber with positive infinity does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyPositiveNumber(Infinity);
            });
        });

        test('verifyPositiveNumber with negative infinity throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber(-Infinity);
            });
        });

        test('verifyPositiveNumber with NaN throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber(NaN);
            });
        });

        test('verifyPositiveNumber with object throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber({});
            });
        });

        test('verifyPositiveNumber with string throws', function () {
            assert.throws(function () {
                check.verifyPositiveNumber('1');
            });
        });

        test('isPositiveNumber function is defined', function () {
            assert.isFunction(check.isPositiveNumber);
        });

        test('isPositiveNumber with positive integer returns true', function () {
            assert.isTrue(check.isPositiveNumber(1));
        });

        test('isPositiveNumber with negative integer returns false', function () {
            assert.isFalse(check.isPositiveNumber(-1));
        });

        test('isPositiveNumber with positive fraction returns true', function () {
            assert.isTrue(check.isPositiveNumber(1/2));
        });

        test('isPositiveNumber with negative fraction returns false', function () {
            assert.isFalse(check.isPositiveNumber(-1/2));
        });

        test('isPositiveNumber with positive infinity returns true', function () {
            assert.isTrue(check.isPositiveNumber(Infinity));
        });

        test('isPositiveNumber with negative infinity returns false', function () {
            assert.isFalse(check.isPositiveNumber(-Infinity));
        });

        test('isPositiveNumber with NaN returns false', function () {
            assert.isFalse(check.isPositiveNumber(NaN));
        });

        test('isPositiveNumber with object returns false', function () {
            assert.isFalse(check.isPositiveNumber({}));
        });

        test('isPositiveNumber with string returns false', function () {
            assert.isFalse(check.isPositiveNumber('1'));
        });

        test('verifyNegativeNumber function is defined', function () {
            assert.isFunction(check.verifyNegativeNumber);
        });

        test('verifyNegativeNumber with positive integer throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber(1);
            });
        });

        test('verifyNegativeNumber with negative integer does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNegativeNumber(-1);
            });
        });

        test('verifyNegativeNumber with positive fraction throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber(1/2);
            });
        });

        test('verifyNegativeNumber with negative fraction does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNegativeNumber(-1/2);
            });
        });

        test('verifyNegativeNumber with positive infinity throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber(Infinity);
            });
        });

        test('verifyNegativeNumber with negative infinity does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNegativeNumber(-Infinity);
            });
        });

        test('verifyNegativeNumber with NaN throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber(NaN);
            });
        });

        test('verifyNegativeNumber with object throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber({});
            });
        });

        test('verifyNegativeNumber with string throws', function () {
            assert.throws(function () {
                check.verifyNegativeNumber('-1');
            });
        });

        test('isNegativeNumber function is defined', function () {
            assert.isFunction(check.isNegativeNumber);
        });

        test('isNegativeNumber with positive integer returns false', function () {
            assert.isFalse(check.isNegativeNumber(1));
        });

        test('isNegativeNumber with negative integer returns true', function () {
            assert.isTrue(check.isNegativeNumber(-1));
        });

        test('isNegativeNumber with positive fraction returns false', function () {
            assert.isFalse(check.isNegativeNumber(1/2));
        });

        test('isNegativeNumber with negative fraction returns true', function () {
            assert.isTrue(check.isNegativeNumber(-1/2));
        });

        test('isNegativeNumber with positive infinity returns false', function () {
            assert.isFalse(check.isNegativeNumber(Infinity));
        });

        test('isNegativeNumber with negative infinity returns true', function () {
            assert.isTrue(check.isNegativeNumber(-Infinity));
        });

        test('isNegativeNumber with NaN returns false', function () {
            assert.isFalse(check.isNegativeNumber(NaN));
        });

        test('isNegativeNumber with object returns false', function () {
            assert.isFalse(check.isNegativeNumber({}));
        });

        test('isNegativeNumber with string returns false', function () {
            assert.isFalse(check.isNegativeNumber('1'));
        });

        test('verifyNumber function is defined', function () {
            assert.isFunction(check.verifyNumber);
        });

        test('verifyNumber with positive integer does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNumber(1);
            });
        });

        test('verifyNumber with negative integer does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNumber(-1);
            });
        });

        test('verifyNumber with fraction does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNumber(1/2);
            });
        });

        test('verifyNumber with positive infinity does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNumber(Infinity);
            });
        });

        test('verifyNumber with negative infinity does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyNumber(-Infinity);
            });
        });

        test('verifyNumber with NaN throws', function () {
            assert.throws(function () {
                check.verifyNumber(NaN);
            });
        });

        test('verifyNumber with object throws', function () {
            assert.throws(function () {
                check.verifyNumber({});
            });
        });

        test('verifyNumber with string throws', function () {
            assert.throws(function () {
                check.verifyNumber('1');
            });
        });

        test('isNumber function is defined', function () {
            assert.isFunction(check.isNumber);
        });

        test('isNumber with positive integer returns true', function () {
            assert.isTrue(check.isNumber(1));
        });

        test('isNumber with negative integer returns true', function () {
            assert.isTrue(check.isNumber(-1));
        });

        test('isNumber with fraction returns true', function () {
            assert.isTrue(check.isNumber(1/2));
        });

        test('isNumber with Infinity returns true', function () {
            assert.isTrue(check.isNumber(Infinity));
        });

        test('isNumber with NaN returns false', function () {
            assert.isFalse(check.isNumber(NaN));
        });

        test('isNumber with object returns false', function () {
            assert.isFalse(check.isNumber({}));
        });

        test('isNumber with string returns false', function () {
            assert.isFalse(check.isNumber('1'));
        });

        test('isOddNumber with string returns false', function () {
            assert.isFalse(check.isOddNumber('1'));
        });

        test('isOddNumber with odd number returns true', function () {
            assert.isTrue(check.isOddNumber(1));
        });

        test('isOddNumber with even number returns false', function () {
            assert.isFalse(check.isOddNumber(2));
        });

        test('isOddNumber with alternative odd number returns true', function () {
            assert.isTrue(check.isOddNumber(3));
        });

        test('isOddNumber with negative odd number returns true', function () {
            assert.isTrue(check.isOddNumber(-5));
        });

        test('isOddNumber with negative even number returns false', function () {
            assert.isFalse(check.isOddNumber(-4));
        });

        test('isOddNumber with floating point number returns false', function () {
            assert.isFalse(check.isEvenNumber(3.5));
        });

        test('verifyOddNumber with odd number does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyOddNumber(-7);
            });
        });

        test('verifyOddNumber with even number throws', function () {
            assert.throws(function () {
                check.verifyOddNumber(8);
            });
        });

        test('isEvenNumber with string returns false', function () {
            assert.isFalse(check.isEvenNumber('2'));
        });

        test('isEvenNumber with odd number returns false', function () {
            assert.isFalse(check.isEvenNumber(1));
        });

        test('isEvenNumber with even number returns true', function () {
            assert.isTrue(check.isEvenNumber(2));
        });

        test('isEvenNumber with alternative even number returns true', function () {
            assert.isTrue(check.isEvenNumber(4));
        });

        test('isEvenNumber with negative odd number returns false', function () {
            assert.isFalse(check.isEvenNumber(-5));
        });

        test('isEvenNumber with negative even number returns true', function () {
            assert.isTrue(check.isEvenNumber(-6));
        });

        test('isEvenNumber with floating point number returns false', function () {
            assert.isFalse(check.isEvenNumber(2.4));
        });

        test('verifyEvenNumber with odd number throws', function () {
            assert.throws(function () {
                check.verifyEvenNumber(7);
            });
        });

        test('verifyEvenNumber with even number does not throw', function () {
            assert.doesNotThrow(function () {
                check.verifyEvenNumber(-8);
            });
        });
    });
}());

