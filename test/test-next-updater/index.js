var check = require('check-types');
// using old check verifyString api on purpose
check.verifyString('this is test string, works check-types < 1.0.0');
console.log('works');
