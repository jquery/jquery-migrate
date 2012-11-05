/*!
 * jQuery Compat Plugin v@VERSION
 * http://github.com/jquery/jquery-compat/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: @DATE
 */
(function( jQuery, window, undefined ) {
"use strict";

var warnList = {};

var compatWarn = function( msg) {
	// Only warn about a msg once to reduce console clutter
	if ( window.console && console.warn && !warnList[ msg ] ) {
		warnList[ msg ] = true;
		console.warn( "JQCOMPAT: " + msg );
	}
};

var compatWarnProp = function( obj, prop, value, msg ) {
	// On ES5 browsers (non-oldIE), warn if the code tries to get jQuery.browser;
	// allow property to be overwritten in case some other plugin wants it
	if ( Object.defineProperty ) {
		try {
			Object.defineProperty( obj, prop, {
				configurable: true,
				enumerable: true,
				writable: true,
				get: function() {
					compatWarn( msg );
					return value;
				}
			});
		} catch( err ) {
			// IE8 is a dope about Object.defineProperty, can't warn there
		}
	}
};