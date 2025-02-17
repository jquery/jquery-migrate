import { migrateWarn, migratePatchAndWarnFunc, migratePatchFunc } from "../main.js";

// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

var oldAjax = jQuery.ajax,
	oldCallbacks = [],
	guid = "migrate-" + Date.now(),
	origJsonpCallback = jQuery.ajaxSettings.jsonpCallback,
	rjsonp = /(=)\?(?=&|$)|\?\?/;

migratePatchFunc( jQuery, "ajax", function() {
	var jQXHR = oldAjax.apply( this, arguments );

	// Be sure we got a jQXHR (e.g., not sync)
	if ( jQXHR.promise ) {
		migratePatchAndWarnFunc( jQXHR, "success", jQXHR.done, "jqXHR-methods",
			"jQXHR.success is deprecated and removed" );
		migratePatchAndWarnFunc( jQXHR, "error", jQXHR.fail, "jqXHR-methods",
			"jQXHR.error is deprecated and removed" );
		migratePatchAndWarnFunc( jQXHR, "complete", jQXHR.always, "jqXHR-methods",
			"jQXHR.complete is deprecated and removed" );
	}

	return jQXHR;
}, "jqXHR-methods" );

jQuery.ajaxSetup( {
	jsonpCallback: function() {

		// Source is virtually the same as in Core, but we need to duplicate
		// to maintain a proper `oldCallbacks` reference.
		if ( jQuery.migrateIsPatchEnabled( "jsonp-promotion" ) ) {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( guid++ ) );
			this[ callback ] = true;
			return callback;
		} else {
			return origJsonpCallback.apply( this, arguments );
		}
	}
} );

// Register this prefilter before the jQuery one. Otherwise, a promoted
// request is transformed into one with the script dataType, and we can't
// catch it anymore.
// jQuery <4 already contains this prefilter; don't duplicate the whole logic,
// but only enough to know when to warn.
jQuery.ajaxPrefilter( "+json", function( s ) {

	if ( !jQuery.migrateIsPatchEnabled( "jsonp-promotion" ) ) {
		return;
	}

	// Warn if JSON-to-JSONP auto-promotion happens.
	if ( s.jsonp !== false && ( rjsonp.test( s.url ) ||
			typeof s.data === "string" &&
			( s.contentType || "" )
				.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
			rjsonp.test( s.data )
	) ) {
		migrateWarn( "jsonp-promotion", "JSON-to-JSONP auto-promotion is deprecated" );
	}
} );

}
