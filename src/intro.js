;(function( factory ) {
	/* jshint browserify:true */
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "jquery" ], window, factory );
	} else if ( typeof module === "object" && module.exports ) {
		// Node/CommonJS
		module.exports = factory( require( "jquery" ), window );
	} else {
		// Browser globals
		factory( jQuery, window );
	}
}(function( jQuery, window ) {
// See http://bugs.jquery.com/ticket/13335
// "use strict";
