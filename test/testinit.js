(function( name ) {

	/*
	 * Load a version of jQuery and the plugin based on URL parameters.
	 *
	 *	dev		Uncompressed development version in the project /dist dir
	 *	min		Minified version in the project /dist dir
	 *	VER		Version from code.jquery.com, e.g.: git, 1.8.2.min or 1.7rc1
	 *	else	Full or relative path to be used for script src
	 */
	var jquery = ( /\bjquery=([^&]+)/.exec( document.location.search ) || {} )[1] || "git",
		plugin = ( /\bplugin=([^&]+)/.exec( document.location.search ) || {} )[1] || "dev";

	function include( project, version ) {
		var file = version;
		if ( version === "dev" ) {
			file = "../dist/" + project + ".js";
		} else if ( version === "min" ) {
			file = "../dist/" + project + ".min.js";
		} else if ( /^[\w\.]+$/.test( version ) ) {
			file = "http://code.jquery.com/" + project + "-" + version + ".js";
		}
		// Prevents a jshint warning about eval-like behavior of document.write
		document["write"]( "<script src='" + file + "'></script>" );
	}
	include( "jquery", jquery );
	include( name, plugin );

}("jquery-migrate"));
