(function() {
	var jquery = ( /\bjquery=([\w\.]+)/.exec( document.location.search ) || {} )[1],
		jqfile = "../../jquery/dist/jquery.js",
		usemin = ( /\busemin=([\w\.]+)/.exec( document.location.search ) || {} )[1],
		jcfile = "../dist/jquery-compat.js";

	if ( jquery ) {
		jqfile = "http://code.jquery.com/jquery-" + jquery + ".js";
	}
	if ( usemin ) {
		jcfile = "../dist/jquery-compat.min.js";
	}
	// Prevents a jshint warning about eval-like behavior of document.write
	document["write"]( "<script src='" + jqfile + "'></script>" );
	jQuery.noConflict();
	document["write"]( "<script src='" + jcfile + "'></script>" );
}());