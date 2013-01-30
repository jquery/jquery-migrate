
TestManager = {
	/*
	 * Load a version of a file based on URL parameters.
	 *
	 *	dev		Uncompressed development version in the project /dist dir
	 *	min		Minified version in the project /dist dir
	 *	VER		Version from code.jquery.com, e.g.: git, 1.8.2.min or 1.7rc1
	 *	else	Full or relative path to be used for script src
	 */
	loadProject: function( projectName, defaultVersion, isSelf ) {
		var file,
			urlTag = this.projects[ projectName ].urlTag,
			matcher = new RegExp( "\\b" + urlTag + "=([^&]+)" ),
			projectRoot = isSelf ? ".." : "../../" + projectName,
			version = ( matcher.exec( document.location.search ) || {} )[1] || defaultVersion;

		if ( version === "dev" ) {
			file = projectRoot + "/dist/" + projectName + ".js";
		} else if ( version === "min" ) {
			file = projectRoot + "/dist/" + projectName + ".min.js";
		} else if ( /^[\w\.]+$/.test( version ) ) {
			file = "http://code.jquery.com/" + projectName + "-" + version + ".js";
		} else {
			file = version;
		}
		this.loaded.push({
			projectName: projectName,
			tag: version,
			file: file
		});

		// Prevents a jshint warning about eval-like behavior of document.write
		document["write"]( "<script src='" + file + "'></script>" );
	},
	/*
	 *	Set the list of projects, including the project version choices.
	 */
	init: function( projects ) {
		var self = this,
			html = "";

		this.projects = projects;
		this.loaded = [];

		function injectSelects() {
			var i, c, project, tag, choices, toolbar, loaded, elem, selects;

			for ( i = 0; i < self.loaded.length; i++ ) {
				loaded = self.loaded[ i ];
				project = projects[ loaded.projectName ];
				tag = loaded.tag;
				choices = project.choices.split(",");
				if ( choices[ 0 ] !== tag ) {
					choices.unshift( tag );
				}

				html += " " + project.urlTag + ":<select name='" + project.urlTag + "'>";
				for ( c = 0; c < choices.length; c++ ) {
					html += "<option value='" + choices[ c ] + "'" +
						(c ? "" : " selected" ) + ">" + choices[ c ] + "</option>";
				}
				html += "</select>";
			}

			// Reach into QUnit's toolbar to add our selects;
			// if this returns null then our assumptions have failed.
			toolbar = document.getElementById("qunit-testrunner-toolbar");
			toolbar.insertAdjacentHTML( "beforeend", html );

			// Connect the selects so they reload the page with an updated URL
			function updateUrl( e ) {
				var arg = {},
					target = e.target || event.srcElement;
				arg[ target.name ] = target.value;
				window.location = QUnit.url( arg );
			}
			selects = toolbar.getElementsByTagName("select");
			for ( c = 0; c < selects.length; c++ ) {
				elem = selects[ c ];
				if ( elem.addEventListener ) {
					elem.addEventListener( "change", updateUrl, false );
				} else if ( elem.attachEvent ) {
					elem.attachEvent( "onchange", updateUrl );
				}
			}
		}

		// Since we're adding a load handler after QUnit, the toolbar should be present
		if ( window.addEventListener ) {
			window.addEventListener( "load", injectSelects, false );
		} else {
			window.attachEvent( "onload", injectSelects );
		}
	}
};

/**
 * QUnit configuration
 */
// Max time for stop() and asyncTest() until it aborts test
// and start()'s the next test.
QUnit.config.testTimeout = 20 * 1000; // 20 seconds

// Enforce an "expect" argument or expect() call in all test bodies.
QUnit.config.requireExpects = true;

/**
 * Load the TestSwarm listener if swarmURL is in the address.
 */
(function() {
	var url = window.location.search;
	url = decodeURIComponent( url.slice( url.indexOf("swarmURL=") + "swarmURL=".length ) );

	if ( !url || url.indexOf("http") !== 0 ) {
		return;
	}

	document.write("<scr" + "ipt src='http://swarm.jquery.org/js/inject.js?" + (new Date()).getTime() + "'></scr" + "ipt>");
})();

