import { migrateWarn } from "../main.js";

// Support jQuery slim which excludes the ajax module
// The jQuery.param patch is about respecting `jQuery.ajaxSettings.traditional`
// so it doesn't make sense for the slim build.
if ( jQuery.ajax ) {

var oldParam = jQuery.param;

jQuery.param = function( data, traditional ) {
	var ajaxTraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;

	if ( traditional === undefined && ajaxTraditional ) {

		migrateWarn( "jQuery.param() no longer uses jQuery.ajaxSettings.traditional" );
		traditional = ajaxTraditional;
	}

	return oldParam.call( this, data, traditional );
};

}
