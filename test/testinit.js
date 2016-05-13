TestManager = {
	/*
	 * Load a version of a file based on URL parameters.
	 *
	 *	dev		Uncompressed development version: source files in the project /src dir
	 *	min		Minified version in the project /dist dir
	 *	VER		Version from code.jquery.com, e.g.: git, 1.8.2.min or 1.7rc1
	 *	else	Full or relative path to be used for script src
	 */
	loadProject: function( projectName, defaultVersion, isSelf ) {
		var file, i,
			lines = "",
			urlTag = this.projects[ projectName ].urlTag,
			matcher = new RegExp( "\\b" + urlTag + "=([^&]+)" ),
			projectRoot = isSelf ? ".." : "../../" + projectName,
			version = ( matcher.exec( document.location.search ) || {} )[ 1 ] || defaultVersion;

		if ( version === "dev" ) {

			// Order is important
			file = [
				"version",
				"migrate",
				"core",
				"ajax",
				"attributes",
				"css",
				"data",
				"effects",
				"event",
				"offset",
				"serialize",
				"traversing",
				"deferred"
			];

			for ( i = 0; i < file.length; i++ ) {
				file[ i ] = projectRoot + "/src/" + file[ i ] + ".js";
			}
		} else if ( version === "min" ) {
			file = projectRoot + "/dist/" + projectName + ".min.js";
		} else if ( /^[\w\.\-]+$/.test( version ) ) {
			file = "http://code.jquery.com/" + projectName + "-" + version + ".js";
		} else {
			file = version;
		}
		this.loaded.push( {
			projectName: projectName,
			tag: version,
			file: file
		} );

		if ( typeof file === "string" ) {
			document.write( "<script src='" + file + "'></script>" );

		} else {
			for ( i = 0; i < file.length; i++ ) {
				lines += "<script src='" + file[ i ] + "'></script>";
			}

			document.write( lines );
		}
	},
	/**
	 * Iframe tests that require setup not covered in the standard unit test
	 *
	 * Note that options passed into the standard unit tests will also be passed to
	 * the iframe, but the iframe html page is responsible for processing them
	 * as appropriate (for example by calling TestManager.loadProject)
	 */
	runIframeTest: function( title, url, func ) {
		var self = this;
		QUnit.test( title, function( assert ) {
			var iframe,
				query = window.location.search.slice( 1 ),
				done = assert.async();

			self.iframeCallback = function() {
				var args = Array.prototype.slice.call( arguments );

				args.unshift( assert );

				setTimeout( function() {
					self.iframeCallback = undefined;

					func.apply( this, args );
					func = function() {};
					iframe.remove();

					done();
				} );
			};
			iframe = jQuery( "<div/>" )
				.css( { position: "absolute", width: "500px", left: "-600px" } )
				.append( jQuery( "<iframe/>" ).attr( "src", url +
					( query && ( /\?/.test( url ) ? "&" : "?" ) ) + query ) )
				.appendTo( "#qunit-fixture" );
		} );
	},
	iframeCallback: undefined,
	init: function( projects ) {
		var p, project;

		this.projects = projects;
		this.loaded = [];

		// Do QUnit setup if QUnit is loaded (could be an iframe page)
		 if ( !window.QUnit ) {
			return;
		 }

		// Max time for async tests until it aborts test
		// and start()'s the next test.
		QUnit.config.testTimeout = 20 * 1000; // 20 seconds

		// Enforce an "expect" argument or expect() call in all test bodies.
		QUnit.config.requireExpects = true;

		// Set the list of projects, including the project version choices.
		for ( p in projects ) {
			project = projects[ p ];
			QUnit.config.urlConfig.push( {
				label: p,
				id: project.urlTag,
				value: project.choices.split( "," )
			} );
		}
	}
};
TestManager.init( {
	"jquery": {
		urlTag: "jquery",
		choices: "dev,min,git,3.0.0"
	},
	"jquery-migrate": {
		urlTag: "plugin",
		choices: "dev,min,git,3.0.0"
	}
} );

/**
 * Load the TestSwarm listener if swarmURL is in the address.
 */
( function() {
	var url = window.location.search;
	url = decodeURIComponent( url.slice( url.indexOf( "swarmURL=" ) + "swarmURL=".length ) );

	if ( !url || url.indexOf( "http" ) !== 0 ) {
		return;
	}

	document.write( "<scr" + "ipt src='http://swarm.jquery.org/js/inject.js?" +
		( new Date() ).getTime() + "'></scr" + "ipt>" );
} )();

