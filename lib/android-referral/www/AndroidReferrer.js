var cordova = require('cordova');

function AndroidReferrer () {}

AndroidReferrer.prototype.getReferrer = function (text, onSuccess, onFail) {
    if (typeof text === "undefined" || text === null) text = "";
	cordova.exec(onSuccess, onFail, "AndroidReferrer", "getReferrer", [text]);
};

// Register the plugin
var androidReferrer = new AndroidReferrer();
module.exports = androidReferrer;
