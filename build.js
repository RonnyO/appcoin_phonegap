var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var rootdir = process.argv[2];

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
		_BUNDLE_ID_: 'appcoin.market.test',
		_APP_NAME_: 'MarketTest',
		_DESCRIPTION_: 'Test application',
		_AUTHOR_EMAIL_: 'yotam@appcoin.me',
		_AUTHOR_NAME_: 'Appcoin',
	});
}

function _exec(cmd, callback) {
	console.log("exec: " + cmd);
	exec(cmd, function (error, stdout, stderr) {
	    console.log(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	      return callback(error, null)
	    }
	    callback(null, null);
	});
}

var PLUGINS = [
	"https://github.com/phonegap-build/StatusBarPlugin.git",
	"https://github.com/phonegap-build/PushPlugin.git",
	"https://github.com/VersoSolutions/CordovaClipboard.git",
	"https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git",
	"org.apache.cordova.camera",
	"org.apache.cordova.console",
	"org.apache.cordova.device",
	"org.apache.cordova.file",
	"org.apache.cordova.geolocation",
	"org.apache.cordova.inappbrowser",
	"org.apache.cordova.vibration"
];

async.waterfall([
	function (callback) {
		_exec("rm -R platforms/android", callback);
	},
	function (unused, callback) {
		_exec("rm -R platforms/ios", callback);
	},
	function (unused, callback) {
		_exec("rm -R plugins", callback);
	},
	function (unused, callback) {
		console.log("Creating config.xml");
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
		console.log("Creating platforms/android/ant.properties");
		write_file("platforms/android/ant.properties", "key.store=../../signing/android/release.keystore\nkey.alias=my_alias");
		callback(null, null);
	},
	function (unused, callback) {
		async.forEachSeries(PLUGINS, function (plugin, callback) {
			_exec("phonegap plugin add " + plugin, callback);
		}, callback);
	},
	function (callback) {
		var appID = 139398209567366;
		var appName = "Appcoin Test";
		_exec('phonegap plugin add ./phonegap-facebook-plugin-master --variable APP_ID="' + appID + '" --variable APP_NAME="'+ appName +'"', callback);
	}
], function (err) {
	console.log("FINISH: " + (err?err:"OK"));
});