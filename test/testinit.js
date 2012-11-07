(function( name ) {
	// Load a version of jQuery and the plugin based on URL parameters
	var jquery = ( /\bjquery=([^&]+)/.exec( document.location.search ) || {} )[1] || "git",
		jqfile = jquery,
		plugin = ( /\bplugin=([^&]+)/.exec( document.location.search ) || {} )[1] || "local",
		pgfile = plugin;

	if ( jquery === "local" ) {
		jqfile = "../../jquery/dist/jquery.js";
	} else if ( /^[\w\.]+$/.test( jquery ) ) {
		jqfile = "http://code.jquery.com/jquery-" + jquery + ".js";
	}

	if ( plugin === "local" ) {
		pgfile = "../dist/" + name + ".js";
	} else if ( plugin === "min" ) {
		pgfile = "../dist/" + name + ".min.js";
	} else if ( /^[\w\.]+$/.test( plugin ) ) {
		pgfile = "http://code.jquery.com/" + name + "-" + plugin + ".js";
	}

	// Prevents a jshint warning about eval-like behavior of document.write
	document["write"]( "<script src='" + jqfile + "'></script>" );
	document["write"]( "<script src='" + pgfile + "'></script>" );
}("jquery-compat"));