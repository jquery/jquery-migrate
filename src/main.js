import { jQueryVersionSince } from "./compareVersions.js";
import "./disablePatches.js";

( function() {

	// Support: IE9 only
	// IE9 only creates console object when dev tools are first opened
	// IE9 console is a host object, callable but doesn't have .apply()
	if ( !window.console || !window.console.log ) {
		return;
	}

	// Need jQuery 3.0.0+ and no older Migrate loaded
	if ( !jQuery || !jQueryVersionSince( "3.0.0" ) ) {
		window.console.log( "JQMIGRATE: jQuery 3.0.0+ REQUIRED" );
	}
	if ( jQuery.migrateWarnings ) {
		window.console.log( "JQMIGRATE: Migrate plugin loaded multiple times" );
	}

	// Show a message on the console so devs know we're active
	window.console.log( "JQMIGRATE: Migrate is installed" +
		( jQuery.migrateMute ? "" : " with logging active" ) +
		", version " + jQuery.migrateVersion );

} )();

var warnedAbout = {};

// By default each warning is only reported once.
jQuery.migrateDeduplicateWarnings = true;

// List of warnings already given; public read only
jQuery.migrateWarnings = [];

// Set to false to disable traces that appear with warnings
if ( jQuery.migrateTrace === undefined ) {
	jQuery.migrateTrace = true;
}

// Forget any warnings we've already given; public
jQuery.migrateReset = function() {
	warnedAbout = {};
	jQuery.migrateWarnings.length = 0;
};

export function migrateWarn( code, msg ) {
	var console = window.console;
	if ( jQuery.migrateIsPatchEnabled( code ) &&
		( !jQuery.migrateDeduplicateWarnings || !warnedAbout[ msg ] ) ) {
		warnedAbout[ msg ] = true;
		jQuery.migrateWarnings.push( msg + " [" + code + "]" );
		if ( console && console.warn && !jQuery.migrateMute ) {
			console.warn( "JQMIGRATE: " + msg );
			if ( jQuery.migrateTrace && console.trace ) {
				console.trace();
			}
		}
	}
}

export function migrateWarnProp( obj, prop, value, code, msg ) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			migrateWarn( code, msg );
			return value;
		},
		set: function( newValue ) {
			migrateWarn( code, msg );
			value = newValue;
		}
	} );
}

function migrateWarnFuncInternal( obj, prop, newFunc, code, msg ) {
	var finalFunc,
		origFunc = obj[ prop ];

	obj[ prop ] = function() {

		// If `msg` not provided, do not warn; more sophisticated warnings
		// logic is most likely embedded in `newFunc`, in that case here
		// we just care about the logic choosing the proper implementation
		// based on whether the patch is disabled or not.
		if ( msg ) {
			migrateWarn( code, msg );
		}

		// Since patches can be disabled & enabled dynamically, we
		// need to decide which implementation to run on each invocation.
		finalFunc = jQuery.migrateIsPatchEnabled( code ) ?
			newFunc :

			// The function may not have existed originally so we need a fallback.
			( origFunc || jQuery.noop );

		return finalFunc.apply( this, arguments );
	};
}

export function migratePatchAndWarnFunc( obj, prop, newFunc, code, msg ) {
	if ( !msg ) {
		throw new Error( "No warning message provided" );
	}
	return migrateWarnFuncInternal( obj, prop, newFunc, code, msg );
}

export function migratePatchFunc( obj, prop, newFunc, code ) {
	return migrateWarnFuncInternal( obj, prop, newFunc, code );
}

if ( window.document.compatMode === "BackCompat" ) {

	// jQuery has never supported or tested Quirks Mode
	migrateWarn( "quirks", "jQuery is not compatible with Quirks Mode" );
}
