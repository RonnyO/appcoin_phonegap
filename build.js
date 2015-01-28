var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var rootdir = process.argv[2];
var configobj = JSON.parse(fs.readFileSync("project.json", 'utf8'));

var target = "stage";
if (process.env.TARGET) {
    target = process.env.TARGET;
}
var config = configobj[target];

function replace_strings_in_file(filename, out_filename, replace_map) {
    var data = fs.readFileSync(filename, 'utf8');
    _.each(replace_map, function (replace_with, to_replace) {
    	data = data.replace(new RegExp(to_replace, "g"), replace_with);
    });
    fs.writeFileSync(out_filename, data, 'utf8');
}

function write_file(filename, contents) {
	fs.writeFileSync(filename, contents, 'utf8');
}

function createConfigXML() {
	replace_strings_in_file('config.xml.template', 'config.xml', {
		_BUNDLE_ID_: config.bundleID,
		_APP_NAME_: config.appName,
		_DESCRIPTION_: config.description,
		_AUTHOR_EMAIL_: config.authorEmail,
		_AUTHOR_NAME_: config.authorName,
		_TARGET_: target
	});
}

function _exec(cmd, callback) {
	console.log(cmd);
	exec(cmd, function (error, stdout, stderr) {
	    if (error !== null) {
	      console.log('exec error: ' + error);
	      return callback(error, null)
	    }
	    console.log('OK');
	    callback(null, null);
	});
}

var PLUGINS = [
	"https://github.com/phonegap-build/StatusBarPlugin.git",
	"https://github.com/phonegap-build/PushPlugin.git",
	"https://github.com/VersoSolutions/CordovaClipboard.git",
	"https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git",
	"https://github.com/ohh2ahh/AppAvailability.git",
	"org.apache.cordova.camera",
	"org.apache.cordova.console",
	"org.apache.cordova.device",
	"org.apache.cordova.file",
	"org.apache.cordova.geolocation",
	"org.apache.cordova.inappbrowser",
	"org.apache.cordova.vibration",
	"io.branchmetrics.branchreferral",
	'lib/phonegap-facebook-plugin-master --variable APP_ID="' + config.facebookAppID + '" --variable APP_NAME="'+ config.facebookAppName +'"',
	'lib/android-referral',
];

async.waterfall([
	function (callback) {
		console.log("Phonegap build tool 0.0.1")
		console.log("***** CLEANING *****");
		_exec("rm -R platforms/android", callback);
	},
	function (unused, callback) {
		_exec("rm -R platforms/ios", callback);
	},
	function (unused, callback) {
		_exec("rm -R plugins", callback);
	},
	function (unused, callback) {
		console.log("***** CREATING PHONEGAP ENVIRONMENT *****");
		console.log("creating config.xml\nOK");
		createConfigXML();
		callback(null, null);
	},
	function (unused, callback) {
		_exec("phonegap platform add ios", callback);
	},
	function (unused, callback) {
		_exec("phonegap platform add android", callback);
	},
	function (unused, callback) {
		console.log("creating platforms/android/ant.properties\nOK");
		write_file("platforms/android/ant.properties", "key.store=../../signing/android/release.keystore\nkey.alias=my_alias");
		callback(null, null);
	},
	function (unused, callback) {
		async.forEachSeries(PLUGINS, function (plugin, callback) {
			_exec("phonegap plugin add " + plugin, callback);
		}, callback);
	}
], function (err) {
	console.log("FINISH: " + (err?err:"OK"));
});