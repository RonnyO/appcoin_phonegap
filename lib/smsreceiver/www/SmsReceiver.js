var cordova = require('cordova');

function SmsReceiver () {}

//Check if the device has a possibility to send and receive SMS
SmsReceiver.prototype.isSupported = function(successCallback,failureCallback) {
    return cordova.exec(successCallback, failureCallback, 'SmsPlugin', 'HasSMSPossibility', []);
};

//Start receiving sms, and the successCallback function receives one string as parameter formatted such as [phonenumber]>[message]
SmsReceiver.prototype.startReception = function(successCallback,failureCallback) {
    return cordova.exec(successCallback, failureCallback, 'SmsPlugin', 'StartReception', []);
};

//Stop receiving sms
SmsReceiver.prototype.stopReception = function(successCallback,failureCallback) {
    return cordova.exec(successCallback, failureCallback, 'SmsPlugin', 'StopReception', []);
};

// Register the plugin
var smsReceiver = new SmsReceiver();
module.exports = smsReceiver;

