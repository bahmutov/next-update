var check = require('check-type');

function test(callback) {
    check.verifyFunction(callback, 'expected callback function');
}

module.exports = test;