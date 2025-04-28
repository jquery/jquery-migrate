import {
	migratePatchFunc,
	migratePatchAndInfoFunc,
	migrateWarn
} from "../main.js";

// Support jQuery slim which excludes the deferred module in jQuery 4.0+
if ( jQuery.Deferred ) {

var unpatchedGetStackHookValue,
	oldDeferred = jQuery.Deferred;

migratePatchFunc( jQuery, "Deferred", function( func ) {
	var deferred = oldDeferred(),
		promise = deferred.promise();

	migratePatchAndInfoFunc( deferred, "pipe", deferred.pipe, "deferred-pipe",
		"deferred.pipe() is deprecated" );
	migratePatchAndInfoFunc( promise, "pipe", promise.pipe, "deferred-pipe",
		"deferred.pipe() is deprecated" );

	if ( func ) {
		func.call( deferred, deferred );
	}

	return deferred;
}, "deferred-pipe" );

// Preserve handler of uncaught exceptions in promise chains
jQuery.Deferred.exceptionHook = oldDeferred.exceptionHook;

// Preserve the optional hook to record the error, if defined
jQuery.Deferred.getErrorHook = oldDeferred.getErrorHook;

// We want to mirror jQuery.Deferred.getErrorHook here, so we cannot use
// existing Migrate utils.
Object.defineProperty( jQuery.Deferred, "getStackHook", {
	configurable: true,
	enumerable: true,
	get: function() {
		if ( jQuery.migrateIsPatchEnabled( "deferred-getStackHook" ) ) {
			migrateWarn( "deferred-getStackHook",
				"jQuery.Deferred.getStackHook is removed; use jQuery.Deferred.getErrorHook" );
			return jQuery.Deferred.getErrorHook;
		} else {
			return unpatchedGetStackHookValue;
		}
	},
	set: function( newValue ) {
		if ( jQuery.migrateIsPatchEnabled( "deferred-getStackHook" ) ) {

			// Only warn if `getErrorHook` wasn't set to the same value first.
			if ( jQuery.Deferred.getErrorHook !== newValue ) {
				migrateWarn( "deferred-getStackHook",
					"jQuery.Deferred.getStackHook is removed; use jQuery.Deferred.getErrorHook" );
				jQuery.Deferred.getErrorHook = newValue;
			}
		} else {
			unpatchedGetStackHookValue = newValue;
		}
	}
} );

}
