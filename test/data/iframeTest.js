"use strict";

/*
 * Iframe-based unit tests support
 * Load this file immediately after jQuery, before jQuery Migrate
 */

// Support: IE9 only (no console at times)
if ( !window.console ) {
	window.console = {};
}

// Capture output so the test in the parent window can inspect it, and so the
// initialization for the iframe doesn't show another Migrate startup header.
var logOutput = "";

window.console.log = function() {
	logOutput += Array.prototype.join.call( arguments, " " ) + "\n";
};

// Callback gets ( jQuery, window, document, log [, startIframe args ] )
window.startIframeTest = function() {
	var args = Array.prototype.slice.call( arguments );

	// Note: jQuery may be undefined if page did not load it
	args.unshift( window.jQuery, window, document, logOutput );
	window.parent.TestManager.iframeCallback.apply( null, args );
};
