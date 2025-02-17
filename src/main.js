import { jQueryVersionSince } from "./compareVersions.js";
import "./disablePatches.js";

( function() {

// Need jQuery 4.x and no older Migrate loaded
if ( !jQuery || !jQueryVersionSince( "4.0.0" ) ||
		jQueryVersionSince( "5.0.0" ) ) {
	window.console.log( "JQMIGRATE: jQuery 4.x REQUIRED" );
}
if ( jQuery.migrateMessages ) {
	window.console.log( "JQMIGRATE: Migrate plugin loaded multiple times" );
}

// Show a message on the console so devs know we're active
window.console.log( "JQMIGRATE: Migrate is installed" +
	( jQuery.migrateMute ? "" : " with logging active" ) +
	", version " + jQuery.migrateVersion );

} )();

var messagesLogged = Object.create( null );

// List of warnings already given; public read only
jQuery.migrateMessages = [];

// By default, each warning is only reported once.
if ( jQuery.migrateDeduplicateMessages === undefined ) {
	jQuery.migrateDeduplicateMessages = true;
}

// Set to `false` to disable traces that appear with warnings
if ( jQuery.migrateTrace === undefined ) {
	jQuery.migrateTrace = true;
}

// Forget any warnings we've already given; public
jQuery.migrateReset = function() {
	messagesLogged = Object.create( null );
	jQuery.migrateMessages.length = 0;
};

function migrateMessageInternal( code, msg, consoleMethod ) {
	var console = window.console;

	if ( jQuery.migrateIsPatchEnabled( code ) &&
		( !jQuery.migrateDeduplicateMessages || !messagesLogged[ msg ] ) ) {
		messagesLogged[ msg ] = true;
		jQuery.migrateMessages.push( consoleMethod.toUpperCase() + ": " +
			msg + " [" + code + "]" );

		if ( console[ consoleMethod ] && !jQuery.migrateMute ) {
			console[ consoleMethod ]( "JQMIGRATE: " + msg );

			if ( jQuery.migrateTrace ) {

				// Label the trace so that filtering messages in DevTools
				// doesn't hide traces. Note that IE ignores the label.
				console.trace( "JQMIGRATE: " + msg );
			}
		}
	}
}

export function migrateWarn( code, msg ) {
	migrateMessageInternal( code, msg, "warn" );
}

export function migrateInfo( code, msg ) {
	migrateMessageInternal( code, msg, "info" );
}

function migrateMessagePropInternal(
	obj, prop, value, code, msg, migrateMessageFn
) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			migrateMessageFn( code, msg );
			return value;
		},
		set: function( newValue ) {
			migrateMessageFn( code, msg );
			value = newValue;
		}
	} );
}

export function migrateWarnProp( obj, prop, value, code, msg ) {
	migrateMessagePropInternal( obj, prop, value, code, msg, migrateWarn );
}

export function migrateInfoProp( obj, prop, value, code, msg ) {
	migrateMessagePropInternal( obj, prop, value, code, msg, migrateInfo );
}

function migrateMessageFuncInternal(
	obj, prop, newFunc, code, msg, migrateMessageFn
) {
	var finalFunc,
		origFunc = obj[ prop ];

	obj[ prop ] = function() {

		// If `msg` not provided, do not warn; more sophisticated warnings
		// logic is most likely embedded in `newFunc`, in that case here
		// we just care about the logic choosing the proper implementation
		// based on whether the patch is disabled or not.
		if ( msg ) {
			migrateMessageFn( code, msg );
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
	return migrateMessageFuncInternal( obj, prop, newFunc, code, msg, migrateWarn );
}

export function migratePatchAndInfoFunc( obj, prop, newFunc, code, msg ) {
	if ( !msg ) {
		throw new Error( "No info message provided" );
	}
	return migrateMessageFuncInternal( obj, prop, newFunc, code, msg, migrateInfo );
}

export function migratePatchFunc( obj, prop, newFunc, code ) {
	return migrateMessageFuncInternal( obj, prop, newFunc, code );
}

if ( window.document.compatMode === "BackCompat" ) {

	// jQuery has never supported or tested Quirks Mode
	migrateWarn( "quirks", "jQuery is not compatible with Quirks Mode" );
}
