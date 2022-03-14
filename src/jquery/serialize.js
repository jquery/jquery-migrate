import { migratePatchFunc, migrateWarn } from "../main.js";
import "../disablePatches.js";

// Support jQuery slim which excludes the ajax module
// The jQuery.param patch is about respecting `jQuery.ajaxSettings.traditional`
// so it doesn't make sense for the slim build.
if ( jQuery.ajax ) {

var origParam = jQuery.param;

migratePatchFunc( jQuery, "param", function( data, traditional ) {
	var ajaxTraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;

	if ( traditional === undefined && ajaxTraditional ) {

		migrateWarn( "param-ajax-traditional",
			"jQuery.param() no longer uses jQuery.ajaxSettings.traditional" );
		traditional = ajaxTraditional;
	}

	return origParam.call( this, data, traditional );
}, "param-ajax-traditional" );

}
