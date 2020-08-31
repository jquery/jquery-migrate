import { jQueryVersionSince } from "../compareVersions.js";
import { migrateWarn, migrateWarnFunc } from "../main.js";

// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

var oldAjax = jQuery.ajax,
	rjsonp = /(=)\?(?=&|$)|\?\?/;

jQuery.ajax = function( ) {
	var jQXHR = oldAjax.apply( this, arguments );

	// Be sure we got a jQXHR (e.g., not sync)
	if ( jQXHR.promise ) {
		migrateWarnFunc( jQXHR, "success", jQXHR.done,
			"jQXHR.success is deprecated and removed" );
		migrateWarnFunc( jQXHR, "error", jQXHR.fail,
			"jQXHR.error is deprecated and removed" );
		migrateWarnFunc( jQXHR, "complete", jQXHR.always,
			"jQXHR.complete is deprecated and removed" );
	}

	return jQXHR;
};

// Only trigger the logic in jQuery <4 as the JSON-to-JSONP auto-promotion
// behavior is gone in jQuery 4.0 and as it has security implications, we don't
// want to restore the legacy behavior.
if ( !jQueryVersionSince( "4.0.0" ) ) {

	// Register this prefilter before the jQuery one. Otherwise, a promoted
	// request is transformed into one with the script dataType and we can't
	// catch it anymore.
	jQuery.ajaxPrefilter( "+json", function( s ) {

		// Warn if JSON-to-JSONP auto-promotion happens.
		if ( s.jsonp !== false && ( rjsonp.test( s.url ) ||
				typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data )
		) ) {
			migrateWarn( "JSON-to-JSONP auto-promotion is deprecated" );
		}
	} );
}

}
