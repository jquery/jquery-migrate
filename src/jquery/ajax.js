import { jQueryVersionSince } from "../compareVersions.js";
import { migrateWarn, migratePatchAndWarnFunc, migratePatchFunc } from "../main.js";

// Support jQuery slim which excludes the ajax module
if ( jQuery.ajax ) {

var oldAjax = jQuery.ajax,
	oldCallbacks = [],
	guid = "migrate-" + Date.now(),
	origJsonpCallback = jQuery.ajaxSettings.jsonpCallback,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	rquery = /\?/;

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
if ( jQueryVersionSince( "4.0.0" ) ) {

	// Code mostly from:
	// https://github.com/jquery/jquery/blob/fa0058af426c4e482059214c29c29f004254d9a1/src/ajax/jsonp.js#L20-L97
	jQuery.ajaxPrefilter( "+json", function( s, originalSettings, jqXHR ) {

		if ( !jQuery.migrateIsPatchEnabled( "jsonp-promotion" ) ) {
			return;
		}

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
			migrateWarn( "jsonp-promotion", "JSON-to-JSONP auto-promotion is deprecated" );

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = typeof s.jsonpCallback === "function" ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

					// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && typeof overwritten === "function" ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );
} else {

	// jQuery <4 already contains this prefixer; don't duplicate the whole logic,
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


// Don't trigger the above logic in jQuery >=4 by default as the JSON-to-JSONP
// auto-promotion behavior is gone in jQuery 4.0 and as it has security implications,
// we don't want to restore the legacy behavior by default.
if ( jQueryVersionSince( "4.0.0" ) ) {
	jQuery.migrateDisablePatches( "jsonp-promotion" );
}

}
