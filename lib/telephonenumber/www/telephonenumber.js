var cordova = require('cordova');
var exec = require("cordova/exec");

var TelephoneNumber = function () {};

var TelephoneNumberError = function(code, message) {
    this.code = code || null;
    this.message = message || '';
};

TelephoneNumber.NO_TELEPHONE_NUMBER = 0;

TelephoneNumber.prototype.get = function(success,fail) {
    exec(success,fail,"TelephoneNumber",
        "get",[]);
};

var telephoneNumber = new TelephoneNumber();
module.exports = telephoneNumber;
