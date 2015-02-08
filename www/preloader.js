var thePreloader = {
    isMinified: false,
    isTest: false,
	logHistory: [],

    paths: {},
    COMBINED_LIB_JS_FILENAME: null,
    COMBINED_APP_JS_FILENAME: null,
    COMBINED_TEST_JS_FILENAME: null,
    COMBINED_CSS_FILENAME: null,
    VIEW_TEMPLATES_FILENAME: null,
    requireConfigPaths: {},

	deps: {
		'version': {isLoaded: false, elapsed: -1},
        'raven': {isLoaded: false, elapsed: -1},
        'libjs': {isLoaded: false, elapsed: -1},
        'appjs': {isLoaded: false, elapsed: -1},
        'html': {isLoaded: false, elapsed: -1},
        'css': {isLoaded: false, elapsed: -1},
    },

    load: function() {
        var self = this;

        this.timeoutTimer = setTimeout(function() {self._onTimeout();}, 60000);
        this._log('Starting preloader.load at', +new Date() - pageLoadStartTime + 'ms');
        this.startLoadingTime = +new Date();

        if (this.isTest)
            this.deps.testjs = {isLoaded: false, elapsed: -1};

        this._googleAnalyticsInit();
        this._updateProgress();

        this._loadVersionAndSetupRequire(function() {
            self._loadCombinedCSS();
            self._loadRavenAndCombinedLibSrc(function() {
                self._initSentry();
                self._loadCombinedAppSrcAndViewTemplates(function () {
                    if (self.isTest)
                        self._loadCombinedTestSrc(function () {
                            self._onFinish();
                        });
                    else
                        self._onFinish();
                });
            });
        });
    },

    _loadVersionAndSetupRequire: function(callback) {
        var self = this;

        self._loadJSON(STATIC_PATH+"version.json?"+Math.random(), function (err, json) {
            if (err) {
                var message = "Sorry... our service is unavailable currently. Please try again later.";
                return navigator.notification.alert(message, function () {
                    self._loadVersionAndSetupRequire(callback);
                }, "", "Reload");
            }


            var version = json.version;
            self._updateVersion(version);
            self._checkDependency("version", true);

            self.paths = {
                "lib"      : STATIC_PATH+"lib_js_combined.js?"+version,
                "lib.min"  : STATIC_PATH+"lib_js_combined.min.js?"+version,
                "app"      : STATIC_PATH+"app_js_combined.js?"+version,
                "app.min"  : STATIC_PATH+"app_js_combined.min.js?"+version,
                "test"     : STATIC_PATH+"test_js_combined.js?"+version,
                "test.min" : STATIC_PATH+"test_js_combined.min.js?"+version,
                "css"      : STATIC_PATH+"css_combined.css?"+version,
                "css.min"  : STATIC_PATH+"css_combined.min.css?"+version,
                "templates": STATIC_PATH+"view_templates.html?"+version,
                "raven"    : STATIC_PATH+"raven.min-1.1.7.js"
            };

            self.COMBINED_LIB_JS_FILENAME = self.paths[self.isMinified ? "lib.min" : "lib"];
            self.COMBINED_APP_JS_FILENAME = self.paths[self.isMinified ? "app.min" : "app"];
            self.COMBINED_TEST_JS_FILENAME = self.paths[self.isMinified ? "test.min" : "test"];
            self.COMBINED_CSS_FILENAME = self.paths[self.isMinified ? "css.min" : "css"];
            self.VIEW_TEMPLATES_FILENAME = self.paths.templates;

            self.requireConfigPaths = {
                libjs: self.COMBINED_LIB_JS_FILENAME,
                appjs: self.COMBINED_APP_JS_FILENAME,
                html: self.VIEW_TEMPLATES_FILENAME,
                css: self.COMBINED_CSS_FILENAME
            };

            if (self.isTest)
                self.requireConfigPaths.testjs = self.COMBINED_TEST_JS_FILENAME;

            require.config({
                paths: self.requireConfigPaths,
                waitSeconds: 25,
                baseUrl: "",
                map: {
                    '*': {
                        'text': 'require-text-2.0.12'
                    }
                }
            });

            callback();
        })
    },

    _loadCombinedCSS: function() {
        var self = this;
        // the require-css plugin doesn't handle query strings well, so we'll just inject the stylesheet
        var css = document.createElement('link'), hasCssLoaded = false;
        css.rel = 'stylesheet';
        css.href = self.COMBINED_CSS_FILENAME;
        css.onload = function() {
            if(hasCssLoaded) return;
            hasCssLoaded = true;
            self._checkDependency("css", true);
        };
        (document.head || document.documentElement).appendChild(css);
        setTimeout(css.onload, 100); // in case the browser doesn't support 'onload' for link tags, we'll just assume css was loaded
    },

    _loadRavenAndCombinedLibSrc: function(callback) {
        var self = this;
        // ugly workaround so load-image and other libs which check for define.amd won't find it and define themselves as modules
        var _amd = define.amd;
        delete define.amd;
        require([self.paths.raven, self.COMBINED_LIB_JS_FILENAME], function() {
            define.amd = _amd;
            self._checkDependency("raven", true);
            self._checkDependency("libjs", true);
            callback();
        });
    },

    _loadCombinedAppSrcAndViewTemplates: function(callback) {
        var self = this;
        self._initSentry();

        require([self.COMBINED_APP_JS_FILENAME], function(appjsFile) {
            self._checkDependency("appjs", true);

            self._loadText(self.VIEW_TEMPLATES_FILENAME, function (err, viewTemplates) {
                if (err) return alert("Can't get " + self.VIEW_TEMPLATES_FILENAME);

                $('head').append(viewTemplates);
                self._checkDependency('html', true);

                callback();
            });
        });
    },

    _loadCombinedTestSrc: function(callback) {
        require([self.COMBINED_TEST_JS_FILENAME], function(testjsFile) {
            self._checkDependency("testjs", true);
            callback();
        });
    },

    _onFinish: function() {
        if (this.timeoutTimer)
            clearTimeout(this.timeoutTimer);
        var loadingTime = new Date() - this.startLoadingTime;
        ga('preloader.send', 'event', "preloader", "complete", "complete", loadingTime, {'nonInteraction': 1});
        this._log('preloader.finish, total loading time: ' + loadingTime + 'ms, entering main..');

        if (typeof MAIN_HAS_ZERO_ARGS == 'undefined') {
            main(PG_CONFIG.origin, PG_CONFIG.instanceName);
        }
        else
            main();
    },

    _onTimeout: function() {
        this._log('timeout');
        ga('preloader.send', 'event', "preloader", "timeout", "sec", "60", {'nonInteraction': 1});
        if (window.Raven != undefined)
            Raven.captureMessage('load timeout 1', { extra: {status: this._preloaderStatus()} });
    },

    _preloaderStatus: function () {
        var s = "PRELOADER.status";
        for (var depName in this.deps)
            s = s + "," + depName + ":" + this.deps[depName].isLoaded;
        return s;
    },

    _initSentry: function () {
        // var ravenUrl = window.location.host.indexOf("herokuapp.com") != -1 ?
        //         'https://db3addf8d1ff497781e473c6668ab77e@app.getsentry.com/18497':
        //         'https://f6b90e00c7504054a9c3d0cfafea3477@app.getsentry.com/17603';
        // Raven.config(ravenUrl, {}).install();
    },

    _googleAnalyticsInit: function () {
        (function(i,s,o,g,r,a,m){
            i['GoogleAnalyticsObject']=r;
            i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)
            },i[r].l=1*new Date();
            a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];
            a.async=1;
            a.src=g;
            m.parentNode.insertBefore(a,m)
        })(window,document,'script','https//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-42619076-7', 'auto', {'name': 'preloader'}); // Market / Market Client Loading
        ga('preloader.send', 'pageview');
        ga('preloader.send', 'event', "preloader", "version", "<%- serverApiVersion %>", 0, {'nonInteraction': 1});
    },

    _checkDependency: function(depName, conditionFn) {
        if (!(depName in this.deps)) throw Error("unknown dependency");
        var d = this.deps[depName];
        if (!d.isLoaded && conditionFn) {
            var now = +new Date();
            d.elapsed = now - (this.lastLoadedTime || this.startLoadingTime);
            d.isLoaded = true;
            this.lastLoadedTime = now;

            this._log('Loaded', depName, 'in', d.elapsed + 'ms');
            ga('preloader.send', 'event', "preloader", "dependency", depName, d.elapsed, {'nonInteraction': 1});
            this._updateProgress();
            return true;
        }
        return false;
    },

    _updateProgress: function () {
        if (!this.deps) return;
        if (!document.getElementById) return;

        var self = this;
        function getNumLoadedDeps() {
            var numLoaded = 0, depNames = Object.keys(self.deps);
            for (var i=0; i<depNames.length; ++i)
                numLoaded += self.deps[depNames[i]].isLoaded ? 1 : 0;
            return numLoaded;
        }

        var progressTextEl = document.getElementById("progress-text");
        if (!progressTextEl) return;
        progressTextEl.innerHTML=Math.round(100 * getNumLoadedDeps() / Object.keys(this.deps).length) + '%';

        var progressBarEl = document.getElementById("progress-bar");
        if (!progressBarEl) return;
        var totalWidth = 120; // from html above
        progressBarEl.style.width= (totalWidth * getNumLoadedDeps() / Object.keys(this.deps).length) + "px";
    },

    _updateVersion: function (serverApiVersion) {
        var serverApiVersionEl = document.getElementById("serverApiVersion");
        if (!serverApiVersionEl) return;
        serverApiVersionEl.innerHTML= serverApiVersion + " (" + PG_CONFIG.version + ")";
    },

    // TODO - require should be able to do this for me
    _loadText: function(path, callback) {
        var self = this;
        var oXHR = new XMLHttpRequest();
        this._log("_loadText, path: " + path);
        oXHR.open("GET", path, true);
        oXHR.onreadystatechange=function()
        {
            if (oXHR.readyState === 4) {  
                if (oXHR.status === 200) {
                    self._log("Success, response length: " + oXHR.responseText.length);
                    callback(null, oXHR.responseText);
                } else {  
                    self._log("Error: " + oXHR.statusText); 
                    callback(oXHR.statusText, null); 
                }  
            }  
        }
        oXHR.send();    
    },

    _loadJSON: function(path, callback) {
        this._loadText(path, function (err, responseText) {
            if (err) return callback(err, null);
            try {
                return callback(null, JSON.parse(responseText));
            }
            catch (e) {
                return callback("invalid_json", null);
            }
        });
    },

    _log: function (s) {
		this.logHistory.push(s);
	    if (window.marketLog)
	        marketLog(s);
	    else
	        console.log(s);

	    var logOutputEl = document.getElementById("log-output");
	    if (!logOutputEl) return;
	    logOutputEl.innerHTML= this.logHistory.join("\n");
	},
};