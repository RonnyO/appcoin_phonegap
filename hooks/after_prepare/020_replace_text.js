#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files
//
// Look for the string CONFIGURE HERE for areas that need configuration
//

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
    var data = fs.readFileSync(filename, 'utf8');

    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
}

var target = "stage";
if (process.env.TARGET) {
    target = process.env.TARGET;
}

if (rootdir) {
    var ourconfigfile = path.join(rootdir, "project.json");
    var configobj = JSON.parse(fs.readFileSync(ourconfigfile, 'utf8'));

    var filestoreplace = [
        // android
        "platforms/android/assets/www/app.html",
        // ios
        "platforms/ios/www/app.html",
    ];

    filestoreplace.forEach(function(val, index, array) {
        var fullfilename = path.join(rootdir, val);

        if (fs.existsSync(fullfilename)) {
            replace_string_in_file(fullfilename, "_AC_PROTOCOL_AC_", configobj[target].protocol);
            replace_string_in_file(fullfilename, "_AC_HOST_AC_", configobj[target].host);
            replace_string_in_file(fullfilename, "_AC_MARKETNAME_AC_", configobj[target].marketName);
            replace_string_in_file(fullfilename, "_AC_BUNDLEID_AC_", configobj[target].bundleID)
        } else {
            //console.log("missing: "+fullfilename);
        }
    });

}
